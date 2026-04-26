package com.smartcampus.auth;

import com.smartcampus.user.User;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

//REFRESH TOKEN SYSTEM

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from RefreshToken rt where rt.user = :user and rt.expiresAt < :now")
    int deleteExpiredForUser(@Param("user") User user, @Param("now") Instant now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshToken rt set rt.revoked = true where rt.user = :user and rt.revoked = false")
    int revokeAllForUser(@Param("user") User user);

    long deleteByUser(User user);
}
