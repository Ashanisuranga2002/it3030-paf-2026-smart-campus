package com.groupxx.smartcampus.auth.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class OtpMailService {

    private static final Logger LOGGER = Logger.getLogger(OtpMailService.class.getName());

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.from:noreply@smartcampus.local}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public OtpMailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public boolean sendOtp(String toEmail, String code) {
        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            LOGGER.warning("MAIL_USERNAME or MAIL_PASSWORD is not configured. OTP email delivery is disabled.");
            return false;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            LOGGER.warning(() -> "Mail sender not configured. OTP for " + toEmail + " is " + code);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Smart Campus Login Verification Code");
            message.setText("Your Smart Campus verification code is: " + code + "\nThis code is valid for 5 minutes.");
            mailSender.send(message);
            return true;
        } catch (Exception ex) {
            LOGGER.warning(() -> "Failed to send OTP email. OTP for " + toEmail + " is " + code + ". Reason: " + ex.getMessage());
            return false;
        }
    }
}
