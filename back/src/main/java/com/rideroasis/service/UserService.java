package com.rideroasis.service;

import com.rideroasis.dto.request.UserSettingsRequest;
import com.rideroasis.dto.response.UserResponse;
import com.rideroasis.dto.response.UserStatsResponse;
import com.rideroasis.entity.CommunityPost;
import com.rideroasis.entity.Route;
import com.rideroasis.entity.User;
import com.rideroasis.repository.CommunityPostRepository;
import com.rideroasis.repository.RouteRepository;
import com.rideroasis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RouteRepository routeRepository;
    private final CommunityPostRepository communityPostRepository;

    @Transactional(readOnly = true)
    public UserResponse getMyInfo() {
        User user = getCurrentUser();
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateSettings(UserSettingsRequest request) {
        User user = getCurrentUser();

        // 설정 업데이트 (null이 아닌 값만)
        if (request.getPreferShade() != null) {
            user.setPreferShade(request.getPreferShade());
        }
        if (request.getAvoidHeat() != null) {
            user.setAvoidHeat(request.getAvoidHeat());
        }
        if (request.getShowShelters() != null) {
            user.setShowShelters(request.getShowShelters());
        }
        if (request.getMaxDetourPercent() != null) {
            // 0-50% 범위 검증
            int percent = Math.max(0, Math.min(50, request.getMaxDetourPercent()));
            user.setMaxDetourPercent(percent);
        }
        if (request.getSeasonMode() != null) {
            user.setSeasonMode(request.getSeasonMode());
        }
        if (request.getAvoidBlackIce() != null) {
            user.setAvoidBlackIce(request.getAvoidBlackIce());
        }
        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            user.setNickname(request.getNickname());
        }

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public UserStatsResponse getMyStats() {
        User user = getCurrentUser();

        // 경로 통계
        List<Route> routes = routeRepository.findByUserOrderByCreatedAtDesc(user);
        Long totalRoutes = (long) routes.size();
        Long favoriteRoutes = routes.stream().filter(Route::getIsFavorite).count();

        Double totalDistance = routes.stream()
            .mapToDouble(Route::getDistance)
            .sum();

        Double avgShadeRatio = routes.isEmpty() ? 0.0 :
            routes.stream().mapToDouble(Route::getShadeRatio).average().orElse(0.0);

        Double avgHeatExposure = routes.isEmpty() ? 0.0 :
            routes.stream().mapToDouble(Route::getHeatExposure).average().orElse(0.0);

        Integer totalRidingTime = routes.stream()
            .mapToInt(Route::getEstimatedTime)
            .sum();

        // Gamification 계산
        Double heatAvoided = totalDistance * avgHeatExposure;  // 간단한 계산
        Integer sheltersUsed = routes.stream()
            .mapToInt(Route::getShelterCount)
            .sum();

        // 커뮤니티 통계
        List<CommunityPost> posts = communityPostRepository.findByAuthorOrderByCreatedAtDesc(user);
        Long totalPosts = (long) posts.size();
        Long totalLikes = posts.stream()
            .mapToLong(CommunityPost::getLikeCount)
            .sum();

        // 레벨 계산 (거리 기준)
        String level = calculateLevel(totalDistance);
        Integer levelProgress = calculateLevelProgress(totalDistance);

        return UserStatsResponse.builder()
            .totalRoutes(totalRoutes)
            .favoriteRoutes(favoriteRoutes)
            .totalDistance(Math.round(totalDistance * 100.0) / 100.0)
            .avgShadeRatio(Math.round(avgShadeRatio * 1000.0) / 10.0)  // 퍼센트로 변환
            .avgHeatExposure(Math.round(avgHeatExposure * 1000.0) / 10.0)
            .totalRidingTime(totalRidingTime)
            .heatAvoided(Math.round(heatAvoided * 100.0) / 100.0)
            .sheltersUsed(sheltersUsed)
            .totalPosts(totalPosts)
            .totalLikes(totalLikes)
            .level(level)
            .levelProgress(levelProgress)
            .build();
    }

    @Transactional(readOnly = true)
    public List<Route> getFavoriteRoutes() {
        User user = getCurrentUser();
        return routeRepository.findByUserAndIsFavoriteTrueOrderByCreatedAtDesc(user);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private String calculateLevel(Double totalDistance) {
        if (totalDistance < 50) return "Bronze";
        if (totalDistance < 200) return "Silver";
        if (totalDistance < 500) return "Gold";
        return "Platinum";
    }

    private Integer calculateLevelProgress(Double totalDistance) {
        if (totalDistance < 50) {
            return (int) ((totalDistance / 50.0) * 100);
        } else if (totalDistance < 200) {
            return (int) (((totalDistance - 50) / 150.0) * 100);
        } else if (totalDistance < 500) {
            return (int) (((totalDistance - 200) / 300.0) * 100);
        }
        return 100;
    }
}
