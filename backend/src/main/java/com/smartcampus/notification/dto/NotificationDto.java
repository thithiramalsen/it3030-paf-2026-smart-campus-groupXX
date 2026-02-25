package com.smartcampus.notification.dto;

import com.smartcampus.notification.NotificationType;
import java.time.Instant;
import java.util.UUID;

public class NotificationDto {
    private UUID id;
    private String message;
    private NotificationType type;
    private UUID relatedEntityId;
    private boolean read;
    private Instant createdAt;

    public NotificationDto() {
    }

    public NotificationDto(UUID id, String message, NotificationType type, UUID relatedEntityId, boolean read, Instant createdAt) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.relatedEntityId = relatedEntityId;
        this.read = read;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public NotificationType getType() {
        return type;
    }

    public UUID getRelatedEntityId() {
        return relatedEntityId;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
