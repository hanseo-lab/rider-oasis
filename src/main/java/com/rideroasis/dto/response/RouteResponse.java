package com.rideroasis.dto.response;

import com.rideroasis.entity.Route;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteResponse {
    private Long id;
    private String routeName;
    private Double startLat;
    private Double startLng;
    private String startAddress;
    private Double endLat;
    private Double endLng;
    private String endAddress;
    private String pathGeoJson;
    private Double distance;
    private Integer estimatedTime;
    private Double shadeRatio;
    private Double heatExposure;
    private Integer shelterCount;
    private Route.RouteType routeType;
    private Boolean isFavorite;
    private LocalDateTime createdAt;

    public static RouteResponse fromEntity(Route route) {
        return RouteResponse.builder()
            .id(route.getId())
            .routeName(route.getRouteName())
            .startLat(route.getStartLat())
            .startLng(route.getStartLng())
            .startAddress(route.getStartAddress())
            .endLat(route.getEndLat())
            .endLng(route.getEndLng())
            .endAddress(route.getEndAddress())
            .pathGeoJson(route.getPathGeoJson())
            .distance(route.getDistance())
            .estimatedTime(route.getEstimatedTime())
            .shadeRatio(route.getShadeRatio())
            .heatExposure(route.getHeatExposure())
            .shelterCount(route.getShelterCount())
            .routeType(route.getRouteType())
            .isFavorite(route.getIsFavorite())
            .createdAt(route.getCreatedAt())
            .build();
    }
}
