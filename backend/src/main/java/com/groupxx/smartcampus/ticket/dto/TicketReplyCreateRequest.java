package com.groupxx.smartcampus.ticket.dto;

import com.groupxx.smartcampus.ticket.entity.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketReplyCreateRequest {

    @NotBlank(message = "Reply message is required")
    @Size(max = 1000, message = "Reply message must be 1000 characters or less")
    private String message;

    private TicketStatus status;
}
