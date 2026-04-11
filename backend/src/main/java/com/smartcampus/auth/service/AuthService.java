package com.smartcampus.auth.service;

import com.smartcampus.auth.JwtTokenProvider;
import com.smartcampus.auth.RefreshToken;
import com.smartcampus.auth.RefreshTokenService;
import com.smartcampus.auth.dto.RefreshRequest;
import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.user.AccountStatus;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import com.smartcampus.user.dto.UserViewDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final String bootstrapAdminEmail;

    public AuthService(RefreshTokenService refreshTokenService,
                       JwtTokenProvider jwtTokenProvider,
                       CurrentUserService currentUserService,
                       UserRepository userRepository,
                       @Value("${app.bootstrap-admin-email:path2intern@gmail.com}") String bootstrapAdminEmail) {
        this.refreshTokenService = refreshTokenService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.bootstrapAdminEmail = bootstrapAdminEmail == null ? "" : bootstrapAdminEmail.trim().toLowerCase();
    }

    @Transactional(readOnly = true)
    public UserViewDto getCurrentUser() {
        User user = currentUserService.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));
        return UserViewDto.from(user);
    }

    @Transactional
    public TokenResponse rotateRefreshToken(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.findActive(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));

        User user = refreshToken.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        refreshTokenService.revoke(refreshToken);
        RefreshToken rotated = refreshTokenService.create(user);

        return new TokenResponse(newAccessToken, rotated.getToken(), refreshTokenService.getAccessTokenTtlSeconds());
    }

    @Transactional
    public void logoutCurrentUser() {
        currentUserService.getCurrentUser().ifPresent(refreshTokenService::revokeAllForUser);
    }

    @Transactional
    public User ensureOAuthUser(String rawEmail, String rawName, String rawPictureUrl) {
        String email = normalizeEmail(rawEmail);
        if (email == null) {
            throw new IllegalStateException("Email not provided by OAuth2 provider");
        }

        String name = normalizeName(rawName, email);
        String pictureUrl = normalizePicture(rawPictureUrl);

        return userRepository.findByEmail(email)
                .map(existing -> updateUserFromOAuth(existing, name, pictureUrl))
                .orElseGet(() -> createUserFromOAuth(email, name, pictureUrl));
    }

    private User updateUserFromOAuth(User user, String name, String pictureUrl) {
        user.setName(name);
        if (pictureUrl != null) {
            user.setProfileImageUrl(pictureUrl);
        }
        return userRepository.save(user);
    }

    private User createUserFromOAuth(String email, String name, String pictureUrl) {
        User user = new User(name, email, determineInitialRole(email));
        user.setUserType(classifyUserType(email));
        user.setAccountStatus(determineInitialStatus(email));
        user.setProfileImageUrl(pictureUrl);
        return userRepository.save(user);
    }

    private Role determineInitialRole(String email) {
        if (email.equals(bootstrapAdminEmail)) {
            return Role.ADMIN;
        }
        return Role.USER;
    }

    private AccountStatus determineInitialStatus(String email) {
        if (email.equals(bootstrapAdminEmail)) {
            return AccountStatus.ACTIVE;
        }
        if (email.endsWith("@my.sliit.lk") || email.endsWith("@sliit.lk")) {
            return AccountStatus.ACTIVE;
        }
        return AccountStatus.PENDING_APPROVAL;
    }

    private String classifyUserType(String email) {
        if (email.endsWith("@my.sliit.lk")) {
            return "STUDENT";
        }
        if (email.endsWith("@sliit.lk")) {
            return "LECTURER";
        }
        return null;
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private String normalizeName(String name, String fallback) {
        if (name == null || name.isBlank()) {
            return fallback;
        }
        return name.trim();
    }

    private String normalizePicture(String pictureUrl) {
        if (pictureUrl == null || pictureUrl.isBlank()) {
            return null;
        }
        return pictureUrl.trim();
    }
}
