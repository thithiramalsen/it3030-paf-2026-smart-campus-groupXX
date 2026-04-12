package com.smartcampus.incident.service;

import com.smartcampus.incident.dto.CommentRequestDto;
import com.smartcampus.incident.entity.Ticket;
import com.smartcampus.incident.entity.TicketComment;
import com.smartcampus.incident.repository.TicketCommentRepository;
import com.smartcampus.incident.repository.TicketRepository;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.User;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final CurrentUserService currentUserService;

    public CommentService(TicketRepository ticketRepository,
                          TicketCommentRepository commentRepository,
                          CurrentUserService currentUserService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.currentUserService = currentUserService;
    }

    // add comment
    public TicketComment addComment(Long ticketId, CommentRequestDto request) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketComment comment = new TicketComment();
        comment.setAuthor(resolveAuthor(request.getAuthor()));
        comment.setMessage(request.getMessage());
        comment.setTicket(ticket);

        return commentRepository.save(comment);
    }

    private String resolveAuthor(String providedAuthor) {
        if (providedAuthor != null && !providedAuthor.isBlank()) {
            return providedAuthor.trim();
        }

        User currentUser = currentUserService.getCurrentUser().orElse(null);
        if (currentUser == null) {
            return "Unknown";
        }

        if (currentUser.getName() != null && !currentUser.getName().isBlank()) {
            return currentUser.getName().trim();
        }

        return currentUser.getEmail();
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