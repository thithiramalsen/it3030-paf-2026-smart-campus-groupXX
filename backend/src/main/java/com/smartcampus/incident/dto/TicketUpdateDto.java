package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotNull;

public class TicketUpdateDto {

    @NotNull(message = "Status is required")
    private String status;

    private String resolutionNotes;

    // ✅ GETTERS

    public String getStatus() {
        return status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    // ✅ SETTERS

    public void setStatus(String status) {
        this.status = status;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}