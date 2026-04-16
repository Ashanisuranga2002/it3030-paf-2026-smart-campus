package com.groupxx.smartcampus.auth.service;

import com.groupxx.smartcampus.auth.dto.AuthResponse;
import com.groupxx.smartcampus.auth.dto.RegisterResponse;
import com.groupxx.smartcampus.auth.dto.TwoFactorChallengeResponse;
import com.groupxx.smartcampus.auth.dto.UserProfileResponse;
import com.groupxx.smartcampus.auth.entity.RoleType;
import com.groupxx.smartcampus.auth.entity.User;
import com.groupxx.smartcampus.auth.repository.UserRepository;
import com.groupxx.smartcampus.auth.security.JwtService;
import com.groupxx.smartcampus.common.exception.BadRequestException;
import com.groupxx.smartcampus.common.exception.ResourceNotFoundException;
import com.groupxx.smartcampus.notification.entity.NotificationType;
import com.groupxx.smartcampus.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final OtpMailService otpMailService;
    private final NotificationService notificationService;

    private static final Logger LOGGER = Logger.getLogger(AuthService.class.getName());
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int OTP_EXPIRE_MINUTES = 5;

    @Value("${app.mail.require-delivery:false}")
    private boolean requireOtpEmailDelivery;

    private final Map<String, TwoFactorChallenge> challenges = new ConcurrentHashMap<>();

    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .build();
    }

    public RegisterResponse register(String name, String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        User existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (existingUser != null) {
            if (existingUser.getPasswordHash() != null && !existingUser.getPasswordHash().isBlank()) {
                throw new BadRequestException("An account with this email already exists");
            }

            existingUser.setPasswordHash(passwordEncoder.encode(password));
            if (name != null && !name.trim().isBlank()) {
                existingUser.setName(name.trim());
            }

            User updated = userRepository.save(existingUser);
            return RegisterResponse.builder()
                    .message("Password set successfully. Please sign in to continue.")
                    .userId(updated.getId())
                    .email(updated.getEmail())
                    .build();
        }

        User user = User.builder()
                .name(name.trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(password))
                .role(RoleType.USER)
                .active(true)
                .build();

        User saved = userRepository.save(user);

        notificationService.createNotificationForRole(
            RoleType.ADMIN,
            NotificationType.USER_REGISTERED,
            "New User Registration",
            "A new user registered: " + saved.getEmail(),
            "USER",
            saved.getId()
        );

        return RegisterResponse.builder()
                .message("Account created successfully. Please sign in to continue.")
                .userId(saved.getId())
                .email(saved.getEmail())
                .build();
    }

    public AuthResponse loginWithEmailPassword(String email, String password) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new BadRequestException("This account has no password set. Use Google sign-in or create a password from the Create account page.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse issueTokenForEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildAuthResponse(user);
    }

    public String startTwoFactorChallenge(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String challengeId = UUID.randomUUID().toString();
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINUTES);

        challenges.put(challengeId, new TwoFactorChallenge(user.getEmail(), code, expiresAt));
        boolean sent = otpMailService.sendOtp(user.getEmail(), code);
        if (!sent && requireOtpEmailDelivery) {
            challenges.remove(challengeId);
            throw new BadRequestException("Unable to send verification code email. Please check mail configuration and try again.");
        }
        if (!sent) {
            LOGGER.warning(() -> "Email delivery unavailable; using local OTP fallback for " + user.getEmail());
        }
        LOGGER.info(() -> "2FA challenge created for " + user.getEmail() + " (valid " + OTP_EXPIRE_MINUTES + " minutes)");

        return challengeId;
    }

    public TwoFactorChallengeResponse startEmailPasswordLogin(String email, String password) {
        AuthResponse authResponse = loginWithEmailPassword(email, password);
        String challengeId = startTwoFactorChallenge(authResponse.getEmail());
        return TwoFactorChallengeResponse.builder()
                .challengeId(challengeId)
                .message("Verification code sent to your email")
                .build();
    }

    public AuthResponse verifyTwoFactor(String challengeId, String code) {
        TwoFactorChallenge challenge = challenges.get(challengeId);
        if (challenge == null) {
            throw new BadRequestException("Invalid 2FA challenge");
        }

        if (challenge.expiresAt().isBefore(LocalDateTime.now())) {
            challenges.remove(challengeId);
            throw new BadRequestException("2FA code expired. Please login again.");
        }

        if (!challenge.code().equals(code.trim())) {
            throw new BadRequestException("Invalid 2FA code");
        }

        User user = userRepository.findByEmail(challenge.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        challenges.remove(challengeId);
        return buildAuthResponse(user);
    }

        private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .build();
        }

    private record TwoFactorChallenge(String email, String code, LocalDateTime expiresAt) {
    }
}
