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
            String email = "admin@smartcampus.local";
            String rawPassword = "Admin@123";

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> User.builder()
                            .email(email)
                            .name("Campus Admin")
                            .role(RoleType.ADMIN)
                            .active(true)
                            .build());

            user.setName("Campus Admin");
            user.setRole(RoleType.ADMIN);
            user.setActive(true);
            user.setPasswordHash(passwordEncoder.encode(rawPassword));

            userRepository.save(user);
        };
    }
}
