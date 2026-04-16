package com.groupxx.smartcampus.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegisterResponse {
    private String message;
    private Long userId;
    private String email;
}