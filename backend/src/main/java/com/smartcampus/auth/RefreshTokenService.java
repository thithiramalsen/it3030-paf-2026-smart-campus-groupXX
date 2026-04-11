package com.smartcampus.auth;

import com.smartcampus.user.User;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public RefreshToken create(User user) {
        refreshTokenRepository.deleteExpiredForUser(user, Instant.now());
        RefreshToken token = new RefreshToken(user, UUID.randomUUID().toString(),
                Instant.now().plusSeconds(jwtProperties.getRefreshTokenValiditySeconds()));
        return refreshTokenRepository.save(token);
    }

    @Transactional(readOnly = true)
    public Optional<RefreshToken> findActive(String tokenValue) {
        return refreshTokenRepository.findByTokenAndRevokedFalse(tokenValue)
                .filter(rt -> rt.getExpiresAt().isAfter(Instant.now()));
    }

    @Transactional
    public void revoke(RefreshToken refreshToken) {
        log.debug("Revoking refresh token for user {}", refreshToken.getUser().getEmail());
        refreshToken.revoke();
    }

    @Transactional
    public void revokeAllForUser(User user) {
        refreshTokenRepository.revokeAllForUser(user);
    }

    @Transactional(readOnly = true)
    public long getAccessTokenTtlSeconds() {
        return jwtProperties.getAccessTokenValiditySeconds();
    }
}
