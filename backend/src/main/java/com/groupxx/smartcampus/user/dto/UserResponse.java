package com.groupxx.smartcampus.user.dto;

import com.groupxx.smartcampus.auth.entity.RoleType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private RoleType role;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
