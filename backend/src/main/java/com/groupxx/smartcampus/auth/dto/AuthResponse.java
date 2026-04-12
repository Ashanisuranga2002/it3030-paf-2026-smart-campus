package com.groupxx.smartcampus.auth.dto;

import com.groupxx.smartcampus.auth.entity.RoleType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private RoleType role;
}
