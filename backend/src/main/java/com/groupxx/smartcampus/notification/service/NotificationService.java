package com.groupxx.smartcampus.notification.service;

import com.groupxx.smartcampus.auth.entity.User;
import com.groupxx.smartcampus.auth.repository.UserRepository;
import com.groupxx.smartcampus.common.exception.ForbiddenException;
import com.groupxx.smartcampus.common.exception.ResourceNotFoundException;
import com.groupxx.smartcampus.notification.dto.NotificationResponse;
import com.groupxx.smartcampus.notification.entity.Notification;
import com.groupxx.smartcampus.notification.entity.NotificationType;
import com.groupxx.smartcampus.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(String userEmail,
                                   NotificationType type,
                                   String title,
                                   String message,
                                   String referenceType,
                                   Long referenceId) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .type(n.getType())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .referenceType(n.getReferenceType())
                        .referenceId(n.getReferenceId())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();
    }

    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndIsReadFalse(email);
    }

    @Transactional
    public void markAsRead(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getEmail().equals(email)) {
            throw new ForbiddenException("You cannot modify another user's notification");
        }

        notification.setIsRead(true);
    }

    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        notifications.forEach(n -> n.setIsRead(true));
    }
}
