package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotNull;

public class TicketUpdateDto {

    @NotNull
    private String status;

    private String resolutionNotes;

    // getters + setters
}