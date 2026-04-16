package com.groupxx.smartcampus.user.dto;

import com.groupxx.smartcampus.auth.entity.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name is too long")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    @Size(max = 180, message = "Email is too long")
    private String email;

    private String password;

    @NotNull(message = "Role is required")
    private RoleType role;

    @NotNull(message = "Active status is required")
    private Boolean active;
}
