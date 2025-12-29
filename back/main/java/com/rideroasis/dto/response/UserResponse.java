package com.rideroasis.dto.response;

import com.rideroasis.entity.User;
import com.rideroasis.entity.User.SeasonMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String role;

    // Settings
    private Boolean preferShade;
    private Boolean avoidHeat;
    private Boolean showShelters;
    private Integer maxDetourPercent;
    private SeasonMode seasonMode;
    private Boolean avoidBlackIce;

    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .role(user.getRole().name())
            .preferShade(user.getPreferShade())
            .avoidHeat(user.getAvoidHeat())
            .showShelters(user.getShowShelters())
            .maxDetourPercent(user.getMaxDetourPercent())
            .seasonMode(user.getSeasonMode())
            .avoidBlackIce(user.getAvoidBlackIce())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
