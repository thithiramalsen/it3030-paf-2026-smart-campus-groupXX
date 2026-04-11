package com.smartcampus.notification.dto;

import com.smartcampus.notification.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public class NotificationDto {
    private UUID id;
    private String title;
    private String message;
    private NotificationType type;
    private UUID relatedEntityId;
    private boolean isRead;
    private Instant createdAt;

    public NotificationDto() {
    }

    public NotificationDto(UUID id, String title, String message, NotificationType type, UUID relatedEntityId, boolean isRead, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedEntityId = relatedEntityId;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public String getTitle() {
        return title;
    }

    public NotificationType getType() {
        return type;
    }

    public UUID getRelatedEntityId() {
        return relatedEntityId;
    }

    @JsonProperty("isRead")
    public boolean isRead() {
        return isRead;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
