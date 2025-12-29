package com.rideroasis.repository;

import com.rideroasis.entity.Route;
import com.rideroasis.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    List<Route> findByUserOrderByCreatedAtDesc(User user);

    List<Route> findByUserAndIsFavoriteTrueOrderByCreatedAtDesc(User user);

    @Query("SELECT r FROM Route r WHERE r.user = :user AND r.routeType = :routeType ORDER BY r.createdAt DESC")
    List<Route> findByUserAndRouteType(User user, Route.RouteType routeType);

    @Query("SELECT COUNT(r) FROM Route r WHERE r.user = :user")
    long countByUser(User user);
}
