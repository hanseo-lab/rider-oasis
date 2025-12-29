package com.rideroasis.controller;

import com.rideroasis.dto.request.RouteRequest;
import com.rideroasis.dto.response.ApiResponse;
import com.rideroasis.dto.response.RouteResponse;
import com.rideroasis.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @PostMapping
    public ResponseEntity<ApiResponse<RouteResponse>> createRoute(@Valid @RequestBody RouteRequest request) {
        try {
            RouteResponse response = routeService.createRoute(request);
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("경로 생성 성공", response));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RouteResponse>>> getMyRoutes() {
        try {
            List<RouteResponse> routes = routeService.getMyRoutes();
            return ResponseEntity.ok(ApiResponse.success(routes));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{routeId}")
    public ResponseEntity<ApiResponse<RouteResponse>> getRouteById(@PathVariable Long routeId) {
        try {
            RouteResponse route = routeService.getRouteById(routeId);
            return ResponseEntity.ok(ApiResponse.success(route));
        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{routeId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Long routeId) {
        try {
            routeService.deleteRoute(routeId);
            return ResponseEntity.ok(ApiResponse.success("경로 삭제 성공", null));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{routeId}/favorite")
    public ResponseEntity<ApiResponse<RouteResponse>> toggleFavorite(@PathVariable Long routeId) {
        try {
            RouteResponse route = routeService.toggleFavorite(routeId);
            return ResponseEntity.ok(ApiResponse.success("즐겨찾기 토글 성공", route));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
