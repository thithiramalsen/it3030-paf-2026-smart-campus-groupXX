package com.smartcampus.notification;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.smartcampus.config.TestSecurityConfig;
import com.smartcampus.notification.controller.NotificationController;
import com.smartcampus.notification.dto.NotificationDto;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.mockito.ArgumentMatchers.any;

@WebMvcTest(controllers = NotificationController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
        com.smartcampus.auth.JwtAuthenticationFilter.class,
        com.smartcampus.config.SecurityConfig.class
    }))
@Import(TestSecurityConfig.class)
@SuppressWarnings("null")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;


    @Test
    void shouldRejectUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void listShouldReturnOkForUser() throws Exception {
        Page<NotificationDto> page = new PageImpl<>(List.of(new NotificationDto(UUID.randomUUID(), "msg", NotificationType.BOOKING_APPROVED, null, false, java.time.Instant.now())));
        when(notificationService.getCurrentUserNotifications(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void markReadShouldReturnNoContent() throws Exception {
        doNothing().when(notificationService).markRead(any());
        mockMvc.perform(patch("/api/notifications/" + UUID.randomUUID() + "/read").with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "USER")
    void deleteShouldReturnNoContent() throws Exception {
        doNothing().when(notificationService).delete(any());
        mockMvc.perform(delete("/api/notifications/" + UUID.randomUUID()).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "GUEST")
    void shouldForbidUnknownRole() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isForbidden());
    }
}
