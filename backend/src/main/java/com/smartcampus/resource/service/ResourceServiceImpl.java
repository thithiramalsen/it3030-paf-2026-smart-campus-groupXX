package com.smartcampus.resource.service;

import com.smartcampus.resource.dto.ResourceRequestDTO;
import com.smartcampus.resource.dto.ResourceResponseDTO;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        return mapToResponseDTO(resource);
    }

    @Override
    public List<ResourceResponseDTO> searchResources(
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer capacity,
            String search) {
        return resourceRepository.searchResources(type, status, location, capacity, search)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponseDTO createResource(ResourceRequestDTO request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(request.getStatus())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .build();

        Resource saved = resourceRepository.save(resource);
        return mapToResponseDTO(saved);
    }

    @Override
    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO request) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.setCapacity(request.getCapacity());
        existing.setLocation(request.getLocation());
        existing.setStatus(request.getStatus());
        existing.setOpeningTime(request.getOpeningTime());
        existing.setClosingTime(request.getClosingTime());
        existing.setImageUrl(request.getImageUrl());
        existing.setDescription(request.getDescription());

        Resource updated = resourceRepository.save(existing);
        return mapToResponseDTO(updated);
    }

    @Override
    public void deleteResource(Long id) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        resourceRepository.delete(existing);
    }

    // ── Helper ────────────────────────────────────────────────
    private ResourceResponseDTO mapToResponseDTO(Resource r) {
        return ResourceResponseDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .status(r.getStatus())
                .openingTime(r.getOpeningTime())
                .closingTime(r.getClosingTime())
                .imageUrl(r.getImageUrl())
                .description(r.getDescription())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
