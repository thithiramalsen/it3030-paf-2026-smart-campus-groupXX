package com.smartcampus.incident.controller;

import com.smartcampus.incident.dto.*;
import com.smartcampus.incident.entity.TicketStatus;
import com.smartcampus.incident.service.TicketService;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin
public class TicketController {

    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    public TicketController(TicketService ticketService,
                            CurrentUserService currentUserService) {
        this.ticketService = ticketService;
        this.currentUserService = currentUserService;
    }

    // ✅ CREATE
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDto> createTicket(
            @Valid @RequestBody TicketRequestDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(dto));
    }

    // ✅ GET ALL (ADMIN, MANAGER)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponseDto>> getAllTickets(
            @RequestParam(required = false) TicketStatus status) {

        User currentUser = currentUserService.getCurrentUser()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in"));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers and admins can view all tickets");
        }

        return ResponseEntity.ok(ticketService.getAllTickets(status));
    }

    // ✅ GET MY
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponseDto>> getMyTickets() {
        return ResponseEntity.ok(ticketService.getMyTickets());
    }

    // ✅ GET ASSIGNED (TECHNICIAN)
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketResponseDto>> getAssignedTickets() {
        return ResponseEntity.ok(ticketService.getAssignedTickets());
    }

    // ✅ GET ONE
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDto> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    // ✅ UPDATE STATUS
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketResponseDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateDto dto) {

        return ResponseEntity.ok(
                ticketService.updateStatus(
                        id,
                        TicketStatus.valueOf(dto.getStatus()),
                        dto.getResolutionNotes()
                )
        );
    }

    // ✅ ASSIGN TECHNICIAN
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDto> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequestDto request) {

        return ResponseEntity.ok(
                ticketService.assignTechnician(id, request.getTechnician())
        );
    }

    // 🔥 ✅ DELETE TICKET
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {

        ticketService.deleteTicket(id);

        return ResponseEntity.noContent().build();
    }
}