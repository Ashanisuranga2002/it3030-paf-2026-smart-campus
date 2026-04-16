package com.groupxx.smartcampus.booking.dto;

import com.groupxx.smartcampus.booking.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public class BookingDecisionRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    @Size(max = 255, message = "Rejection reason is too long")
    private String rejectionReason;

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}