package com.smartcampus.incident.repository;

import com.smartcampus.incident.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    List<TicketComment> findByTicketId(Long ticketId);
}