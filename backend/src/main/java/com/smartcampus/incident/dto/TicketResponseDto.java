package com.smartcampus.incident.dto;

import com.smartcampus.incident.entity.*;
import java.time.Instant;

public class TicketResponseDto {

    private Long id;
    private String title;
    private String description;
    private String technicianAssigned;
    private String resolutionNotes;

    private TicketStatus status;
    private TicketCategory category;
    private TicketPriority priority;
    private String createdByName;
    private String createdByEmail;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private Instant createdAt;

    // ✅ GETTERS

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getTechnicianAssigned() {
        return technicianAssigned;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public TicketCategory getCategory() {
        return category;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    // ✅ SETTERS

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTechnicianAssigned(String technicianAssigned) {
        this.technicianAssigned = technicianAssigned;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public void setCategory(TicketCategory category) {
        this.category = category;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public void setCreatedByEmail(String createdByEmail) {
        this.createdByEmail = createdByEmail;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}