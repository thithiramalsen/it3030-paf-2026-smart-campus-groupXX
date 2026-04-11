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

    // getters + setters
}
