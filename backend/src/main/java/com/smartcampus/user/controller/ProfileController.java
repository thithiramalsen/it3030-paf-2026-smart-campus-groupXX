package com.smartcampus.user.controller;

import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import com.smartcampus.user.dto.ProfileUpdateRequest;
import com.smartcampus.user.dto.UserViewDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    public ProfileController(CurrentUserService currentUserService, UserRepository userRepository) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserViewDto> getMyProfile() {
        User user = currentUserService.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));
        return ResponseEntity.ok(UserViewDto.from(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserViewDto> updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User user = currentUserService.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setName(request.getFullName().trim());
        }
        user.setProfileImageUrl(request.getProfileImageUrl());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(UserViewDto.from(saved));
    }
}
