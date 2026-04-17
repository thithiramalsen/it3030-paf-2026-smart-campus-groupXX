package com.smartcampus.resource.dto;

import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;

import java.time.LocalTime;
import java.time.LocalDateTime;

public class ResourceResponseDTO {

    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String imageUrl;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Constructors ──────────────────────────────────────────
    public ResourceResponseDTO() {}

    // ── Getters ───────────────────────────────────────────────
    public Long getId()                  { return id; }
    public String getName()              { return name; }
    public ResourceType getType()        { return type; }
    public Integer getCapacity()         { return capacity; }
    public String getLocation()          { return location; }
    public ResourceStatus getStatus()    { return status; }
    public LocalTime getOpeningTime()    { return openingTime; }
    public LocalTime getClosingTime()    { return closingTime; }
    public String getImageUrl()          { return imageUrl; }
    public String getDescription()       { return description; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    // ── Setters ───────────────────────────────────────────────
    public void setId(Long id)                        { this.id = id; }
    public void setName(String name)                  { this.name = name; }
    public void setType(ResourceType type)            { this.type = type; }
    public void setCapacity(Integer capacity)         { this.capacity = capacity; }
    public void setLocation(String location)          { this.location = location; }
    public void setStatus(ResourceStatus status)      { this.status = status; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }
    public void setImageUrl(String imageUrl)          { this.imageUrl = imageUrl; }
    public void setDescription(String description)    { this.description = description; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ── Builder ───────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private ResourceType type;
        private Integer capacity;
        private String location;
        private ResourceStatus status;
        private LocalTime openingTime;
        private LocalTime closingTime;
        private String imageUrl;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id)                        { this.id = id; return this; }
        public Builder name(String name)                  { this.name = name; return this; }
        public Builder type(ResourceType type)            { this.type = type; return this; }
        public Builder capacity(Integer capacity)         { this.capacity = capacity; return this; }
        public Builder location(String location)          { this.location = location; return this; }
        public Builder status(ResourceStatus status)      { this.status = status; return this; }
        public Builder openingTime(LocalTime t)           { this.openingTime = t; return this; }
        public Builder closingTime(LocalTime t)           { this.closingTime = t; return this; }
        public Builder imageUrl(String imageUrl)          { this.imageUrl = imageUrl; return this; }
        public Builder description(String description)    { this.description = description; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ResourceResponseDTO build() {
            ResourceResponseDTO dto = new ResourceResponseDTO();
            dto.id          = this.id;
            dto.name        = this.name;
            dto.type        = this.type;
            dto.capacity    = this.capacity;
            dto.location    = this.location;
            dto.status      = this.status;
            dto.openingTime = this.openingTime;
            dto.closingTime = this.closingTime;
            dto.imageUrl    = this.imageUrl;
            dto.description = this.description;
            dto.createdAt   = this.createdAt;
            dto.updatedAt   = this.updatedAt;
            return dto;
        }
    }
}