package com.groupxx.smartcampus.ticket.dto;

import com.groupxx.smartcampus.auth.entity.RoleType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TicketReplyResponse {
    private Long id;
    private Long authorId;
    private String authorName;
    private RoleType authorRole;
    private String message;
    private LocalDateTime createdAt;
}
