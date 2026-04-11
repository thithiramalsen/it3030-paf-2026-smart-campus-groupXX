package com.smartcampus.incident.service;

import com.smartcampus.incident.entity.Ticket;
import com.smartcampus.incident.entity.TicketComment;
import com.smartcampus.incident.repository.TicketCommentRepository;
import com.smartcampus.incident.repository.TicketRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;

    public CommentService(TicketRepository ticketRepository,
                          TicketCommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    // add comment
    public TicketComment addComment(Long ticketId, String author, String message) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketComment comment = new TicketComment();
        comment.setAuthor(author);
        comment.setMessage(message);
        comment.setTicket(ticket);

        return commentRepository.save(comment);
    }

    // get comments
    public List<TicketComment> getComments(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    // edit comment
    public TicketComment updateComment(Long id, String message) {

        TicketComment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        comment.setMessage(message);

        return commentRepository.save(comment);
    }

    // delete comment
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}