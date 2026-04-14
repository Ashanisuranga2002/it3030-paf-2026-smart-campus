package com.groupxx.smartcampus.auth.controller;

import com.groupxx.smartcampus.auth.dto.AuthResponse;
import com.groupxx.smartcampus.auth.dto.EmailPasswordLoginRequest;
import com.groupxx.smartcampus.auth.dto.LoginUrlResponse;
import com.groupxx.smartcampus.auth.dto.RegisterRequest;
import com.groupxx.smartcampus.auth.dto.RegisterResponse;
import com.groupxx.smartcampus.auth.dto.RoleUpdateRequest;
import com.groupxx.smartcampus.auth.dto.TwoFactorVerifyRequest;
import com.groupxx.smartcampus.auth.dto.UserProfileResponse;
import com.groupxx.smartcampus.auth.service.AuthService;
import com.groupxx.smartcampus.auth.service.UserAdminService;
import com.groupxx.smartcampus.common.exception.BadRequestException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @GetMapping("/login-url")
    public ResponseEntity<LoginUrlResponse> getGoogleLoginUrl() {
        if (!isGoogleOAuthEnabled()) {
            throw new BadRequestException("Google sign-in is not configured on this server.");
        }
        return ResponseEntity.ok(LoginUrlResponse.builder().url("/oauth2/authorization/google?prompt=select_account").build());
    }

    private boolean isGoogleOAuthEnabled() {
        return googleClientId != null && !googleClientId.isBlank()
                && googleClientSecret != null && !googleClientSecret.isBlank();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(authentication.getName()));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request.getName(), request.getEmail(), request.getPassword()));
    }

    @PostMapping("/login/password")
    public ResponseEntity<AuthResponse> loginWithEmailPassword(
            @Valid @RequestBody EmailPasswordLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithEmailPassword(request.getEmail(), request.getPassword()));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<AuthResponse> verifyTwoFactor(@Valid @RequestBody TwoFactorVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyTwoFactor(request.getChallengeId(), request.getCode()));
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateRole(@PathVariable Long id,
                                           @Valid @RequestBody RoleUpdateRequest request) {
        userAdminService.updateRole(id, request.getRole());
        return ResponseEntity.noContent().build();
    }
}
