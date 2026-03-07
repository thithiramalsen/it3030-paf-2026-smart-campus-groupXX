package com.smartcampus.incident.repository;

import com.smartcampus.incident.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}