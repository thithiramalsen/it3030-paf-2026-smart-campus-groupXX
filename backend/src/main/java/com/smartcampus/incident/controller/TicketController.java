package com.smartcampus.incident.controller;

import com.smartcampus.incident.entity.Ticket;
import com.smartcampus.incident.entity.TicketStatus;
import com.smartcampus.incident.service.TicketService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {

        return ticketService.createTicket(ticket);

    }

    @GetMapping
    public List<Ticket> getAllTickets() {

        return ticketService.getAllTickets();

    }

    @PutMapping("/{id}/status")
    public Ticket updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {

        return ticketService.updateStatus(id, status);

    }

    @PutMapping("/{id}/assign")
    public Ticket assignTechnician(
            @PathVariable Long id,
            @RequestParam String technician) {

        return ticketService.assignTechnician(id, technician);
    }

    @PutMapping("/{id}/update")
    public Ticket updateTicket(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @RequestParam String resolution) {

        return ticketService.updateTicket(id, status, resolution);
    }
}