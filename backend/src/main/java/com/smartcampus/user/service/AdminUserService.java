package com.smartcampus.user.service;

import com.smartcampus.auth.RefreshTokenRepository;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.incident.repository.TicketRepository;
import com.smartcampus.notification.NotificationRepository;
import com.smartcampus.user.CurrentUserService;
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
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CurrentUserService currentUserService;

    public AdminUserService(UserRepository userRepository,
                            BookingRepository bookingRepository,
                            TicketRepository ticketRepository,
                            NotificationRepository notificationRepository,
                            RefreshTokenRepository refreshTokenRepository,
                            CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.notificationRepository = notificationRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.currentUserService = currentUserService;
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        currentUserService.getCurrentUser().ifPresent(current -> {
            if (current.getId().equals(userId)) {
                throw new IllegalArgumentException("You cannot delete your own account");
            }
        });

        refreshTokenRepository.deleteByUser(user);
        notificationRepository.deleteByRecipient(user);
        bookingRepository.deleteByUserId(userId);
        ticketRepository.deleteByCreatedByEmailIgnoreCase(user.getEmail());
        userRepository.delete(user);
    }
}
