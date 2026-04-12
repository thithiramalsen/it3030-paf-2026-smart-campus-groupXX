package com.smartcampus.incident.repository;

import com.smartcampus.incident.entity.Ticket;
import com.smartcampus.incident.entity.TicketStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ✅ THIS FIXES YOUR ERROR
    List<Ticket> findByStatus(TicketStatus status);
}