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
    private final ObjectMapper objectMapper;

    @Transactional
    public RouteResponse createRoute(RouteRequest request) {
        User user = getCurrentUser();

        // A* 알고리즘으로 최적 경로 계산 (계절 모드 적용)
        AStarPathfinder.PathResult pathResult = pathfinder.findOptimalPath(
            request.getStartLat(), request.getStartLng(),
            request.getEndLat(), request.getEndLng(),
            user.getPreferShade(),
            user.getAvoidHeat(),
            user.getSeasonMode()  // 계절 모드 전달
        );

        // GeoJSON 형식으로 경로 데이터 변환
        String geoJson = convertToGeoJson(pathResult);

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
            .distance(pathResult.getTotalDistance())
            .estimatedTime(pathResult.getEstimatedTime())
            .shadeRatio(pathResult.getShadeRatio())
            .heatExposure(pathResult.getHeatExposure())
            .shelterCount(0)  // TODO: 경로 상 대피시설 수 계산
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
                .map(node -> new double[]{node.getLng(), node.getLat()})
                .collect(Collectors.toList());

            geoJson.put("coordinates", coordinates);

            return objectMapper.writeValueAsString(geoJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("GeoJSON 변환 실패", e);
        }
    }
}
