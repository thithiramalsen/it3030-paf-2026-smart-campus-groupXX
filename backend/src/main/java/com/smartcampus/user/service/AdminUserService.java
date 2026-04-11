package com.smartcampus.user.service;

import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import com.smartcampus.user.dto.UpdateUserRoleRequest;
import com.smartcampus.user.dto.UpdateUserStatusRequest;
import com.smartcampus.user.dto.UserViewDto;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserViewDto> listUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt).reversed())
                .map(UserViewDto::from)
                .toList();
    }

    @Transactional
    public UserViewDto updateRole(UUID userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.setRole(request.getRole());
        return UserViewDto.from(userRepository.save(user));
    }

    @Transactional
    public UserViewDto updateStatus(UUID userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.setAccountStatus(request.getAccountStatus());
        return UserViewDto.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
        userRepository.deleteById(userId);
    }
}
