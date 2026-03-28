package com.smartcampus.auth.controller;

import com.smartcampus.auth.JwtTokenProvider;
import com.smartcampus.auth.RefreshToken;
import com.smartcampus.auth.RefreshTokenService;
import com.smartcampus.auth.dto.RefreshRequest;
import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.User;
import com.smartcampus.user.dto.UserViewDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;
    private final CurrentUserService currentUserService;

    public AuthController(RefreshTokenService refreshTokenService,
                          JwtTokenProvider jwtTokenProvider,
                          CurrentUserService currentUserService) {
        this.refreshTokenService = refreshTokenService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserViewDto> me() {
        User user = currentUserService.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));
        return ResponseEntity.ok(UserViewDto.from(user));
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

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        currentUserService.getCurrentUser().ifPresent(refreshTokenService::revokeAllForUser);
        return ResponseEntity.noContent().build();
    }
}
