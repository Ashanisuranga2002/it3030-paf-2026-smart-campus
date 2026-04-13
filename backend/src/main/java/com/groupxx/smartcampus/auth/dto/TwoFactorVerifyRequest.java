package com.groupxx.smartcampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorVerifyRequest {
    @NotBlank
    private String challengeId;

    @NotBlank
    private String code;
}
