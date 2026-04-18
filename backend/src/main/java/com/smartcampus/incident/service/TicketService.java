package com.smartcampus.incident.service;

import com.smartcampus.incident.dto.TicketRequestDto;
import com.smartcampus.incident.dto.TicketResponseDto;
import com.smartcampus.incident.entity.*;
import com.smartcampus.incident.repository.TicketRepository;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.repository.ResourceRepository;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
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

    public TicketService(TicketRepository ticketRepository,
                         CurrentUserService currentUserService,
                         UserRepository userRepository,
                         ResourceRepository resourceRepository) {
        this.ticketRepository = ticketRepository;
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
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

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);

        if (resolution != null && !resolution.isEmpty()) {
            ticket.setResolutionNotes(resolution);
        }

        ticketRepository.save(ticket);

        return mapToDto(ticket);
    }

    // ✅ ASSIGN TECHNICIAN
    public TicketResponseDto assignTechnician(Long ticketId, String technician) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String normalized = normalizeTechnician(technician);
        ticket.setTechnicianAssigned(normalized);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        ticketRepository.save(ticket);

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

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);
        ticket.setResolutionNotes(resolution);

        ticketRepository.save(ticket);

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
}