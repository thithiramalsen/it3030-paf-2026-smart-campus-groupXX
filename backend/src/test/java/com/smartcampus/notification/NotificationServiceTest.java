package com.smartcampus.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.notification.dto.NotificationDto;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@SuppressWarnings("null")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private NotificationService notificationService;

    private User user;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        user = new User("Test User", "user@example.com", Role.USER);
    }

    @Test
    void notifyUser_shouldPersistNotification() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.notifyUser(userId, "Hello", NotificationType.TICKET_UPDATED, null);
    }

    @Test
    void getCurrentUserNotifications_shouldReturnPage() {
        when(currentUserService.getCurrentUser()).thenReturn(Optional.of(user));
        Notification notification = new Notification(user, "Message", NotificationType.COMMENT_ADDED, null);
        Page<Notification> page = new PageImpl<>(java.util.List.of(notification));
        when(notificationRepository.findByRecipientAndDeletedFalse(user, PageRequest.of(0, 20))).thenReturn(page);

        Page<NotificationDto> result = notificationService.getCurrentUserNotifications(PageRequest.of(0, 20));
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getMessage()).isEqualTo("Message");
    }

    @Test
    void markRead_shouldThrowWhenNotFound() {
        when(currentUserService.getCurrentUser()).thenReturn(Optional.of(user));
        when(notificationRepository.markRead(any(), any())).thenReturn(0);

        assertThatThrownBy(() -> notificationService.markRead(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_shouldThrowWhenNotFound() {
        when(currentUserService.getCurrentUser()).thenReturn(Optional.of(user));
        when(notificationRepository.softDelete(any(), any())).thenReturn(0);

        assertThatThrownBy(() -> notificationService.delete(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
