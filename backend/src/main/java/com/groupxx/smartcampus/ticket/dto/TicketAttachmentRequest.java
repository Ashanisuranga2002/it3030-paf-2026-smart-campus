package com.groupxx.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketAttachmentRequest {

    @NotBlank(message = "Attachment file name is required")
    @Size(max = 255, message = "Attachment file name must be 255 characters or less")
    private String fileName;

    @NotBlank(message = "Attachment content type is required")
    @Size(max = 100, message = "Attachment content type must be 100 characters or less")
    private String contentType;

    @NotBlank(message = "Attachment data is required")
    private String dataBase64;
}
