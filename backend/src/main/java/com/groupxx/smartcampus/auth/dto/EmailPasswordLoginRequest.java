package com.groupxx.smartcampus.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailPasswordLoginRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}
