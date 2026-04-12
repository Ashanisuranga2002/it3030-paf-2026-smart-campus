package com.groupxx.smartcampus.auth.dto;

import com.groupxx.smartcampus.auth.entity.RoleType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleUpdateRequest {
    @NotNull
    private RoleType role;
}
