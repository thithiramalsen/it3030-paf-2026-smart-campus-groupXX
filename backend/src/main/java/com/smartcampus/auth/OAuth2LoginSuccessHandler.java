package com.smartcampus.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OAuth2LoginSuccessHandler(JwtTokenProvider jwtTokenProvider,
                                     RefreshTokenService refreshTokenService,
                                     UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");
        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email missing in OAuth response");
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User missing after OAuth2 login"));

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);

        TokenResponse payload = new TokenResponse(accessToken, refreshToken.getToken(),
            refreshTokenService.getAccessTokenTtlSeconds());

        log.info("OAuth2 login successful for {}", email);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), payload);
    }
}
