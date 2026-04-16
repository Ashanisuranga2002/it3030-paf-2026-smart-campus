package com.groupxx.smartcampus.resource.service;

import com.groupxx.smartcampus.common.exception.BadRequestException;
import com.groupxx.smartcampus.common.exception.ResourceNotFoundException;
import com.groupxx.smartcampus.resource.dto.ResourceResponse;
import com.groupxx.smartcampus.resource.dto.ResourceUpsertRequest;
import com.groupxx.smartcampus.resource.entity.CampusResource;
import com.groupxx.smartcampus.resource.entity.ResourceStatus;
import com.groupxx.smartcampus.resource.entity.ResourceType;
import com.groupxx.smartcampus.resource.repository.CampusResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final CampusResourceRepository campusResourceRepository;

    public ResourceService(CampusResourceRepository campusResourceRepository) {
        this.campusResourceRepository = campusResourceRepository;
    }

    public List<ResourceResponse> getResources(String search, ResourceType type, ResourceStatus status) {
        String normalizedSearch = search == null ? null : search.trim().toLowerCase();

        return campusResourceRepository.findAll().stream()
                .filter(resource -> {
                    if (normalizedSearch == null || normalizedSearch.isBlank()) {
                        return true;
                    }
                    return resource.getName().toLowerCase().contains(normalizedSearch)
                            || resource.getLocation().toLowerCase().contains(normalizedSearch);
                })
                .filter(resource -> type == null || resource.getType() == type)
                .filter(resource -> status == null || resource.getStatus() == status)
                .map(this::toResponse)
                .toList();
    }

    public ResourceResponse createResource(ResourceUpsertRequest request) {
        validateRequest(request);

        CampusResource resource = new CampusResource();
        resource.setName(request.getName().trim());
        resource.setDescription(request.getDescription().trim());
        resource.setLocation(request.getLocation().trim());
        resource.setCapacity(request.getCapacity());
        resource.setImageUrl(normalizeOptional(request.getImageUrl()));
        resource.setType(request.getType());
        resource.setStatus(request.getStatus());

        return toResponse(campusResourceRepository.save(resource));
    }

    public ResourceResponse updateResource(Long id, ResourceUpsertRequest request) {
        validateRequest(request);

        CampusResource resource = getResourceEntityById(id);
        resource.setName(request.getName().trim());
        resource.setDescription(request.getDescription().trim());
        resource.setLocation(request.getLocation().trim());
        resource.setCapacity(request.getCapacity());
        resource.setImageUrl(normalizeOptional(request.getImageUrl()));
        resource.setType(request.getType());
        resource.setStatus(request.getStatus());

        return toResponse(campusResourceRepository.save(resource));
    }

    public void deleteResource(Long id) {
        CampusResource resource = getResourceEntityById(id);
        campusResourceRepository.delete(resource);
    }

    public CampusResource getResourceEntityById(Long id) {
        return campusResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    public ResourceResponse getResourceById(Long id) {
        return toResponse(getResourceEntityById(id));
    }

    private void validateRequest(ResourceUpsertRequest request) {
        if (request.getCapacity() == null || request.getCapacity() < 1) {
            throw new BadRequestException("Capacity must be at least 1");
        }
    }

    private String normalizeOptional(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        return value.trim();
    }

    private ResourceResponse toResponse(CampusResource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setName(resource.getName());
        response.setDescription(resource.getDescription());
        response.setLocation(resource.getLocation());
        response.setCapacity(resource.getCapacity());
        response.setImageUrl(resource.getImageUrl());
        response.setType(resource.getType());
        response.setStatus(resource.getStatus());
        return response;
    }
}
