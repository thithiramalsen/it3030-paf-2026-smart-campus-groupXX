package com.smartcampus.resource.dto;

import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public class ResourceRequestDTO {

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private LocalTime openingTime;
    private LocalTime closingTime;
    private String imageUrl;
    private String description;

    // ── Constructors ──────────────────────────────────────────
    public ResourceRequestDTO() {}

    // ── Getters ───────────────────────────────────────────────
    public String getName()           { return name; }
    public ResourceType getType()     { return type; }
    public Integer getCapacity()      { return capacity; }
    public String getLocation()       { return location; }
    public ResourceStatus getStatus() { return status; }
    public LocalTime getOpeningTime() { return openingTime; }
    public LocalTime getClosingTime() { return closingTime; }
    public String getImageUrl()       { return imageUrl; }
    public String getDescription()    { return description; }

    // ── Setters ───────────────────────────────────────────────
    public void setName(String name)                  { this.name = name; }
    public void setType(ResourceType type)            { this.type = type; }
    public void setCapacity(Integer capacity)         { this.capacity = capacity; }
    public void setLocation(String location)          { this.location = location; }
    public void setStatus(ResourceStatus status)      { this.status = status; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }
    public void setImageUrl(String imageUrl)          { this.imageUrl = imageUrl; }
    public void setDescription(String description)    { this.description = description; }
}