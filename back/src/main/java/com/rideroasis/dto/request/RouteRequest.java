package com.rideroasis.dto.request;

import com.rideroasis.entity.Route;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequest {

    @NotBlank(message = "경로 이름은 필수입니다")
    private String routeName;

    @NotNull(message = "출발지 위도는 필수입니다")
    private Double startLat;

    @NotNull(message = "출발지 경도는 필수입니다")
    private Double startLng;

    private String startAddress;

    @NotNull(message = "도착지 위도는 필수입니다")
    private Double endLat;

    @NotNull(message = "도착지 경도는 필수입니다")
    private Double endLng;

    private String endAddress;

    private Route.RouteType routeType = Route.RouteType.SHADE_OPTIMIZED;
}
