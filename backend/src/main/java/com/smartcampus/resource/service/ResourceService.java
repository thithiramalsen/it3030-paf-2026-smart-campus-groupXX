package com.smartcampus.resource.service;

import com.smartcampus.resource.dto.ResourceRequestDTO;
import com.smartcampus.resource.dto.ResourceResponseDTO;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;

import java.util.List;

public interface ResourceService {

    // Get all resources
    List<ResourceResponseDTO> getAllResources();

    // Get single resource by id
    ResourceResponseDTO getResourceById(Long id);

    // Search with filters
    List<ResourceResponseDTO> searchResources(
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer capacity,
            String search
    );

    // Create new resource
    ResourceResponseDTO createResource(ResourceRequestDTO request);

    // Update existing resource
    ResourceResponseDTO updateResource(Long id, ResourceRequestDTO request);

    // Delete resource
    void deleteResource(Long id);
}
