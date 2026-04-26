package com.smartcampus.incident.controller;

import com.smartcampus.incident.dto.AttachmentLinkRequest;
import com.smartcampus.incident.entity.TicketAttachment;
import com.smartcampus.incident.service.AttachmentService;
import jakarta.validation.Valid;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin
public class AttachmentController {

    private static final Logger logger = LoggerFactory.getLogger(AttachmentController.class);

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/{ticketId}")
    public TicketAttachment uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) throws Exception {

        logger.info("Uploading attachment for ticket {} (name: {}, size: {})", ticketId, file.getOriginalFilename(), file.getSize());

        return attachmentService.uploadAttachment(ticketId, file);
    }

    @GetMapping("/{ticketId}")
    public List<TicketAttachment> getAttachments(@PathVariable Long ticketId) {

        return attachmentService.getAttachments(ticketId);
    }

    @PostMapping("/{ticketId}/external")
    public TicketAttachment registerExternalAttachment(
            @PathVariable Long ticketId,
            @Valid @RequestBody AttachmentLinkRequest request) {

        logger.info("Registering external attachment for ticket {} (name: {}, type: {})",
                ticketId, request.getFileName(), request.getFileType());

        return attachmentService.registerExternalAttachment(
                ticketId,
                request.getFileUrl(),
                request.getFileName(),
                request.getFileType());
    }

    @GetMapping("/file/{attachmentId}")
    public ResponseEntity<Resource> getAttachmentFile(@PathVariable Long attachmentId) throws Exception {
        TicketAttachment attachment = attachmentService.getAttachment(attachmentId);
        Resource resource = attachmentService.downloadAttachment(attachmentId);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        String fileType = attachment.getFileType();
        if (fileType != null && !fileType.isBlank()) {
            try {
                mediaType = MediaType.parseMediaType(fileType);
            } catch (IllegalArgumentException ignored) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        String fileName = (attachment.getFileName() == null || attachment.getFileName().isBlank())
                ? "attachment"
                : attachment.getFileName();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }
}