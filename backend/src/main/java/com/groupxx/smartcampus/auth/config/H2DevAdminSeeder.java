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
public class H2DevAdminSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDevAdminUser() {
        return args -> {
            seedOrUpdateAdmin("admin@smartcampus.local", "Campus Admin", "Admin@123");
            seedOrUpdateAdmin("admin2@smartcampus.local", "Operations Admin", "Admin@123");
        };
    }

    private void seedOrUpdateAdmin(String email, String name, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> User.builder()
                        .email(email)
                        .name(name)
                        .role(RoleType.ADMIN)
                        .active(true)
                        .build());

        user.setName(name);
        user.setRole(RoleType.ADMIN);
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));

        userRepository.save(user);
    }
}
