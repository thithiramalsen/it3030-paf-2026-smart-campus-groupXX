package com.smartcampus.incident.dto;

import com.smartcampus.incident.entity.*;

public class TicketResponseDto {

    private Long id;
    private String title;
    private String description;
    private String technicianAssigned;
    private String resolutionNotes;

    private TicketStatus status;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketLocation location;

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

    public TicketLocation getLocation() {
        return location;
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

    public void setLocation(TicketLocation location) {
        this.location = location;
    }
}