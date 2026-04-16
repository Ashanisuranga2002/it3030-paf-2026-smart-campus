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
import com.groupxx.smartcampus.resource.entity.CampusResource;
import com.groupxx.smartcampus.resource.entity.ResourceStatus;
import com.groupxx.smartcampus.resource.repository.CampusResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class BookingService {

    private static final List<BookingStatus> APPROVED_STATUSES = List.of(
        BookingStatus.APPROVED
    );

    private static final List<BookingStatus> RESERVED_STATUSES = List.of(
            BookingStatus.APPROVED,
            BookingStatus.REMOVAL_REQUEST
    );

    private final BookingRepository bookingRepository;
    private final CampusResourceRepository campusResourceRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          CampusResourceRepository campusResourceRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.campusResourceRepository = campusResourceRepository;
        this.userRepository = userRepository;
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

    public List<BookingResponse> getBookingsByResource(Long resourceId) {
        getResourceEntityById(resourceId);

        return bookingRepository
                .findByResourceIdAndStatusInAndEndTimeGreaterThanEqualOrderByStartTimeAsc(
                        Objects.requireNonNull(resourceId, "resourceId"),
                        APPROVED_STATUSES,
                        LocalDateTime.now()
                )
                .stream()
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

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setPurpose(request.getPurpose().trim());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setAttendeesCount(request.getAttendeesCount());
        booking.setStatus(BookingStatus.PENDING);
        booking.setRemovalReason(null);

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateBooking(String email, Long bookingId, BookingUpdateRequest request) {
        User user = getUserByEmail(email);
        Booking booking = getBookingEntityById(bookingId);
        ensureOwner(booking, user.getEmail());

        if (request.getStatus() == BookingStatus.REMOVAL_REQUEST) {
            if (booking.getStatus() != BookingStatus.APPROVED) {
                throw new BadRequestException("Only approved bookings can be marked for removal");
            }

            String removalReason = normalizeOptional(request.getRemovalReason());
            if (removalReason == null) {
                throw new BadRequestException("Removal reason is required when requesting removal");
            }

            booking.setStatus(BookingStatus.REMOVAL_REQUEST);
            booking.setRemovalReason(removalReason);
            booking.setRejectionReason(null);
        } else {
            CampusResource resource = getActiveResourceById(request.getResourceId());
            validateBookingWindow(request.getStartTime(), request.getEndTime());
            validateResourceCapacity(resource, request.getAttendeesCount());

            booking.setResource(resource);
            booking.setPurpose(request.getPurpose().trim());
            booking.setStartTime(request.getStartTime());
            booking.setEndTime(request.getEndTime());
            booking.setAttendeesCount(request.getAttendeesCount());
            booking.setStatus(BookingStatus.PENDING);
            booking.setRejectionReason(null);
            booking.setRemovalReason(null);
        }

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(String email, Long bookingId) {
        User user = getUserByEmail(email);
        Booking booking = getBookingEntityById(bookingId);
        boolean isAdmin = user.getRole() == RoleType.ADMIN;
        if (!isAdmin) {
            ensureOwner(booking, user.getEmail());
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new BadRequestException("Only pending bookings can be deleted");
            }
        }
        bookingRepository.delete(Objects.requireNonNull(booking, "booking"));
    }

    @Transactional
    public BookingResponse decideBooking(String adminEmail, Long bookingId, BookingDecisionRequest request) {
        User admin = getUserByEmail(adminEmail);
        if (admin.getRole() != RoleType.ADMIN) {
            throw new ForbiddenException("Only administrators can approve or reject bookings");
        }

        Booking booking = getBookingEntityById(bookingId);

        switch (request.getStatus()) {
            case APPROVED -> {
                validateBookingWindow(booking.getStartTime(), booking.getEndTime());
                validateResourceCapacity(booking.getResource(), booking.getAttendeesCount());
                ensureNoConflict(
                        booking.getResource().getId(),
                        booking.getId(),
                        booking.getStartTime(),
                        booking.getEndTime(),
                        RESERVED_STATUSES
                );
                booking.setStatus(BookingStatus.APPROVED);
                booking.setRejectionReason(null);
                booking.setRemovalReason(null);
            }
            case REJECTED -> {
                String rejectionReason = normalizeOptional(request.getRejectionReason());
                if (rejectionReason == null) {
                    throw new BadRequestException("Rejection reason is required when rejecting a booking");
                }
                booking.setStatus(BookingStatus.REJECTED);
                booking.setRejectionReason(rejectionReason);
                booking.setRemovalReason(null);
            }
            case REMOVAL_REQUEST -> throw new BadRequestException("Removal requests are submitted by the booking owner");
            default -> throw new BadRequestException("Bookings can only be approved, rejected, or marked for removal");
        }

        return toResponse(bookingRepository.save(booking));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Booking getBookingEntityById(Long bookingId) {
        return bookingRepository.findById(Objects.requireNonNull(bookingId, "bookingId"))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private CampusResource getActiveResourceById(Long resourceId) {
        CampusResource resource = campusResourceRepository.findById(Objects.requireNonNull(resourceId, "resourceId"))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Selected resource is not available for booking");
        }

        return resource;
    }

    private CampusResource getResourceEntityById(Long resourceId) {
        return campusResourceRepository.findById(Objects.requireNonNull(resourceId, "resourceId"))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
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

        private void ensureNoConflict(Long resourceId,
                      Long bookingId,
                      LocalDateTime startTime,
                      LocalDateTime endTime,
                      List<BookingStatus> statuses) {
        boolean hasConflict = bookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        resourceId,
                statuses,
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
        response.setRemovalReason(booking.getRemovalReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}