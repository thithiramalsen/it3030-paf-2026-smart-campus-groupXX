package com.smartcampus.auth;

import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.auth.service.AuthService;
import com.smartcampus.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthService authService;
    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(JwtTokenProvider jwtTokenProvider,
                                     RefreshTokenService refreshTokenService,
                                     AuthService authService,
                                     @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.authService = authService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String rawEmail = principal.getAttribute("email");
        String email = rawEmail == null ? null : rawEmail.trim().toLowerCase();
        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email missing in OAuth response");
            return;
        }

        String name = principal.getAttribute("name");
        if (name == null || name.isBlank()) {
            name = principal.getAttribute("given_name");
        }
        String picture = principal.getAttribute("picture");
        User user = authService.ensureOAuthUser(email, name, picture);

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);

        TokenResponse payload = new TokenResponse(accessToken, refreshToken.getToken(),
            refreshTokenService.getAccessTokenTtlSeconds());

        log.info("OAuth2 login successful for {}", email);

        String redirectUrl = frontendUrl
                + "/oauth/callback#accessToken="
            + URLEncoder.encode(payload.getAccessToken(), StandardCharsets.UTF_8)
                + "&refreshToken="
            + URLEncoder.encode(payload.getRefreshToken(), StandardCharsets.UTF_8)
                + "&expiresInSeconds="
            + payload.getExpiresInSeconds();

        response.sendRedirect(redirectUrl);
    }
}
