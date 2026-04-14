package com.groupxx.smartcampus.resource.dto;

import com.groupxx.smartcampus.resource.entity.ResourceStatus;
import com.groupxx.smartcampus.resource.entity.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResourceUpsertRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String imageUrl;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotNull(message = "Status is required")
    private ResourceStatus status;
}
