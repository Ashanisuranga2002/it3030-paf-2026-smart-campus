package com.groupxx.smartcampus.booking.repository;

import com.groupxx.smartcampus.booking.entity.Booking;
import com.groupxx.smartcampus.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserEmailOrderByCreatedAtDesc(String email);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            Long resourceId,
            Collection<BookingStatus> status,
            LocalDateTime endTime,
            LocalDateTime startTime
    );
}