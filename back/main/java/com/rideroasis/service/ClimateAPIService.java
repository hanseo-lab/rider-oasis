package com.rideroasis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * 경기기후플랫폼 API 통합 서비스
 * API 문서: https://climate.gg.go.kr
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ClimateAPIService {

    private static final String API_BASE_URL = "https://climate.gg.go.kr/ols/api/geoserver/wfs";
    private static final String API_KEY = "4c58df36-82b2-40b2-b360-6450cca44b1e";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    // 캐시 (간단한 메모리 캐시)
    private final Map<String, CachedData> cache = new HashMap<>();
    private static final long CACHE_DURATION = 3600000; // 1시간

    /**
     * 특정 위치의 그늘 점수 계산 (공원/녹지 데이터 기반)
     */
    public double getShadeScore(double lat, double lng, double radius) {
        try {
            // 주변 공원 데이터 조회
            JsonNode parks = queryNearbyFeatures("park", lat, lng, radius);
            JsonNode vegetation = queryNearbyFeatures("biotop_type_evl_5grd", lat, lng, radius);

            int totalFeatures = 0;
            if (parks != null && parks.has("features")) {
                totalFeatures += parks.get("features").size();
            }
            if (vegetation != null && vegetation.has("features")) {
                totalFeatures += vegetation.get("features").size();
            }

            // 0.0 ~ 1.0 점수로 정규화 (주변에 녹지가 많을수록 높음)
            return Math.min(1.0, totalFeatures / 10.0);

        } catch (Exception e) {
            log.warn("그늘 점수 계산 실패 (lat: {}, lng: {}): {}", lat, lng, e.getMessage());
            return 0.5; // 기본값
        }
    }

    /**
     * 특정 위치의 폭염 위험도 계산 (건물 탄소 배출량 기반)
     */
    public double getHeatScore(double lat, double lng, double radius) {
        try {
            // 주변 건물 배출량 데이터 조회
            JsonNode buildings = queryNearbyFeatures("bldg_gas_cbn_ehqty", lat, lng, radius);

            if (buildings == null || !buildings.has("features")) {
                return 0.3; // 기본값
            }

            double totalEmission = 0;
            int count = 0;

            for (JsonNode feature : buildings.get("features")) {
                JsonNode properties = feature.get("properties");
                if (properties != null && properties.has("cbn_ehqty")) {
                    totalEmission += properties.get("cbn_ehqty").asDouble(0);
                    count++;
                }
            }

            if (count == 0) return 0.3;

            // 평균 배출량을 0.0 ~ 1.0 점수로 정규화
            double avgEmission = totalEmission / count;
            return Math.min(1.0, avgEmission / 10000.0); // 임계값 조정 가능

        } catch (Exception e) {
            log.warn("폭염 점수 계산 실패 (lat: {}, lng: {}): {}", lat, lng, e.getMessage());
            return 0.5;
        }
    }

    /**
     * 주변 무더위 쉼터 조회 (여름용)
     */
    public List<ShelterInfo> getHeatShelters(double lat, double lng, double radiusKm) {
        return getShelters("dsvctm_tmpr_hab_fclt", lat, lng, radiusKm);
    }

    /**
     * 주변 한파 쉼터 조회 (겨울용)
     * TODO: 실제 한파 쉼터 레이어명으로 교체
     */
    public List<ShelterInfo> getColdShelters(double lat, double lng, double radiusKm) {
        // 한파 쉼터 데이터가 별도로 없다면 같은 시설 사용
        return getShelters("dsvctm_tmpr_hab_fclt", lat, lng, radiusKm);
    }

    /**
     * 경사도 데이터 (DEM - Digital Elevation Model)
     * TODO: 경기기후 API에 경사도 레이어가 있다면 활용
     */
    public double getSlopeRisk(double lat, double lng) {
        // 현재는 임시로 랜덤값 반환 (실제 DEM 데이터 필요)
        return Math.random() * 0.5;
    }

    /**
     * 쉼터 조회 공통 메서드
     */
    private List<ShelterInfo> getShelters(String layerName, double lat, double lng, double radiusKm) {
        List<ShelterInfo> shelters = new ArrayList<>();

        try {
            JsonNode features = queryNearbyFeatures(layerName, lat, lng, radiusKm);

            if (features != null && features.has("features")) {
                for (JsonNode feature : features.get("features")) {
                    JsonNode geometry = feature.get("geometry");
                    JsonNode properties = feature.get("properties");

                    if (geometry != null && properties != null) {
                        JsonNode coordinates = geometry.get("coordinates");

                        double shelterLat = 0, shelterLng = 0;
                        if (coordinates.isArray() && coordinates.size() >= 2) {
                            shelterLng = coordinates.get(0).asDouble();
                            shelterLat = coordinates.get(1).asDouble();
                        }

                        ShelterInfo shelter = new ShelterInfo();
                        shelter.setLat(shelterLat);
                        shelter.setLng(shelterLng);
                        shelter.setName(properties.has("fclt_nm") ?
                            properties.get("fclt_nm").asText() : "쉼터");
                        shelter.setType(properties.has("fclt_se_nm") ?
                            properties.get("fclt_se_nm").asText() : "기타");
                        shelter.setCapacity(properties.has("actc_ppltn_cnt") ?
                            properties.get("actc_ppltn_cnt").asInt() : 0);

                        shelters.add(shelter);
                    }
                }
            }
        } catch (Exception e) {
            log.error("쉼터 조회 실패: {}", e.getMessage());
        }

        return shelters;
    }

    /**
     * 주변 피처 조회 (WFS GetFeature)
     */
    private JsonNode queryNearbyFeatures(String layerName, double lat, double lng, double radiusKm) {
        String cacheKey = String.format("%s_%.4f_%.4f_%.2f", layerName, lat, lng, radiusKm);

        // 캐시 확인
        CachedData cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.getData();
        }

        try {
            // Bounding Box 계산 (대략적)
            double latDelta = radiusKm / 111.0; // 1도 ≈ 111km
            double lngDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(lat)));

            double minLat = lat - latDelta;
            double maxLat = lat + latDelta;
            double minLng = lng - lngDelta;
            double maxLng = lng + lngDelta;

            String bbox = String.format("%f,%f,%f,%f", minLng, minLat, maxLng, maxLat);

            String url = String.format(
                "%s?apiKey=%s&service=WFS&version=1.1.0&request=GetFeature&typeName=%s&outputFormat=application/json&bbox=%s&srsName=EPSG:4326&maxFeatures=50",
                API_BASE_URL, API_KEY, layerName, bbox
            );

            String response = restTemplate.getForObject(url, String.class);
            JsonNode data = objectMapper.readTree(response);

            // 캐시 저장
            cache.put(cacheKey, new CachedData(data));

            return data;

        } catch (Exception e) {
            log.error("API 조회 실패 (layer: {}, lat: {}, lng: {}): {}",
                layerName, lat, lng, e.getMessage());
            return null;
        }
    }

    /**
     * 쉼터 정보 DTO
     */
    public static class ShelterInfo {
        private double lat;
        private double lng;
        private String name;
        private String type;
        private int capacity;

        // Getters & Setters
        public double getLat() { return lat; }
        public void setLat(double lat) { this.lat = lat; }
        public double getLng() { return lng; }
        public void setLng(double lng) { this.lng = lng; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }
    }

    /**
     * 캐시 데이터
     */
    private static class CachedData {
        private final JsonNode data;
        private final long timestamp;

        public CachedData(JsonNode data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }

        public JsonNode getData() { return data; }

        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_DURATION;
        }
    }
}
