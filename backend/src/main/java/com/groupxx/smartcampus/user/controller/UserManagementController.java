package com.groupxx.smartcampus.user.controller;

import com.groupxx.smartcampus.user.dto.UserCreateRequest;
import com.groupxx.smartcampus.user.dto.UserResponse;
import com.groupxx.smartcampus.user.dto.UserUpdateRequest;
import com.groupxx.smartcampus.user.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(userManagementService.createUser(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                                   @Valid @RequestBody UserUpdateRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(userManagementService.updateUser(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        userManagementService.deleteUser(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
