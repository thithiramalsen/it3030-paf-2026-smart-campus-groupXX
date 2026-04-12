/*package com.smartcampus.resource.service;

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
        return resourceRepository.findAll().stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    

    @Override
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        return mapToResponseDTO(resource);
    }

    @Override
    public List<ResourceResponseDTO> searchResources(ResourceType type, ResourceStatus status, String location, Integer capacity, String search) {
        return resourceRepository.findAll().stream()
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> location == null || location.isEmpty() || r.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(r -> capacity == null || r.getCapacity() >= capacity)
                .filter(r -> search == null || search.isEmpty() || r.getName().toLowerCase().contains(search.toLowerCase()))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponseDTO createResource(ResourceRequestDTO request) {
        Resource resource = Resource.builder()
                .name(request.getName()).type(request.getType())
                .capacity(request.getCapacity()).location(request.getLocation())
                .status(request.getStatus()).openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime()).imageUrl(request.getImageUrl())
                .description(request.getDescription()).build();
        return mapToResponseDTO(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO request) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        existing.setName(request.getName()); existing.setType(request.getType());
        existing.setCapacity(request.getCapacity()); existing.setLocation(request.getLocation());
        existing.setStatus(request.getStatus()); existing.setOpeningTime(request.getOpeningTime());
        existing.setClosingTime(request.getClosingTime()); existing.setImageUrl(request.getImageUrl());
        existing.setDescription(request.getDescription());
        return mapToResponseDTO(resourceRepository.save(existing));
    }

    @Override
    public void deleteResource(Long id) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        resourceRepository.delete(existing);
    }

    private ResourceResponseDTO mapToResponseDTO(Resource r) {
        return ResourceResponseDTO.builder()
                .id(r.getId()).name(r.getName()).type(r.getType())
                .capacity(r.getCapacity()).location(r.getLocation())
                .status(r.getStatus()).openingTime(r.getOpeningTime())
                .closingTime(r.getClosingTime()).imageUrl(r.getImageUrl())
                .description(r.getDescription()).createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt()).build();
    }
}
    -*/

package com.smartcampus.resource.service;

import com.smartcampus.resource.dto.ResourceRequestDTO;
import com.smartcampus.resource.dto.ResourceResponseDTO;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.repository.ResourceRepository;
import org.springframework.data.domain.Sort;
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
        return resourceRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
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
    public List<ResourceResponseDTO> searchResources(ResourceType type, ResourceStatus status, String location, Integer capacity, String search) {
        return resourceRepository.findAll().stream()
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> location == null || location.isEmpty() || r.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(r -> capacity == null || r.getCapacity() >= capacity)
                .filter(r -> search == null || search.isEmpty() || r.getName().toLowerCase().contains(search.toLowerCase()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponseDTO createResource(ResourceRequestDTO request) {
        Resource resource = Resource.builder()
                .name(request.getName()).type(request.getType())
                .capacity(request.getCapacity()).location(request.getLocation())
                .status(request.getStatus()).openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime()).imageUrl(request.getImageUrl())
                .description(request.getDescription()).build();
        return mapToResponseDTO(resourceRepository.save(resource));
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
        return mapToResponseDTO(resourceRepository.save(existing));
    }

    @Override
    public void deleteResource(Long id) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        resourceRepository.delete(existing);
    }

    private ResourceResponseDTO mapToResponseDTO(Resource r) {
        return ResourceResponseDTO.builder()
                .id(r.getId()).name(r.getName()).type(r.getType())
                .capacity(r.getCapacity()).location(r.getLocation())
                .status(r.getStatus()).openingTime(r.getOpeningTime())
                .closingTime(r.getClosingTime()).imageUrl(r.getImageUrl())
                .description(r.getDescription()).createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt()).build();
    }
}