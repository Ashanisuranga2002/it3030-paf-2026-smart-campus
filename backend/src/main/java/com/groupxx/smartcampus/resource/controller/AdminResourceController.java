package com.groupxx.smartcampus.resource.controller;

import com.groupxx.smartcampus.resource.dto.ResourceResponse;
import com.groupxx.smartcampus.resource.dto.ResourceUpsertRequest;
import com.groupxx.smartcampus.resource.entity.ResourceStatus;
import com.groupxx.smartcampus.resource.entity.ResourceType;
import com.groupxx.smartcampus.resource.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/resources")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status
    ) {
        return ResponseEntity.ok(resourceService.getResources(search, type, status));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceUpsertRequest request) {
        return ResponseEntity.ok(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceUpsertRequest request
    ) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
