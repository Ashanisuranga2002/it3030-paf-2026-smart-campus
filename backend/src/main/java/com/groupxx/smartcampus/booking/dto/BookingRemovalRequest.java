package com.groupxx.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BookingRemovalRequest {

    @NotBlank(message = "Removal reason is required")
    @Size(max = 255, message = "Removal reason is too long")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}