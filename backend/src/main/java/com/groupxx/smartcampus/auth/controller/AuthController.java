package com.groupxx.smartcampus.auth.controller;

import com.groupxx.smartcampus.auth.dto.LoginUrlResponse;
import com.groupxx.smartcampus.auth.dto.RoleUpdateRequest;
import com.groupxx.smartcampus.auth.dto.UserProfileResponse;
import com.groupxx.smartcampus.auth.service.AuthService;
import com.groupxx.smartcampus.auth.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserAdminService userAdminService;

    @GetMapping("/login-url")
    public ResponseEntity<LoginUrlResponse> getGoogleLoginUrl() {
        return ResponseEntity.ok(LoginUrlResponse.builder().url("/oauth2/authorization/google").build());
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(authentication.getName()));
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateRole(@PathVariable Long id,
                                           @Valid @RequestBody RoleUpdateRequest request) {
        userAdminService.updateRole(id, request.getRole());
        return ResponseEntity.noContent().build();
    }
}
