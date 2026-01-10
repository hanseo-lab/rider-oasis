package com.rideroasis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rideroasis.algorithm.AStarPathfinder;
import com.rideroasis.dto.request.RouteRequest;
import com.rideroasis.dto.response.RouteResponse;
import com.rideroasis.entity.Route;
import com.rideroasis.entity.User;
import com.rideroasis.repository.RouteRepository;
import com.rideroasis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final AStarPathfinder pathfinder;
    private final TMapService tMapService;
    private final ObjectMapper objectMapper;

    @Transactional
    public RouteResponse createRoute(RouteRequest request) {
        User user = getCurrentUser();

        String geoJson;
        double distance;
        int estimatedTime;
        double shadeRatio = 0.0;
        double heatExposure = 0.0;

        // FASTEST 또는 COMFORT 모드는 TMAP 사용 (실제 도로)
        if (request.getRouteType() == Route.RouteType.FASTEST || request.getRouteType() == Route.RouteType.COMFORT) {
            try {
                TMapService.TMapRouteResult tMapResult = tMapService.getPedestrianRoute(
                        request.getStartLat(), request.getStartLng(),
                        request.getEndLat(), request.getEndLng());

                geoJson = convertTMapPathToGeoJson(tMapResult.getPath());
                distance = tMapResult.getTotalDistance();
                estimatedTime = tMapResult.getTotalTime();

            } catch (Exception e) {
                // TMAP 실패 시 A* 폴백
                AStarPathfinder.PathResult pathResult = pathfinder.findOptimalPath(
                        request.getStartLat(), request.getStartLng(),
                        request.getEndLat(), request.getEndLng(),
                        false, false, user.getSeasonMode());
                geoJson = convertToGeoJson(pathResult);
                distance = pathResult.getTotalDistance();
                estimatedTime = pathResult.getEstimatedTime();
                shadeRatio = pathResult.getShadeRatio();
                heatExposure = pathResult.getHeatExposure();
            }
        } else {
            // SHADE_OPTIMIZED 등은 기존 A* 알고리즘 사용
            AStarPathfinder.PathResult pathResult = pathfinder.findOptimalPath(
                    request.getStartLat(), request.getStartLng(),
                    request.getEndLat(), request.getEndLng(),
                    user.getPreferShade(),
                    user.getAvoidHeat(),
                    user.getSeasonMode());
            geoJson = convertToGeoJson(pathResult);
            distance = pathResult.getTotalDistance();
            estimatedTime = pathResult.getEstimatedTime();
            shadeRatio = pathResult.getShadeRatio();
            heatExposure = pathResult.getHeatExposure();
        }

        // Route 엔티티 생성
        Route route = Route.builder()
                .user(user)
                .routeName(request.getRouteName())
                .startLat(request.getStartLat())
                .startLng(request.getStartLng())
                .startAddress(request.getStartAddress())
                .endLat(request.getEndLat())
                .endLng(request.getEndLng())
                .endAddress(request.getEndAddress())
                .pathGeoJson(geoJson)
                .distance(distance)
                .estimatedTime(estimatedTime)
                .shadeRatio(shadeRatio)
                .heatExposure(heatExposure)
                .shelterCount(0) // TODO: 경로 상 대피시설 수 계산
                .routeType(request.getRouteType())
                .build();

        route = routeRepository.save(route);

        return RouteResponse.fromEntity(route);
    }

    @Transactional(readOnly = true)
    public List<RouteResponse> getMyRoutes() {
        User user = getCurrentUser();
        return routeRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(RouteResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RouteResponse getRouteById(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("경로를 찾을 수 없습니다."));

        // 권한 체크
        User user = getCurrentUser();
        if (!route.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("접근 권한이 없습니다.");
        }

        return RouteResponse.fromEntity(route);
    }

    @Transactional
    public void deleteRoute(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("경로를 찾을 수 없습니다."));

        User user = getCurrentUser();
        if (!route.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("접근 권한이 없습니다.");
        }

        routeRepository.delete(route);
    }

    @Transactional
    public RouteResponse toggleFavorite(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("경로를 찾을 수 없습니다."));

        User user = getCurrentUser();
        if (!route.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("접근 권한이 없습니다.");
        }

        route.setIsFavorite(!route.getIsFavorite());
        route = routeRepository.save(route);

        return RouteResponse.fromEntity(route);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private String convertToGeoJson(AStarPathfinder.PathResult pathResult) {
        try {
            Map<String, Object> geoJson = new HashMap<>();
            geoJson.put("type", "LineString");

            List<double[]> coordinates = pathResult.getPath().stream()
                    .map(node -> new double[] { node.getLng(), node.getLat() })
                    .collect(Collectors.toList());

            geoJson.put("coordinates", coordinates);

            return objectMapper.writeValueAsString(geoJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("GeoJSON 변환 실패", e);
        }
    }

    private String convertTMapPathToGeoJson(List<double[]> path) {
        try {
            Map<String, Object> geoJson = new HashMap<>();
            geoJson.put("type", "LineString");
            geoJson.put("coordinates", path);
            return objectMapper.writeValueAsString(geoJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("GeoJSON 변환 실패", e);
        }
    }
}
