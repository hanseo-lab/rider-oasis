package com.rideroasis.repository;

import com.rideroasis.entity.Comment;
import com.rideroasis.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostOrderByCreatedAtAsc(CommunityPost post);

    long countByPost(CommunityPost post);
}
