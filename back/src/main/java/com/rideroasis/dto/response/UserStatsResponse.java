package com.rideroasis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsResponse {
    // 경로 통계
    private Long totalRoutes;         // 총 경로 수
    private Long favoriteRoutes;      // 즐겨찾기 경로 수
    private Double totalDistance;     // 총 누적 거리 (km)
    private Double avgShadeRatio;     // 평균 그늘 이용률 (%)
    private Double avgHeatExposure;   // 평균 폭염 노출도 (%)
    private Integer totalRidingTime;  // 총 주행 시간 (분)

    // Gamification
    private Double heatAvoided;       // 회피한 폭염 구간 (km)
    private Integer sheltersUsed;     // 이용한 쉼터 수

    // 커뮤니티 통계
    private Long totalPosts;          // 작성한 글 수
    private Long totalLikes;          // 받은 좋아요 수

    // 레벨/등급 (향후 확장)
    private String level;             // 레벨 (Bronze, Silver, Gold, Platinum)
    private Integer levelProgress;    // 다음 레벨까지 진행도 (%)
}
