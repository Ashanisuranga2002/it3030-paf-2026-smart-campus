package com.groupxx.smartcampus.ticket.dto;

import com.groupxx.smartcampus.ticket.entity.TicketPriority;
import com.groupxx.smartcampus.ticket.entity.TicketStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class TicketResponse {
    private Long id;
    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private Long assignedToId;
    private String assignedToName;
    private String assignedToEmail;
    private String description;
    private String location;
    private String category;
    private TicketPriority priority;
    private TicketStatus status;
    private String contactEmail;
    private String contactPhone;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean editableByRequester;
    private boolean deletableByRequester;
    private List<TicketAttachmentResponse> attachments;
    private List<TicketReplyResponse> replies;
}
