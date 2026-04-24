package com.smartcampus.incident.service;

import com.smartcampus.incident.dto.CommentRequestDto;
import com.smartcampus.incident.entity.Ticket;
import com.smartcampus.incident.entity.TicketComment;
import com.smartcampus.incident.entity.TicketStatus;
import com.smartcampus.incident.repository.TicketCommentRepository;
import com.smartcampus.incident.repository.TicketRepository;
import com.smartcampus.notification.NotificationService;
import com.smartcampus.notification.NotificationType;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class CommentService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommentService(TicketRepository ticketRepository,
                          TicketCommentRepository commentRepository,
                          CurrentUserService currentUserService,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // add comment
    public TicketComment addComment(Long ticketId, CommentRequestDto request) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User currentUser = currentUserService.getCurrentUser()
                .orElseThrow(() -> new RuntimeException("You must be logged in to comment"));

        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
            if (currentUser.getRole() != Role.ADMIN) {
                throw new RuntimeException("Comments are disabled for resolved or closed tickets");
            }
        }

        TicketComment comment = new TicketComment();
        comment.setAuthor(resolveAuthor(request.getAuthor()));
        comment.setMessage(request.getMessage());
        comment.setTicket(ticket);

        TicketComment saved = commentRepository.save(comment);

        String message = buildCommentNotificationMessage(currentUser, ticket.getId(), saved.getMessage());
        Set<UUID> recipients = new HashSet<>();
        findTicketCreator(ticket).ifPresent(user -> recipients.add(user.getId()));
        findAssignedTechnician(ticket).ifPresent(user -> recipients.add(user.getId()));
        userRepository.findByRole(Role.ADMIN).forEach(admin -> recipients.add(admin.getId()));
        if (!isAdmin(currentUser)) {
            recipients.remove(currentUser.getId());
        }
        recipients.forEach(userId ->
            notificationService.notifyUser(userId, message, NotificationType.COMMENT_ADDED, null)
        );

        return saved;
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

    private Optional<User> findTicketCreator(Ticket ticket) {
        String createdByEmail = ticket.getCreatedByEmail();
        if (createdByEmail == null || createdByEmail.isBlank()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(createdByEmail.trim());
    }

    private Optional<User> findAssignedTechnician(Ticket ticket) {
        String assigned = ticket.getTechnicianAssigned();
        if (assigned == null || assigned.isBlank()) {
            return Optional.empty();
        }

        String normalized = assigned.trim();
        return userRepository.findByEmail(normalized)
                .or(() -> userRepository.findByNameIgnoreCase(normalized));
    }

    private String buildCommentNotificationMessage(User currentUser, Long ticketId, String commentMessage) {
        String actor = (currentUser.getName() != null && !currentUser.getName().isBlank())
                ? currentUser.getName().trim()
                : currentUser.getEmail();

        String sanitized = commentMessage == null ? "" : commentMessage.trim();
        if (sanitized.length() > 120) {
            sanitized = sanitized.substring(0, 117) + "...";
        }

        if (sanitized.isEmpty()) {
            return actor + " commented on ticket #" + ticketId + ".";
        }

        return actor + " commented on ticket #" + ticketId + ": " + sanitized;
    }

    private boolean isAdmin(User user) {
        return user != null && user.getRole() == Role.ADMIN;
    }
}