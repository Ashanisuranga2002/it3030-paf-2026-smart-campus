package com.groupxx.smartcampus.auth.dto;

import com.groupxx.smartcampus.auth.entity.RoleType;
import jakarta.validation.constraints.NotNull;
public class RoleUpdateRequest {
    @NotNull
    private RoleType role;

    public RoleType getRole() {
        return role;
    }

    public void setRole(RoleType role) {
        this.role = role;
    }
}
