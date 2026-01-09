package com.rideroasis.dto.response;

import com.rideroasis.entity.CommunityPost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import com.rideroasis.dto.response.CommentResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityPostResponse {
    private Long id;
    private String authorUsername;
    private String authorNickname;
    private String title;
    private String content;
    private CommunityPost.PostCategory category;
    private Double locationLat;
    private Double locationLng;
    private String locationName;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommunityPostResponse fromEntity(CommunityPost post) {
        return CommunityPostResponse.builder()
                .id(post.getId())
                .authorUsername(post.getAuthor().getUsername())
                .authorNickname(post.getAuthor().getNickname())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .locationLat(post.getLocationLat())
                .locationLng(post.getLocationLng())
                .locationName(post.getLocationName())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getComments().size())
                .comments(post.getComments().stream()
                        .map(CommentResponse::fromEntity)
                        .collect(Collectors.toList()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
