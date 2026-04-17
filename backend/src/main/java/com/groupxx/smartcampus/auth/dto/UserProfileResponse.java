package com.groupxx.smartcampus.auth.dto;

import com.groupxx.smartcampus.auth.entity.RoleType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String profilePicture;
    private String phoneNumber;
    private String department;
    private String faculty;
    private String address;
    private String bio;
    private RoleType role;
}
