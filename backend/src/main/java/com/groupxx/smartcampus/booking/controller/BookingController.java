package com.groupxx.smartcampus.booking.controller;

import com.groupxx.smartcampus.booking.dto.BookingCreateRequest;
import com.groupxx.smartcampus.booking.dto.BookingDecisionRequest;
import com.groupxx.smartcampus.booking.dto.BookingResponse;
import com.groupxx.smartcampus.booking.dto.BookingUpdateRequest;
import com.groupxx.smartcampus.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/mine")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getMyBookings(authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByResource(@PathVariable Long resourceId) {
        return ResponseEntity.ok(bookingService.getBookingsByResource(resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(bookingService.getBookingById(authentication.getName(), id));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingCreateRequest request,
                                                         Authentication authentication) {
        return ResponseEntity.ok(bookingService.createBooking(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(@PathVariable Long id,
                                                         @Valid @RequestBody BookingUpdateRequest request,
                                                         Authentication authentication) {
        return ResponseEntity.ok(bookingService.updateBooking(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id, Authentication authentication) {
        bookingService.deleteBooking(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/decision")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> decideBooking(@PathVariable Long id,
                                                         @Valid @RequestBody BookingDecisionRequest request,
                                                         Authentication authentication) {
        return ResponseEntity.ok(bookingService.decideBooking(authentication.getName(), id, request));
    }
}