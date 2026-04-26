package com.smartcampus.incident.service;

import com.smartcampus.incident.entity.Ticket;
import com.smartcampus.incident.entity.TicketAttachment;
import com.smartcampus.incident.repository.TicketAttachmentRepository;
import com.smartcampus.incident.repository.TicketRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class AttachmentService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;

    // upload folder inside project
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    public AttachmentService(TicketRepository ticketRepository,
                             TicketAttachmentRepository attachmentRepository) {
        this.ticketRepository = ticketRepository;
        this.attachmentRepository = attachmentRepository;
    }

    // ================================
    // Upload Attachment
    // ================================
    public TicketAttachment uploadAttachment(Long ticketId, MultipartFile file) throws Exception {
        Ticket ticket = getTicketOrThrow(ticketId);
        validateAttachmentCount(ticketId);

        // create upload folder if not exists
        File uploadFolder = new File(uploadDir);
        if (!uploadFolder.exists()) {
            uploadFolder.mkdirs();
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        File dest = new File(uploadDir + fileName);

        // safer file copy
        Files.copy(file.getInputStream(), dest.toPath(), StandardCopyOption.REPLACE_EXISTING);

        TicketAttachment attachment = new TicketAttachment();
        attachment.setFileName(fileName);
        attachment.setFileType(file.getContentType());
        attachment.setFilePath(fileName);
        attachment.setTicket(ticket);

        return attachmentRepository.save(attachment);
    }

    // ================================
    // Register externally hosted attachment
    // ================================
    public TicketAttachment registerExternalAttachment(Long ticketId, String fileUrl, String fileName, String fileType) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new RuntimeException("Attachment URL is required");
        }

        String normalizedUrl = fileUrl.trim();
        if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
            throw new RuntimeException("Attachment URL must start with http:// or https://");
        }

        Ticket ticket = getTicketOrThrow(ticketId);
        validateAttachmentCount(ticketId);

        TicketAttachment attachment = new TicketAttachment();
        attachment.setFileName((fileName == null || fileName.isBlank()) ? "attachment" : fileName.trim());
        attachment.setFileType((fileType == null || fileType.isBlank()) ? "application/octet-stream" : fileType.trim());
        attachment.setFilePath(normalizedUrl);
        attachment.setTicket(ticket);

        return attachmentRepository.save(attachment);
    }

    // ================================
    // Get attachments for a ticket
    // ================================
    public List<TicketAttachment> getAttachments(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }

    public TicketAttachment getAttachment(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    // ================================
    // Download attachment
    // ================================
    public Resource downloadAttachment(Long id) throws Exception {
        TicketAttachment attachment = getAttachment(id);

        Path path = resolveAttachmentPath(attachment);

        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found");
        }

        return resource;
    }

    private Path resolveAttachmentPath(TicketAttachment attachment) {
        String storedPath = attachment.getFilePath();
        if (storedPath == null || storedPath.isBlank()) {
            return new File(uploadDir + attachment.getFileName()).toPath();
        }

        Path candidate = new File(storedPath).toPath();
        if (candidate.isAbsolute()) {
            return candidate;
        }

        return new File(uploadDir + storedPath).toPath();
    }

    private Ticket getTicketOrThrow(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    private void validateAttachmentCount(Long ticketId) {
        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticketId);
        if (attachments.size() >= 3) {
            throw new RuntimeException("Maximum 3 attachments allowed");
        }
    }
}