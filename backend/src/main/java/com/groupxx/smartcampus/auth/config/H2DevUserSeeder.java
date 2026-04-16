package com.groupxx.smartcampus.auth.config;

import com.groupxx.smartcampus.auth.entity.RoleType;
import com.groupxx.smartcampus.auth.entity.User;
import com.groupxx.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("h2")
@RequiredArgsConstructor
public class H2DevUserSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDevUser() {
        return args -> {
            seedOrUpdateUser("receptionist@healx.com", "Receptionist", "Reception@123", RoleType.USER);
            seedOrUpdateUser("rashmika@gmail.com", "Rashmika", "Rashmika@123", RoleType.USER);
            seedOrUpdateUser("tech1@smartcampus.local", "Technician One", "Tech@123", RoleType.TECHNICIAN);
            seedOrUpdateUser("tech2@smartcampus.local", "Technician Two", "Tech@123", RoleType.TECHNICIAN);
        };
    }

    private void seedOrUpdateUser(String email, String name, String rawPassword, RoleType role) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> User.builder()
                        .email(email)
                        .name(name)
                        .role(role)
                        .active(true)
                        .build());

        user.setName(name);
        user.setRole(role);
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));

        userRepository.save(user);
    }
}
