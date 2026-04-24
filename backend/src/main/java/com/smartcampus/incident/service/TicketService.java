package com.smartcampus.incident.service;

import com.smartcampus.incident.dto.TicketRequestDto;
import com.smartcampus.incident.dto.TicketResponseDto;
import com.smartcampus.incident.entity.*;
import com.smartcampus.incident.repository.TicketRepository;
import com.smartcampus.notification.NotificationService;
import com.smartcampus.notification.NotificationType;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.repository.ResourceRepository;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
                         CurrentUserService currentUserService,
                         UserRepository userRepository,
                         ResourceRepository resourceRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
    }

    // ✅ CREATE TICKET (DTO version)
    public TicketResponseDto createTicket(TicketRequestDto dto) {

        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new RuntimeException("You must be logged in to create a ticket"));

        Ticket t = new Ticket();

        t.setTitle(dto.getTitle());
        t.setDescription(dto.getDescription());
        t.setCategory(TicketCategory.valueOf(dto.getCategory()));
        t.setPriority(TicketPriority.valueOf(dto.getPriority()));
        Resource resource = resourceRepository.findById(dto.getResourceId())
            .orElseThrow(() -> new RuntimeException("Resource not found"));
        t.setResource(resource);
        t.setStatus(TicketStatus.OPEN);
        t.setCreatedByEmail(currentUser.getEmail());

        ticketRepository.save(t);

        String actor = displayName(currentUser);
        String createdMessage = "New ticket #" + t.getId() + " submitted by " + actor + ": " + t.getTitle();
        Set<UUID> adminRecipients = new HashSet<>();
        userRepository.findByRole(Role.ADMIN).forEach(admin -> adminRecipients.add(admin.getId()));
        if (!isAdmin(currentUser)) {
            adminRecipients.remove(currentUser.getId());
        }
        notifyUsers(adminRecipients, createdMessage, NotificationType.TICKET_UPDATED);

        return mapToDto(t);
    }

    // ✅ GET ALL (with optional filter later)
    public List<TicketResponseDto> getAllTickets(TicketStatus status) {

        List<Ticket> tickets;

        if (status != null) {
            tickets = ticketRepository.findByStatus(status);
        } else {
            tickets = ticketRepository.findAll();
        }

        return tickets.stream().map(this::mapToDto).toList();
    }

    // ✅ GET MY TICKETS (later filter by user)
    public List<TicketResponseDto> getMyTickets() {
        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new RuntimeException("You must be logged in to view tickets"));

        List<Ticket> tickets = ticketRepository.findByCreatedByEmail(currentUser.getEmail());
        return tickets.stream().map(this::mapToDto).toList();
    }

        public List<TicketResponseDto> getAssignedTickets() {
        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new RuntimeException("You must be logged in to view tickets"));

            String email = currentUser.getEmail();
            String name = currentUser.getName();

            List<Ticket> emailMatches = ticketRepository.findByTechnicianAssignedIgnoreCase(email);
            List<Ticket> nameMatches = (name == null || name.isBlank())
                ? java.util.List.of()
                : ticketRepository.findByTechnicianAssignedIgnoreCase(name);

            return java.util.stream.Stream.concat(emailMatches.stream(), nameMatches.stream())
                .distinct()
                .map(this::mapToDto)
                .toList();
        }

    // ✅ GET SINGLE TICKET
    public TicketResponseDto getTicket(Long id) {
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new RuntimeException("You must be logged in to view this ticket"));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = t.getCreatedByEmail() != null
            && t.getCreatedByEmail().equalsIgnoreCase(currentUser.getEmail());
        boolean isAssignedTech = t.getTechnicianAssigned() != null
            && (t.getTechnicianAssigned().equalsIgnoreCase(currentUser.getEmail())
            || t.getTechnicianAssigned().equalsIgnoreCase(currentUser.getName()));

        if (!isAdmin && !isOwner && !isAssignedTech) {
            throw new RuntimeException("You do not have access to this ticket");
        }

        return mapToDto(t);
    }

    // ✅ UPDATE STATUS + RESOLUTION
    public TicketResponseDto updateStatus(Long id, TicketStatus status, String resolution) {

        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new RuntimeException("You must be logged in to update a ticket"));

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);

        if (resolution != null && !resolution.isEmpty()) {
            ticket.setResolutionNotes(resolution);
        }

        ticketRepository.save(ticket);

        String updateMessage = "Ticket #" + ticket.getId() + " was updated to " + status + " by " + displayName(currentUser) + ".";
        Set<UUID> recipients = new HashSet<>();
        findTicketCreator(ticket).ifPresent(user -> recipients.add(user.getId()));
        findAssignedTechnician(ticket).ifPresent(user -> recipients.add(user.getId()));
        userRepository.findByRole(Role.ADMIN).forEach(admin -> recipients.add(admin.getId()));
        if (!isAdmin(currentUser)) {
            recipients.remove(currentUser.getId());
        }
        notifyUsers(recipients, updateMessage, NotificationType.TICKET_UPDATED);

        return mapToDto(ticket);
    }

    // ✅ ASSIGN TECHNICIAN
    public TicketResponseDto assignTechnician(Long ticketId, String technician) {

        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new RuntimeException("You must be logged in to assign a technician"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String normalized = normalizeTechnician(technician);
        ticket.setTechnicianAssigned(normalized);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        ticketRepository.save(ticket);

    Optional<User> assignedTechnician = findAssignedTechnician(ticket);
    assignedTechnician
        .filter(user -> isAdmin(currentUser) || !user.getId().equals(currentUser.getId()))
        .ifPresent(user -> notificationService.notifyUser(
            user.getId(),
            "You were assigned to ticket #" + ticket.getId() + ": " + ticket.getTitle(),
            NotificationType.TICKET_UPDATED,
            null
        ));

    findTicketCreator(ticket)
        .filter(user -> isAdmin(currentUser) || !user.getId().equals(currentUser.getId()))
        .ifPresent(user -> notificationService.notifyUser(
            user.getId(),
            "Your ticket #" + ticket.getId() + " was assigned to " + (ticket.getTechnicianAssigned() == null ? "a technician" : ticket.getTechnicianAssigned()) + ".",
            NotificationType.TICKET_UPDATED,
            null
        ));

        return mapToDto(ticket);
    }

    private String normalizeTechnician(String technician) {
        if (technician == null || technician.isBlank()) {
            return technician;
        }

        String trimmed = technician.trim();
        String extracted = extractTechnicianFromJson(trimmed);
        final String lookupValue = (extracted != null && !extracted.isBlank())
            ? extracted.trim()
            : trimmed;

        return userRepository.findByEmail(lookupValue)
                .map(User::getEmail)
                .or(() -> userRepository.findByNameIgnoreCase(lookupValue).map(User::getEmail))
                .orElse(lookupValue);
    }

    private String extractTechnicianFromJson(String raw) {
        if (!raw.startsWith("{") || !raw.endsWith("}")) {
            return null;
        }

        Pattern pattern = Pattern.compile("\\\"technician\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");
        Matcher matcher = pattern.matcher(raw);
        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }

    // ✅ UPDATE FULL TICKET
    public TicketResponseDto updateTicket(Long id, TicketStatus status, String resolution) {

        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new RuntimeException("You must be logged in to update a ticket"));

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);
        ticket.setResolutionNotes(resolution);

        ticketRepository.save(ticket);

        String updateMessage = "Ticket #" + ticket.getId() + " was updated to " + status + " by " + displayName(currentUser) + ".";
        Set<UUID> recipients = new HashSet<>();
        findTicketCreator(ticket).ifPresent(user -> recipients.add(user.getId()));
        findAssignedTechnician(ticket).ifPresent(user -> recipients.add(user.getId()));
        if (!isAdmin(currentUser)) {
            recipients.remove(currentUser.getId());
        }
        notifyUsers(recipients, updateMessage, NotificationType.TICKET_UPDATED);

        return mapToDto(ticket);
    }

    // ✅ DTO MAPPER (VERY IMPORTANT)
    private TicketResponseDto mapToDto(Ticket t) {

        TicketResponseDto dto = new TicketResponseDto();

        dto.setId(t.getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setTechnicianAssigned(t.getTechnicianAssigned());
        dto.setResolutionNotes(t.getResolutionNotes());
        dto.setStatus(t.getStatus());
        dto.setCategory(t.getCategory());
        dto.setPriority(t.getPriority());
        if (t.getResource() != null) {
            dto.setResourceId(t.getResource().getId());
            dto.setResourceName(t.getResource().getName());
            dto.setResourceLocation(t.getResource().getLocation());
        }

        return dto;
    }

    public void deleteTicket(Long id) {

    if (!ticketRepository.existsById(id)) {
        throw new RuntimeException("Ticket not found");
    }

    ticketRepository.deleteById(id);
    }

    private Optional<User> findTicketCreator(Ticket ticket) {
        String createdByEmail = ticket.getCreatedByEmail();
        if (createdByEmail == null || createdByEmail.isBlank()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(createdByEmail.trim());
    }

    private Optional<User> findAssignedTechnician(Ticket ticket) {
        String assigned = ticket.getTechnicianAssigned();
        if (assigned == null || assigned.isBlank()) {
            return Optional.empty();
        }

        String normalized = assigned.trim();
        return userRepository.findByEmail(normalized)
                .or(() -> userRepository.findByNameIgnoreCase(normalized));
    }

    private void notifyUsers(Set<UUID> recipients, String message, NotificationType type) {
        recipients.forEach(userId -> notificationService.notifyUser(userId, message, type, null));
    }

    private String displayName(User user) {
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName().trim();
        }
        return user.getEmail();
    }

    private boolean isAdmin(User user) {
        return user != null && user.getRole() == Role.ADMIN;
    }
}