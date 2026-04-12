package com.groupxx.smartcampus.auth.service;

import com.groupxx.smartcampus.auth.entity.RoleType;
import com.groupxx.smartcampus.auth.entity.User;
import com.groupxx.smartcampus.auth.repository.UserRepository;
import com.groupxx.smartcampus.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;

    public void updateRole(Long userId, RoleType role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        userRepository.save(user);
    }
}
