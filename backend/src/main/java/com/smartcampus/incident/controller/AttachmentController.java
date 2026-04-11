package com.smartcampus.incident.controller;

import com.smartcampus.incident.entity.TicketAttachment;
import com.smartcampus.incident.service.AttachmentService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/{ticketId}")
    public TicketAttachment uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) throws Exception {

        return attachmentService.uploadAttachment(ticketId, file);
    }

    @GetMapping("/{ticketId}")
    public List<TicketAttachment> getAttachments(@PathVariable Long ticketId) {

        return attachmentService.getAttachments(ticketId);
    }
}