package com.smartcampus.notification;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.notification.dto.NotificationDto;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.lang.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               CurrentUserService currentUserService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public void notifyUser(@NonNull UUID userId, @NonNull String message, @NonNull NotificationType type, UUID relatedEntityId) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Notification notification = new Notification(recipient, message, type, relatedEntityId);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getCurrentUserNotifications(Pageable pageable) {
        User user = requireCurrentUser();
        return notificationRepository.findByRecipientAndDeletedFalse(user, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getCurrentUserNotificationsList() {
        User user = requireCurrentUser();
        return notificationRepository.findByRecipientAndDeletedFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        User user = requireCurrentUser();
        return notificationRepository.countByRecipientAndIsReadFalseAndDeletedFalse(user);
    }

    @Transactional
    public void markRead(UUID notificationId) {
        User user = requireCurrentUser();
        int updated = notificationRepository.markRead(notificationId, user);
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification not found");
        }
    }

    @Transactional
    public void delete(UUID notificationId) {
        User user = requireCurrentUser();
        int updated = notificationRepository.softDelete(notificationId, user);
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification not found");
        }
    }

    @Transactional
    public void markAllRead() {
        User user = requireCurrentUser();
        notificationRepository.markAllRead(user);
    }

    private NotificationDto mapToDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                titleForType(notification.getType()),
                notification.getMessage(),
                notification.getType(),
                notification.getRelatedEntityId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

      private String titleForType(NotificationType type) {
        return switch (type) {
            case BOOKING_APPROVED -> "Booking Approved";
            case BOOKING_REJECTED -> "Booking Rejected";
            case BOOKING_CREATED -> "New Booking Request";
            case TICKET_UPDATED -> "Ticket Updated";
            case COMMENT_ADDED -> "New Comment";
            case ACCOUNT_APPROVAL_REQUIRED -> "Account Approval Required";
            case ROLE_CHANGED -> "Role Updated";
        };
    }

    private User requireCurrentUser() {
        return currentUserService.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));
    }
}
