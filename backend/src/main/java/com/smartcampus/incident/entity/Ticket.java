package com.smartcampus.incident.entity;

import com.smartcampus.resource.model.Resource;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String technicianAssigned;

    private String createdByEmail;

    private String resolutionNotes;

    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketAttachment> attachments = new ArrayList<>();


    public Ticket() {}

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

        public String getTechnicianAssigned() {
        return technicianAssigned;
    }

    public void setTechnicianAssigned(String technicianAssigned) {
        this.technicianAssigned = technicianAssigned;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }

    public void setCreatedByEmail(String createdByEmail) {
        this.createdByEmail = createdByEmail;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public String getResolutionNotes() {
    return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public TicketCategory getCategory() {
        return category;
    }

    public void setCategory(TicketCategory category) {
        this.category = category;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }
}