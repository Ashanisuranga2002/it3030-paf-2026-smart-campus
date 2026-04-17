package com.groupxx.smartcampus.resource.service;

import com.groupxx.smartcampus.auth.entity.RoleType;
import com.groupxx.smartcampus.common.exception.BadRequestException;
import com.groupxx.smartcampus.common.exception.ResourceNotFoundException;
import com.groupxx.smartcampus.notification.entity.NotificationType;
import com.groupxx.smartcampus.notification.service.NotificationService;
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
    private final NotificationService notificationService;

    public ResourceService(CampusResourceRepository campusResourceRepository,
                           NotificationService notificationService) {
        this.campusResourceRepository = campusResourceRepository;
        this.notificationService = notificationService;
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

        CampusResource saved = campusResourceRepository.save(resource);
        notifyAllRoles(
            NotificationType.ADMIN_ALERT,
            "New Resource Added",
            "Resource '" + saved.getName() + "' is now available on campus.",
            saved.getId()
        );
        return toResponse(saved);
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

        CampusResource saved = campusResourceRepository.save(resource);
        notifyAllRoles(
            NotificationType.ADMIN_ALERT,
            "Resource Updated",
            "Resource '" + saved.getName() + "' details were updated.",
            saved.getId()
        );
        return toResponse(saved);
    }

    public void deleteResource(Long id) {
        CampusResource resource = getResourceEntityById(id);
        Long resourceId = resource.getId();
        String resourceName = resource.getName();
        campusResourceRepository.delete(resource);
        notifyAllRoles(
                NotificationType.ADMIN_ALERT,
                "Resource Removed",
                "Resource '" + resourceName + "' was removed from listings.",
                resourceId
        );
    }

    private void notifyAllRoles(NotificationType type, String title, String message, Long referenceId) {
        notificationService.createNotificationForRole(RoleType.ADMIN, type, title, message, "RESOURCE", referenceId);
        notificationService.createNotificationForRole(RoleType.TECHNICIAN, type, title, message, "RESOURCE", referenceId);
        notificationService.createNotificationForRole(RoleType.USER, type, title, message, "RESOURCE", referenceId);
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
