package com.smartcampus.auth;

import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.getOrDefault("name", attributes.getOrDefault("given_name", "Unknown"));

        if (email == null) {
            throw new IllegalStateException("Email not provided by OAuth2 provider");
        }

        userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Creating user {} from OAuth2 login", email);
            return userRepository.save(new User(name, email, Role.USER));
        });

        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                attributes,
                "email");
    }
}
