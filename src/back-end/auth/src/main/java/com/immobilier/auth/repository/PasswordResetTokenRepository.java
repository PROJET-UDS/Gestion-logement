package com.immobilier.auth.repository;

import com.immobilier.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    @Query("SELECT COUNT(t) FROM PasswordResetToken t WHERE t.email = :email AND t.createdAt >= :since")
    long countByEmailSince(String email, Instant since);

    @Modifying
    @Transactional
    void deleteByEmailAndUsedTrue(String email);
}
