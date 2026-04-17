package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TicketRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    private String priority;

    @NotNull(message = "Resource is required")
    private Long resourceId;

    // ✅ GETTERS

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getPriority() {
        return priority;
    }

    public Long getResourceId() {
        return resourceId;
    }

    // ✅ SETTERS

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }
}