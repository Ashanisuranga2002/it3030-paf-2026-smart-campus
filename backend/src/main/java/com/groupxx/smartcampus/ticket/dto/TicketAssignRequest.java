package com.groupxx.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketAssignRequest {

    @NotNull(message = "Technician id is required")
    private Long technicianId;
}
