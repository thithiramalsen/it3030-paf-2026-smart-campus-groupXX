package com.smartcampus.auth.controller;

import com.smartcampus.auth.JwtTokenProvider;
import com.smartcampus.auth.RefreshToken;
import com.smartcampus.auth.RefreshTokenService;
import com.smartcampus.auth.dto.RefreshRequest;
import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.user.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(RefreshTokenService refreshTokenService, JwtTokenProvider jwtTokenProvider) {
        this.refreshTokenService = refreshTokenService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.findActive(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));

        User user = refreshToken.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        refreshTokenService.revoke(refreshToken);
        RefreshToken rotated = refreshTokenService.create(user);

        TokenResponse response = new TokenResponse(newAccessToken, rotated.getToken(),
                refreshTokenService.getAccessTokenTtlSeconds());
        return ResponseEntity.ok(response);
    }
}
