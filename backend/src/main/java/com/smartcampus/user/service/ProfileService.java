package com.smartcampus.user.service;

import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import com.smartcampus.user.dto.ProfileUpdateRequest;
import com.smartcampus.user.dto.UserViewDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    public ProfileService(CurrentUserService currentUserService, UserRepository userRepository) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserViewDto getMyProfile() {
        User user = currentUserService.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));
        return UserViewDto.from(user);
    }

    @Transactional
    public UserViewDto updateMyProfile(ProfileUpdateRequest request) {
        User user = currentUserService.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setName(request.getFullName().trim());
        }
        user.setProfileImageUrl(request.getProfileImageUrl());

        User saved = userRepository.save(user);
        return UserViewDto.from(saved);
    }
}
