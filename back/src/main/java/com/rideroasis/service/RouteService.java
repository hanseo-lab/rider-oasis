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

        // FASTEST ?먮뒗 COMFORT 紐⑤뱶??TMAP ?ъ슜 (?ㅼ젣 ?꾨줈)
        if (request.getRouteType() == Route.RouteType.FASTEST || request.getRouteType() == Route.RouteType.COMFORT) {
            try {
                TMapService.TMapRouteResult tMapResult = tMapService.getPedestrianRoute(
                        request.getStartLat(), request.getStartLng(),
                        request.getEndLat(), request.getEndLng());

                geoJson = convertTMapPathToGeoJson(tMapResult.getPath());
                distance = tMapResult.getTotalDistance();
                estimatedTime = tMapResult.getTotalTime();

            } catch (Exception e) {
                // TMAP ?ㅽ뙣 ??A* ?대갚
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
            // SHADE_OPTIMIZED ?깆? 湲곗〈 A* ?뚭퀬由ъ쬁 ?ъ슜
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

        // Route ?뷀떚???앹꽦
        Route route = Route.builder()
                .user(user.getId() != null ? user : null) // ID媛 ?덈뒗 ?ъ슜?먮쭔 ?ㅼ젙
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
                .shelterCount(0) // TODO: 寃쎈줈 ????쇱떆????怨꾩궛
                .routeType(request.getRouteType())
                .build();

        // 濡쒓렇?명븳 ?ъ슜?먮쭔 DB?????
        if (user != null && user.getId() != null) {
            route = routeRepository.save(route);
        }
        
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
                .orElseThrow(() -> new RuntimeException("寃쎈줈瑜?李얠쓣 ???놁뒿?덈떎."));

        // 沅뚰븳 泥댄겕
        User user = getCurrentUser();
        if (!route.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("?묎렐 沅뚰븳???놁뒿?덈떎.");
        }

        return RouteResponse.fromEntity(route);
    }

    @Transactional
    public void deleteRoute(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("寃쎈줈瑜?李얠쓣 ???놁뒿?덈떎."));

        User user = getCurrentUser();
        if (!route.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("?묎렐 沅뚰븳???놁뒿?덈떎.");
        }

        routeRepository.delete(route);
    }

    @Transactional
    public RouteResponse toggleFavorite(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("寃쎈줈瑜?李얠쓣 ???놁뒿?덈떎."));

        User user = getCurrentUser();
        if (!route.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("?묎렐 沅뚰븳???놁뒿?덈떎.");
        }

        route.setIsFavorite(!route.getIsFavorite());
        route = routeRepository.save(route);

        return RouteResponse.fromEntity(route);
    }

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            // ?듬챸 ?ъ슜?먮? ?꾪븳 湲곕낯 User 媛앹껜 諛섑솚 (ID??null)
            return User.builder()
                    .username("anonymous")
                    .email("anonymous@rideroasis.com")
                    .seasonMode(User.SeasonMode.AUTO)
                    .preferShade(true)
                    .avoidHeat(true)
                    .build();
        }
        String emailOrUsername = authentication.getName();

        // email濡?癒쇱? 議고쉶, ?놁쑝硫?username?쇰줈 議고쉶
        return userRepository.findByEmail(emailOrUsername)
                .orElseGet(() -> userRepository.findByUsername(emailOrUsername)
                        .orElseThrow(() -> new RuntimeException("?ъ슜?먮? 李얠쓣 ???놁뒿?덈떎: " + emailOrUsername)));
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
            throw new RuntimeException("GeoJSON 蹂???ㅽ뙣", e);
        }
    }

    private String convertTMapPathToGeoJson(List<double[]> path) {
        try {
            Map<String, Object> geoJson = new HashMap<>();
            geoJson.put("type", "LineString");
            geoJson.put("coordinates", path);
            return objectMapper.writeValueAsString(geoJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("GeoJSON 蹂???ㅽ뙣", e);
        }
    }
}



