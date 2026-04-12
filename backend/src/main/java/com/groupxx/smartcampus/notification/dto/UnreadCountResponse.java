package com.groupxx.smartcampus.notification.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnreadCountResponse {
    private long unreadCount;
}
