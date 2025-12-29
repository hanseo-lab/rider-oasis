package com.rideroasis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.RIDER;

    // 라이더 설정
    @Column(name = "prefer_shade")
    @Builder.Default
    private Boolean preferShade = true;  // 그늘 경로 선호

    @Column(name = "avoid_heat")
    @Builder.Default
    private Boolean avoidHeat = true;  // 폭염 지역 회피

    @Column(name = "show_shelters")
    @Builder.Default
    private Boolean showShelters = true;  // 대피시설 표시

    @Column(name = "max_detour_percent")
    @Builder.Default
    private Integer maxDetourPercent = 20;  // 최대 우회 허용 비율 (%)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Route> routes = new ArrayList<>();

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    @Builder.Default
    private List<CommunityPost> posts = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // UserDetails 구현
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public enum Role {
        RIDER,      // 일반 라이더
        ADMIN       // 관리자
    }
}
