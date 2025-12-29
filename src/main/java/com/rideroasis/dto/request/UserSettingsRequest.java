package com.rideroasis.dto.request;

import com.rideroasis.entity.User.SeasonMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsRequest {
    private Boolean preferShade;
    private Boolean avoidHeat;
    private Boolean showShelters;
    private Integer maxDetourPercent;  // 0-50
    private SeasonMode seasonMode;
    private Boolean avoidBlackIce;
    private String nickname;
}
