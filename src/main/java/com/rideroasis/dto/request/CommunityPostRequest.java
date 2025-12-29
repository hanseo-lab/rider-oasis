package com.rideroasis.dto.request;

import com.rideroasis.entity.CommunityPost;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunityPostRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 최대 200자입니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    private CommunityPost.PostCategory category = CommunityPost.PostCategory.GENERAL;

    private Double locationLat;
    private Double locationLng;
    private String locationName;
}
