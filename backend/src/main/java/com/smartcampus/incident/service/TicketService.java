package com.smartcampus.incident.service;

import com.smartcampus.incident.entity.Ticket;
import com.smartcampus.incident.entity.TicketStatus;
import com.smartcampus.incident.repository.TicketRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Ticket createTicket(Ticket ticket) {

        ticket.setStatus(TicketStatus.OPEN);

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {

        return ticketRepository.findAll();
    }

    public Ticket updateStatus(Long id, TicketStatus status) {

        Ticket ticket = ticketRepository.findById(id).orElseThrow();

        ticket.setStatus(status);

        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(Long ticketId, String technician) {

    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    ticket.setTechnicianAssigned(technician);

    ticket.setStatus(TicketStatus.IN_PROGRESS);

    return ticketRepository.save(ticket);
}

public Ticket updateTicket(Long id, TicketStatus status, String resolution) {

    Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    ticket.setStatus(status);
    ticket.setResolutionNotes(resolution);

    return ticketRepository.save(ticket);
}

}