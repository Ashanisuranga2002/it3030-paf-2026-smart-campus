package com.groupxx.smartcampus.ticket.dto;

import com.groupxx.smartcampus.ticket.entity.TicketPriority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TicketCreateRequest {

    @NotBlank(message = "Description is required")
    @Size(max = 1200, message = "Description must be 1200 characters or less")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location must be 255 characters or less")
    private String location;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must be 100 characters or less")
    private String category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact email must be valid")
    @Size(max = 255, message = "Contact email must be 255 characters or less")
    private String contactEmail;

    @Size(max = 30, message = "Contact phone must be 30 characters or less")
    private String contactPhone;

    @Valid
    private List<TicketAttachmentRequest> attachments;
}
