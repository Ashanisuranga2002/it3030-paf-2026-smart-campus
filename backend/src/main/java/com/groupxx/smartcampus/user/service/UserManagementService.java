package com.groupxx.smartcampus.user.service;

import com.groupxx.smartcampus.auth.entity.RoleType;
import com.groupxx.smartcampus.auth.entity.User;
import com.groupxx.smartcampus.auth.repository.UserRepository;
import com.groupxx.smartcampus.common.exception.BadRequestException;
import com.groupxx.smartcampus.common.exception.ResourceNotFoundException;
import com.groupxx.smartcampus.notification.entity.NotificationType;
import com.groupxx.smartcampus.notification.service.NotificationService;
import com.groupxx.smartcampus.user.dto.UserCreateRequest;
import com.groupxx.smartcampus.user.dto.UserResponse;
import com.groupxx.smartcampus.user.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse createUser(UserCreateRequest request, String actorEmail) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("A user with this email already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(request.getActive())
                .build();

        User saved = userRepository.save(user);
        notificationService.createNotificationForRole(
                RoleType.ADMIN,
                NotificationType.USER_CREATED,
                "User Created",
                "Admin " + actorEmail + " created user " + saved.getEmail(),
                "USER",
                saved.getId()
        );

        return toResponse(saved);
    }

    public UserResponse updateUser(Long id, UserUpdateRequest request, String actorEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailAndIdNot(normalizedEmail, id)) {
            throw new BadRequestException("A user with this email already exists");
        }

        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setRole(request.getRole());
        user.setActive(request.getActive());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 8 || request.getPassword().length() > 72) {
                throw new BadRequestException("Password must be between 8 and 72 characters");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);
        notificationService.createNotificationForRole(
                RoleType.ADMIN,
                NotificationType.USER_UPDATED,
                "User Updated",
                "Admin " + actorEmail + " updated user " + saved.getEmail(),
                "USER",
                saved.getId()
        );

        return toResponse(saved);
    }

    public void deleteUser(Long id, String actorEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long deletedId = user.getId();
        String deletedEmail = user.getEmail();
        userRepository.delete(user);

        notificationService.createNotificationForRole(
                RoleType.ADMIN,
                NotificationType.USER_DELETED,
                "User Deleted",
                "Admin " + actorEmail + " deleted user " + deletedEmail,
                "USER",
                deletedId
        );
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
