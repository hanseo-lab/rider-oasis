package com.rideroasis.algorithm;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * A* 알고리즘을 이용한 그늘 경로 탐색
 * 폭염 지역을 회피하고 그늘/녹지 지역을 우선하는 경로 찾기
 */
@Component
public class AStarPathfinder {

    @Data
    @AllArgsConstructor
    public static class Node implements Comparable<Node> {
        double lat;
        double lng;
        double g;  // 시작점부터의 실제 비용
        double h;  // 목표까지의 추정 비용 (휴리스틱)
        double f;  // g + h
        Node parent;
        double shadeScore;  // 그늘 점수 (높을수록 좋음)
        double heatScore;   // 폭염 점수 (낮을수록 좋음)

        @Override
        public int compareTo(Node other) {
            return Double.compare(this.f, other.f);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Node node = (Node) o;
            return Math.abs(lat - node.lat) < 0.0001 && Math.abs(lng - node.lng) < 0.0001;
        }

        @Override
        public int hashCode() {
            return Objects.hash(Math.round(lat * 10000), Math.round(lng * 10000));
        }
    }

    @Data
    @AllArgsConstructor
    public static class PathResult {
        List<Node> path;
        double totalDistance;
        double shadeRatio;
        double heatExposure;
        int estimatedTime;
    }

    /**
     * A* 알고리즘으로 최적 경로 찾기
     */
    public PathResult findOptimalPath(
        double startLat, double startLng,
        double endLat, double endLng,
        boolean preferShade,
        boolean avoidHeat
    ) {
        PriorityQueue<Node> openSet = new PriorityQueue<>();
        Set<Node> closedSet = new HashSet<>();

        // 시작 노드
        Node startNode = new Node(
            startLat, startLng,
            0, 0, 0, null,
            0.5, 0.5  // 기본 점수
        );
        startNode.h = heuristic(startLat, startLng, endLat, endLng);
        startNode.f = startNode.g + startNode.h;

        openSet.add(startNode);

        Node endNode = null;
        int maxIterations = 1000;
        int iterations = 0;

        while (!openSet.isEmpty() && iterations < maxIterations) {
            iterations++;
            Node current = openSet.poll();

            // 목표 도달 체크
            if (Math.abs(current.lat - endLat) < 0.001 && Math.abs(current.lng - endLng) < 0.001) {
                endNode = current;
                break;
            }

            closedSet.add(current);

            // 이웃 노드 생성 (8방향)
            List<Node> neighbors = generateNeighbors(current, endLat, endLng, preferShade, avoidHeat);

            for (Node neighbor : neighbors) {
                if (closedSet.contains(neighbor)) {
                    continue;
                }

                double tentativeG = current.g + distance(current.lat, current.lng, neighbor.lat, neighbor.lng);

                // 그늘 선호/폭염 회피 가중치 적용
                double weight = 1.0;
                if (preferShade) {
                    weight *= (2.0 - neighbor.shadeScore);  // 그늘이 많을수록 비용 감소
                }
                if (avoidHeat) {
                    weight *= (1.0 + neighbor.heatScore);   // 폭염이 심할수록 비용 증가
                }
                tentativeG *= weight;

                boolean inOpenSet = openSet.contains(neighbor);
                if (!inOpenSet || tentativeG < neighbor.g) {
                    neighbor.parent = current;
                    neighbor.g = tentativeG;
                    neighbor.h = heuristic(neighbor.lat, neighbor.lng, endLat, endLng);
                    neighbor.f = neighbor.g + neighbor.h;

                    if (!inOpenSet) {
                        openSet.add(neighbor);
                    }
                }
            }
        }

        // 경로 재구성
        if (endNode == null) {
            // 목표에 도달하지 못한 경우 직선 경로 반환
            return createStraightPath(startLat, startLng, endLat, endLng);
        }

        return reconstructPath(endNode);
    }

