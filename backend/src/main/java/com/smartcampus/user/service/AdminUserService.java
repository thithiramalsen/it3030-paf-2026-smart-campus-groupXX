package com.smartcampus.user.service;

import com.smartcampus.auth.RefreshTokenRepository;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.incident.repository.TicketRepository;
import com.smartcampus.notification.NotificationService;
import com.smartcampus.notification.NotificationType;
import com.smartcampus.notification.NotificationRepository;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.Role;
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
    private final NotificationService notificationService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CurrentUserService currentUserService;

    public AdminUserService(UserRepository userRepository,
                            BookingRepository bookingRepository,
                            TicketRepository ticketRepository,
                            NotificationRepository notificationRepository,
                            NotificationService notificationService,
                            RefreshTokenRepository refreshTokenRepository,
                            CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
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

        Role previousRole = user.getRole();
        Role newRole = request.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);

        if (previousRole != newRole) {
            String actorName = currentUserService.getCurrentUser()
                    .map(current -> {
                        String fullName = current.getName() == null ? "" : current.getName().trim();
                        return fullName.isBlank() ? current.getEmail() : fullName;
                    })
                    .orElse("an admin");

            String message = String.format(
                    "Your role has been changed from %s to %s by %s.",
                    formatRole(previousRole),
                    formatRole(newRole),
                    actorName
            );

            notificationService.notifyUser(saved.getId(), message, NotificationType.ROLE_CHANGED, null);
        }

        return UserViewDto.from(saved);
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

    private String formatRole(Role role) {
        if (role == null) {
            return "Unknown";
        }
        String normalized = role.name().toLowerCase().replace('_', ' ');
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }
}
