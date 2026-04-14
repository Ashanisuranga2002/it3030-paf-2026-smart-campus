package com.groupxx.smartcampus.resource.controller;

import com.groupxx.smartcampus.resource.dto.ResourceResponse;
import com.groupxx.smartcampus.resource.entity.ResourceStatus;
import com.groupxx.smartcampus.resource.entity.ResourceType;
import com.groupxx.smartcampus.resource.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status
    ) {
        return ResponseEntity.ok(resourceService.getResources(search, type, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }
}
