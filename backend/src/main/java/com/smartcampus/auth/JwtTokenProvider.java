package com.smartcampus.auth;

import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final JwtProperties properties;
    private final CustomUserDetailsService userDetailsService;
    private final SecretKey secretKey;

    public JwtTokenProvider(JwtProperties properties, CustomUserDetailsService userDetailsService) {
        this.properties = properties;
        this.userDetailsService = userDetailsService;
        this.secretKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.getAccessTokenValiditySeconds());
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.getRefreshTokenValiditySeconds());
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(getSubject(token));
        return new UsernamePasswordAuthenticationToken(userDetails, token, userDetails.getAuthorities());
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }

    public String getSubject(String token) {
        return parseClaims(token).getPayload().getSubject();
    }

    public Role getRole(String token) {
        String role = parseClaims(token).getPayload().get("role", String.class);
        return role == null ? null : Role.valueOf(role);
    }

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
    }
}