    /**
     * 휴리스틱 함수 (하버사인 거리)
     */
    private double heuristic(double lat1, double lng1, double lat2, double lng2) {
        return distance(lat1, lng1, lat2, lng2);
    }

    /**
     * 하버사인 거리 계산 (km)
     */
    private double distance(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371; // 지구 반지름 (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * 이웃 노드 생성 (8방향)
     */
    private List<Node> generateNeighbors(Node current, double endLat, double endLng, boolean preferShade, boolean avoidHeat) {
        List<Node> neighbors = new ArrayList<>();
        double step = 0.005;  // 약 500m

        // 8방향 탐색
        int[][] directions = {
            {-1, -1}, {-1, 0}, {-1, 1},
            {0, -1},           {0, 1},
            {1, -1},  {1, 0},  {1, 1}
        };

        for (int[] dir : directions) {
            double newLat = current.lat + dir[0] * step;
            double newLng = current.lng + dir[1] * step;

            // 지도 범위 체크 (경기도 대략 범위)
            if (newLat < 36.5 || newLat > 38.5 || newLng < 126.5 || newLng > 128.0) {
                continue;
            }

            // 그늘/폭염 점수 계산 (실제로는 경기기후 API 데이터 활용)
            double shadeScore = calculateShadeScore(newLat, newLng);
            double heatScore = calculateHeatScore(newLat, newLng);

            Node neighbor = new Node(
                newLat, newLng,
                0, 0, 0, null,
                shadeScore, heatScore
            );

            neighbors.add(neighbor);
        }

        return neighbors;
    }

    /**
     * 그늘 점수 계산 (0.0 ~ 1.0, 높을수록 그늘이 많음)
     * TODO: 실제 경기기후 API 데이터와 연동
     */
    private double calculateShadeScore(double lat, double lng) {
        // 임시 구현: 랜덤 + 위치 기반
        return 0.3 + Math.random() * 0.4;
    }

    /**
     * 폭염 점수 계산 (0.0 ~ 1.0, 높을수록 위험)
     * TODO: 실제 경기기후 API 데이터와 연동
     */
    private double calculateHeatScore(double lat, double lng) {
        // 임시 구현: 랜덤 + 위치 기반
        return 0.2 + Math.random() * 0.4;
    }

    /**
     * 경로 재구성
     */
    private PathResult reconstructPath(Node endNode) {
        List<Node> path = new ArrayList<>();
        Node current = endNode;
        double totalDistance = 0;
        double totalShade = 0;
        double totalHeat = 0;
        int nodeCount = 0;

        while (current != null) {
            path.add(0, current);
            if (current.parent != null) {
                totalDistance += distance(current.lat, current.lng, current.parent.lat, current.parent.lng);
                totalShade += current.shadeScore;
                totalHeat += current.heatScore;
                nodeCount++;
            }
            current = current.parent;
        }

        double shadeRatio = nodeCount > 0 ? totalShade / nodeCount : 0.5;
        double heatExposure = nodeCount > 0 ? totalHeat / nodeCount : 0.5;
        int estimatedTime = (int) (totalDistance * 3);  // 평균 20km/h 가정

        return new PathResult(path, totalDistance, shadeRatio, heatExposure, estimatedTime);
    }

    /**
     * 직선 경로 생성 (폴백)
     */
    private PathResult createStraightPath(double startLat, double startLng, double endLat, double endLng) {
        List<Node> path = new ArrayList<>();

        int steps = 10;
        for (int i = 0; i <= steps; i++) {
            double t = (double) i / steps;
            double lat = startLat + (endLat - startLat) * t;
            double lng = startLng + (endLng - startLng) * t;

            path.add(new Node(lat, lng, 0, 0, 0, null, 0.5, 0.5));
        }

        double totalDistance = distance(startLat, startLng, endLat, endLng);
        int estimatedTime = (int) (totalDistance * 3);

        return new PathResult(path, totalDistance, 0.5, 0.5, estimatedTime);
    }
}
