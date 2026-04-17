package com.smartcampus.resource.model;

import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import jakarta.persistence.*;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Constructors ──────────────────────────────────────────
    public Resource() {}

    public Resource(Long id, String name, ResourceType type, Integer capacity,
                    String location, ResourceStatus status, LocalTime openingTime,
                    LocalTime closingTime, String imageUrl, String description,
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.imageUrl = imageUrl;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ── Lifecycle ─────────────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ResourceStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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
        public Builder openingTime(LocalTime openingTime) { this.openingTime = openingTime; return this; }
        public Builder closingTime(LocalTime closingTime) { this.closingTime = closingTime; return this; }
        public Builder imageUrl(String imageUrl)          { this.imageUrl = imageUrl; return this; }
        public Builder description(String description)    { this.description = description; return this; }

        public Resource build() {
            Resource r = new Resource();
            r.id = this.id;
            r.name = this.name;
            r.type = this.type;
            r.capacity = this.capacity;
            r.location = this.location;
            r.status = this.status;
            r.openingTime = this.openingTime;
            r.closingTime = this.closingTime;
            r.imageUrl = this.imageUrl;
            r.description = this.description;
            return r;
        }
    }
}