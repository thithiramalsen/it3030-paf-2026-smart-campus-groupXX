package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TicketRequestDto {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private String category;

    @NotNull
    private String priority;

    @NotNull
    private String location;

    // getters + setters
}