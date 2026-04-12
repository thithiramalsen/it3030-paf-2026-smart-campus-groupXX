package com.smartcampus.incident.service;

import com.smartcampus.incident.dto.TicketRequestDto;
import com.smartcampus.incident.dto.TicketResponseDto;
import com.smartcampus.incident.entity.*;
import com.smartcampus.incident.repository.TicketRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    // ✅ CREATE TICKET (DTO version)
    public TicketResponseDto createTicket(TicketRequestDto dto) {

        Ticket t = new Ticket();

        t.setTitle(dto.getTitle());
        t.setDescription(dto.getDescription());
        t.setCategory(TicketCategory.valueOf(dto.getCategory()));
        t.setPriority(TicketPriority.valueOf(dto.getPriority()));
        t.setLocation(TicketLocation.valueOf(dto.getLocation()));
        t.setStatus(TicketStatus.OPEN);

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
        List<Ticket> tickets = ticketRepository.findAll();
        return tickets.stream().map(this::mapToDto).toList();
    }

    // ✅ GET SINGLE TICKET
    public TicketResponseDto getTicket(Long id) {
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
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

        ticket.setTechnicianAssigned(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        ticketRepository.save(ticket);

        return mapToDto(ticket);
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
        dto.setLocation(t.getLocation());

        return dto;
    }
}