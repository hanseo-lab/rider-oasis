package com.rideroasis.service;

import com.rideroasis.dto.request.CommentRequest;
import com.rideroasis.dto.request.CommunityPostRequest;
import com.rideroasis.dto.response.CommunityPostResponse;
import com.rideroasis.entity.Comment;
import com.rideroasis.entity.CommunityPost;
import com.rideroasis.entity.User;
import com.rideroasis.repository.CommentRepository;
import com.rideroasis.repository.CommunityPostRepository;
import com.rideroasis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommunityPostResponse createPost(CommunityPostRequest request) {
        User user = getCurrentUser();

        CommunityPost post = CommunityPost.builder()
            .author(user)
            .title(request.getTitle())
            .content(request.getContent())
            .category(request.getCategory())
            .locationLat(request.getLocationLat())
            .locationLng(request.getLocationLng())
            .locationName(request.getLocationName())
            .build();

        post = postRepository.save(post);

        return CommunityPostResponse.fromEntity(post);
    }

    @Transactional(readOnly = true)
    public Page<CommunityPostResponse> getAllPosts(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
            .map(CommunityPostResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<CommunityPostResponse> getPostsByCategory(
        CommunityPost.PostCategory category,
        Pageable pageable
    ) {
        return postRepository.findByCategoryOrderByCreatedAtDesc(category, pageable)
            .map(CommunityPostResponse::fromEntity);
    }

    @Transactional
    public CommunityPostResponse getPostById(Long postId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 조회수 증가
        post.incrementViewCount();
        post = postRepository.save(post);

        return CommunityPostResponse.fromEntity(post);
    }

    @Transactional
    public CommunityPostResponse updatePost(Long postId, CommunityPostRequest request) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        User user = getCurrentUser();
        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategory(request.getCategory());
        post.setLocationLat(request.getLocationLat());
        post.setLocationLng(request.getLocationLng());
        post.setLocationName(request.getLocationName());

        post = postRepository.save(post);

        return CommunityPostResponse.fromEntity(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        User user = getCurrentUser();
        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        postRepository.delete(post);
    }

    @Transactional
    public void likePost(Long postId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        post.incrementLikeCount();
        postRepository.save(post);
    }

    @Transactional
    public void addComment(Long postId, CommentRequest request) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        User user = getCurrentUser();

        Comment comment = Comment.builder()
            .post(post)
            .author(user)
            .content(request.getContent())
            .build();

        commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommunityPostResponse> searchPosts(String keyword, Pageable pageable) {
        return postRepository.searchByKeyword(keyword, pageable)
            .map(CommunityPostResponse::fromEntity);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}
