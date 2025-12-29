package com.rideroasis.controller;

import com.rideroasis.dto.request.UserSettingsRequest;
import com.rideroasis.dto.response.ApiResponse;
import com.rideroasis.dto.response.RouteResponse;
import com.rideroasis.dto.response.UserResponse;
import com.rideroasis.dto.response.UserStatsResponse;
import com.rideroasis.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 내 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyInfo() {
        UserResponse userResponse = userService.getMyInfo();
        return ResponseEntity.ok(ApiResponse.success("내 정보 조회 성공", userResponse));
    }

    /**
     * 사용자 설정 업데이트
     */
    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<UserResponse>> updateSettings(
        @RequestBody UserSettingsRequest request
    ) {
        UserResponse userResponse = userService.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.success("설정 업데이트 성공", userResponse));
    }

    /**
     * 내 통계 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getMyStats() {
        UserStatsResponse stats = userService.getMyStats();
        return ResponseEntity.ok(ApiResponse.success("통계 조회 성공", stats));
    }

    /**
     * 즐겨찾기 경로 목록 조회
     */
    @GetMapping("/favorite-routes")
    public ResponseEntity<ApiResponse<List<RouteResponse>>> getFavoriteRoutes() {
        List<RouteResponse> routes = userService.getFavoriteRoutes().stream()
            .map(RouteResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("즐겨찾기 경로 조회 성공", routes));
    }
}
