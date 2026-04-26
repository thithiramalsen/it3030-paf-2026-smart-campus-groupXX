package com.smartcampus.resource.controller;

import com.smartcampus.resource.dto.ResourceRequestDTO;
import com.smartcampus.resource.dto.ResourceResponseDTO;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import com.smartcampus.resource.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.resource.service.QRCodeService;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "${app.frontend-url}")
public class ResourceController {

    private final ResourceService resourceService;
    private final QRCodeService qrCodeService;

    public ResourceController(ResourceService resourceService, QRCodeService qrCodeService) {
        this.resourceService = resourceService;
        this.qrCodeService = qrCodeService;
    }
    // GET all resources — all authenticated users
    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // GET single resource by id — all authenticated users
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // GET search with filters — all authenticated users
    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponseDTO>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(
                resourceService.searchResources(type, status, location, capacity, search)
        );
    }

    // POST create resource — ADMIN or MANAGER only
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(request));
    }

    // PUT update resource — ADMIN or MANAGER only
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    // DELETE resource — ADMIN or MANAGER only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/resources/{id}/qrcode
    // Returns QR code image for a resource
    @GetMapping(value = "/{id}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQRCode(@PathVariable Long id) {
        try {
            // Verify resource exists
            resourceService.getResourceById(id);
            byte[] qrCode = qrCodeService.generateQRCode(id);
            return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}