package com.groupxx.smartcampus.resource.dto;

import com.groupxx.smartcampus.resource.entity.ResourceStatus;
import com.groupxx.smartcampus.resource.entity.ResourceType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResourceResponse {
    private Long id;
    private String name;
    private String description;
    private String location;
    private Integer capacity;
    private String imageUrl;
    private ResourceType type;
    private ResourceStatus status;
}
