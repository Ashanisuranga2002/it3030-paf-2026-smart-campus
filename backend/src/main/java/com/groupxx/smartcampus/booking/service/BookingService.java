package com.groupxx.smartcampus.booking.service;

import com.groupxx.smartcampus.auth.entity.RoleType;
import com.groupxx.smartcampus.auth.entity.User;
import com.groupxx.smartcampus.auth.repository.UserRepository;
import com.groupxx.smartcampus.booking.dto.BookingDecisionRequest;
import com.groupxx.smartcampus.booking.dto.BookingCreateRequest;
import com.groupxx.smartcampus.booking.dto.BookingResponse;
import com.groupxx.smartcampus.booking.dto.BookingUpdateRequest;
import com.groupxx.smartcampus.booking.entity.Booking;
import com.groupxx.smartcampus.booking.entity.BookingStatus;
import com.groupxx.smartcampus.booking.repository.BookingRepository;
import com.groupxx.smartcampus.common.exception.BadRequestException;
import com.groupxx.smartcampus.common.exception.ForbiddenException;
import com.groupxx.smartcampus.common.exception.ResourceNotFoundException;
import com.groupxx.smartcampus.notification.entity.NotificationType;
import com.groupxx.smartcampus.notification.service.NotificationService;
import com.groupxx.smartcampus.resource.entity.CampusResource;
import com.groupxx.smartcampus.resource.entity.ResourceStatus;
import com.groupxx.smartcampus.resource.repository.CampusResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private static final List<BookingStatus> CONFLICTING_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED
    );

    private final BookingRepository bookingRepository;
    private final CampusResourceRepository campusResourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          CampusResourceRepository campusResourceRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.campusResourceRepository = campusResourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<BookingResponse> getMyBookings(String email) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(normalizeEmail(email)).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public BookingResponse getBookingById(String email, Long bookingId) {
        Booking booking = getBookingEntityById(bookingId);
        User user = getUserByEmail(email);
        if (booking.getUser().getId().equals(user.getId()) || user.getRole() == RoleType.ADMIN) {
            return toResponse(booking);
        }
        throw new ForbiddenException("You can only view your own booking");
    }

    @Transactional
    public BookingResponse createBooking(String email, BookingCreateRequest request) {
        User user = getUserByEmail(email);
        CampusResource resource = getActiveResourceById(request.getResourceId());
        validateBookingWindow(request.getStartTime(), request.getEndTime());
        validateResourceCapacity(resource, request.getAttendeesCount());
        ensureNoConflict(resource.getId(), null, request.getStartTime(), request.getEndTime());

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setPurpose(request.getPurpose().trim());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setAttendeesCount(request.getAttendeesCount());
        booking.setStatus(BookingStatus.PENDING);

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateBooking(String email, Long bookingId, BookingUpdateRequest request) {
        User user = getUserByEmail(email);
        Booking booking = getBookingEntityById(bookingId);
        ensureOwner(booking, user.getEmail());

        CampusResource resource = getActiveResourceById(request.getResourceId());
        validateBookingWindow(request.getStartTime(), request.getEndTime());
        validateResourceCapacity(resource, request.getAttendeesCount());
        ensureNoConflict(resource.getId(), booking.getId(), request.getStartTime(), request.getEndTime());

        booking.setResource(resource);
        booking.setPurpose(request.getPurpose().trim());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setAttendeesCount(request.getAttendeesCount());
        booking.setStatus(BookingStatus.PENDING);
        booking.setRejectionReason(null);

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(String email, Long bookingId) {
        User user = getUserByEmail(email);
        Booking booking = getBookingEntityById(bookingId);
        ensureOwner(booking, user.getEmail());
        bookingRepository.delete(booking);
    }

    @Transactional
    public BookingResponse decideBooking(String adminEmail, Long bookingId, BookingDecisionRequest request) {
        User admin = getUserByEmail(adminEmail);
        if (admin.getRole() != RoleType.ADMIN) {
            throw new ForbiddenException("Only administrators can approve or reject bookings");
        }

        Booking booking = getBookingEntityById(bookingId);

        if (request.getStatus() == BookingStatus.APPROVED) {
            booking.setStatus(BookingStatus.APPROVED);
            booking.setRejectionReason(null);
            notificationService.createNotification(
                    booking.getUser().getEmail(),
                    NotificationType.BOOKING_APPROVED,
                    "Booking approved",
                    "Your booking for " + booking.getResource().getName() + " has been approved.",
                    "BOOKING",
                    booking.getId()
            );
        } else if (request.getStatus() == BookingStatus.REJECTED) {
            String rejectionReason = normalizeOptional(request.getRejectionReason());
            if (rejectionReason == null) {
                throw new BadRequestException("Rejection reason is required when rejecting a booking");
            }
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason(rejectionReason);
            notificationService.createNotification(
                    booking.getUser().getEmail(),
                    NotificationType.BOOKING_REJECTED,
                    "Booking rejected",
                    "Your booking for " + booking.getResource().getName() + " was rejected: " + rejectionReason,
                    "BOOKING",
                    booking.getId()
            );
        } else {
            throw new BadRequestException("Bookings can only be approved or rejected");
        }

        return toResponse(bookingRepository.save(booking));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Booking getBookingEntityById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private CampusResource getActiveResourceById(Long resourceId) {
        CampusResource resource = campusResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Selected resource is not available for booking");
        }

        return resource;
    }

    private void validateBookingWindow(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Start time and end time are required");
        }

        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }

        if (startTime.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Start time must be in the future");
        }
    }

    private void validateResourceCapacity(CampusResource resource, Integer attendeesCount) {
        if (attendeesCount != null && resource.getCapacity() != null && attendeesCount > resource.getCapacity()) {
            throw new BadRequestException("Attendees count exceeds the resource capacity");
        }
    }

    private void ensureNoConflict(Long resourceId, Long bookingId, LocalDateTime startTime, LocalDateTime endTime) {
        boolean hasConflict = bookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        resourceId,
                        CONFLICTING_STATUSES,
                        endTime,
                        startTime
                )
                .stream()
                .filter(booking -> bookingId == null || !booking.getId().equals(bookingId))
                .findAny()
                .isPresent();

        if (hasConflict) {
            throw new BadRequestException("This resource is already booked for the selected time range");
        }
    }

    private void ensureOwner(Booking booking, String email) {
        if (!booking.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("You can only modify your own booking");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        return value.trim();
    }

    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUser().getId());
        response.setUserName(booking.getUser().getName());
        response.setUserEmail(booking.getUser().getEmail());
        response.setResourceId(booking.getResource().getId());
        response.setResourceName(booking.getResource().getName());
        response.setResourceLocation(booking.getResource().getLocation());
        response.setPurpose(booking.getPurpose());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setAttendeesCount(booking.getAttendeesCount());
        response.setStatus(booking.getStatus());
        response.setRejectionReason(booking.getRejectionReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}