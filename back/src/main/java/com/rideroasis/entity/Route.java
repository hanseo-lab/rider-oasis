package com.rideroasis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String routeName;

    // 출발지 좌표
    @Column(nullable = false)
    private Double startLat;

    @Column(nullable = false)
    private Double startLng;

    @Column(length = 200)
    private String startAddress;

    // 도착지 좌표
    @Column(nullable = false)
    private Double endLat;

    @Column(nullable = false)
    private Double endLng;

    @Column(length = 200)
    private String endAddress;

    // 경로 데이터 (GeoJSON 형식으로 저장)
    @Column(columnDefinition = "TEXT")
    private String pathGeoJson;

    // 경로 통계
    @Column(nullable = false)
    private Double distance; // 거리 (km)

    @Column(nullable = false)
    private Integer estimatedTime; // 예상 시간 (분)

    @Column(nullable = false)
    @Builder.Default
    private Double shadeRatio = 0.0; // 그늘 비율 (0.0 ~ 1.0)

    @Column(nullable = false)
    @Builder.Default
    private Double heatExposure = 0.0; // 폭염 노출도 (0.0 ~ 1.0)

    @Column(nullable = false)
    @Builder.Default
    private Integer shelterCount = 0; // 경로 상 대피시설 수

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RouteType routeType = RouteType.SHADE_OPTIMIZED;

    @Column(name = "is_favorite")
    @Builder.Default
    private Boolean isFavorite = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum RouteType {
        SHORTEST, // 최단 경로 (Legacy)
        SHADE_OPTIMIZED, // 그늘 최적화 경로
        SHELTER_OPTIMIZED, // 대피시설 최적화 경로
        FASTEST, // 최단/최속 경로 (TMAP)
        COMFORT // 편안한 경로 (TMAP)
    }
}
