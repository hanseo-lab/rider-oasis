package com.rideroasis.controller;

import com.rideroasis.dto.request.CommentRequest;
import com.rideroasis.dto.request.CommunityPostRequest;
import com.rideroasis.dto.response.ApiResponse;
import com.rideroasis.dto.response.CommunityPostResponse;
import com.rideroasis.entity.CommunityPost;
import com.rideroasis.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping("/posts")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> createPost(
        @Valid @RequestBody CommunityPostRequest request
    ) {
        try {
            CommunityPostResponse response = communityService.createPost(request);
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("게시글 작성 성공", response));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<CommunityPostResponse>>> getAllPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityPostResponse> posts = communityService.getAllPosts(pageable);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/posts/category/{category}")
    public ResponseEntity<ApiResponse<Page<CommunityPostResponse>>> getPostsByCategory(
        @PathVariable CommunityPost.PostCategory category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityPostResponse> posts = communityService.getPostsByCategory(category, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> getPostById(@PathVariable Long postId) {
        try {
            CommunityPostResponse post = communityService.getPostById(postId);
            return ResponseEntity.ok(ApiResponse.success(post));
        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> updatePost(
        @PathVariable Long postId,
        @Valid @RequestBody CommunityPostRequest request
    ) {
        try {
            CommunityPostResponse response = communityService.updatePost(postId, request);
            return ResponseEntity.ok(ApiResponse.success("게시글 수정 성공", response));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long postId) {
        try {
            communityService.deletePost(postId);
            return ResponseEntity.ok(ApiResponse.success("게시글 삭제 성공", null));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<ApiResponse<Void>> likePost(@PathVariable Long postId) {
        try {
            communityService.likePost(postId);
            return ResponseEntity.ok(ApiResponse.success("좋아요 성공", null));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<Void>> addComment(
        @PathVariable Long postId,
        @Valid @RequestBody CommentRequest request
    ) {
        try {
            communityService.addComment(postId, request);
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("댓글 작성 성공", null));
        } catch (RuntimeException e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/posts/search")
    public ResponseEntity<ApiResponse<Page<CommunityPostResponse>>> searchPosts(
        @RequestParam String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityPostResponse> posts = communityService.searchPosts(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }
}
