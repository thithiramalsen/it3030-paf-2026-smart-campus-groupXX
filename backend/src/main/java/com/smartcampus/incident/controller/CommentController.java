package com.smartcampus.incident.controller;

import com.smartcampus.incident.dto.CommentRequestDto;
import com.smartcampus.incident.entity.TicketComment;
import com.smartcampus.incident.service.CommentService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // add comment
    @PostMapping("/{ticketId}")
    public TicketComment addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequestDto request) {

        return commentService.addComment(ticketId, request);
    }

    // get comments
    @GetMapping("/{ticketId}")
    public List<TicketComment> getComments(@PathVariable Long ticketId) {
        return commentService.getComments(ticketId);
    }

    // edit comment
    @PutMapping("/{id}")
    public TicketComment updateComment(
            @PathVariable Long id,
            @RequestParam String message) {

        return commentService.updateComment(id, message);
    }

    // delete comment
    @DeleteMapping("/{id}")
    public void deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
    }
}