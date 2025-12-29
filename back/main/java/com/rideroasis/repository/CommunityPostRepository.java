package com.rideroasis.repository;

import com.rideroasis.entity.CommunityPost;
import com.rideroasis.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    Page<CommunityPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<CommunityPost> findByCategoryOrderByCreatedAtDesc(
        CommunityPost.PostCategory category,
        Pageable pageable
    );

    List<CommunityPost> findByAuthorOrderByCreatedAtDesc(User author);

    @Query("SELECT p FROM CommunityPost p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword% ORDER BY p.createdAt DESC")
    Page<CommunityPost> searchByKeyword(String keyword, Pageable pageable);

    @Query("SELECT p FROM CommunityPost p ORDER BY p.likeCount DESC, p.createdAt DESC")
    Page<CommunityPost> findPopularPosts(Pageable pageable);
}
