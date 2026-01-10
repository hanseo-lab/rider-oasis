package com.rideroasis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TMapService {

    @Value("${tmap.api.key}")
    private String apiKey;

    private static final String TMAP_PEDESTRIAN_URL = "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    public TMapRouteResult getPedestrianRoute(double startLat, double startLng, double endLat, double endLng) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("appKey", apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("startX", startLng);
            body.put("startY", startLat);
            body.put("endX", endLng);
            body.put("endY", endLat);
            body.put("reqCoordType", "WGS84GEO");
            body.put("resCoordType", "WGS84GEO");
            body.put("startName", "출발지");
            body.put("endName", "도착지");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(TMAP_PEDESTRIAN_URL, request, String.class);
            JsonNode root = objectMapper.readTree(response);

            List<double[]> path = new ArrayList<>();
            int totalDistance = 0;
            int totalTime = 0;

            if (root.has("features")) {
                for (JsonNode feature : root.get("features")) {
                    JsonNode geometry = feature.get("geometry");
                    JsonNode properties = feature.get("properties");

                    // 거리 및 시간 합산 (Point 타입의 feature에만 total 정보가 있을 수 있음)
                    if (properties.has("totalDistance")) {
                        totalDistance = properties.get("totalDistance").asInt();
                    }
                    if (properties.has("totalTime")) {
                        totalTime = properties.get("totalTime").asInt();
                    }

                    // 경로 좌표 추출 based on geometry type
                    String type = geometry.get("type").asText();
                    JsonNode coordinates = geometry.get("coordinates");

                    if ("Point".equals(type)) {
                        path.add(new double[] { coordinates.get(0).asDouble(), coordinates.get(1).asDouble() });
                    } else if ("LineString".equals(type)) {
                        for (JsonNode coord : coordinates) {
                            path.add(new double[] { coord.get(0).asDouble(), coord.get(1).asDouble() });
                        }
                    }
                }
            }

            return new TMapRouteResult(path, totalDistance, totalTime);

        } catch (Exception e) {
            log.error("TMAP API Error", e);
            throw new RuntimeException("경로 탐색 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class TMapRouteResult {
        private List<double[]> path;
        private int totalDistance; // meters
        private int totalTime; // seconds
    }
}
