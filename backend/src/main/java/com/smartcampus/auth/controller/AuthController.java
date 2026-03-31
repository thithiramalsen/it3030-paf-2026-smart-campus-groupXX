package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.RefreshRequest;
import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.auth.service.AuthService;
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

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserViewDto> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.rotateRefreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logoutCurrentUser();
        return ResponseEntity.noContent().build();
    }
}
