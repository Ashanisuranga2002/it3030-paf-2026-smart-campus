package com.groupxx.smartcampus.ticket.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketAttachmentResponse {
    private Long id;
    private String fileName;
    private String contentType;
    private String dataBase64;
}
