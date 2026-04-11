package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingActionDto;
import com.smartcampus.booking.dto.BookingRequestDto;
import com.smartcampus.booking.dto.BookingResponseDto;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.enums.BookingStatus;
import com.smartcampus.booking.exception.BookingActionNotAllowedException;
import com.smartcampus.booking.exception.BookingConflictException;
import com.smartcampus.booking.exception.BookingNotFoundException;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.user.CurrentUserService;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUserService;

    public BookingService(BookingRepository bookingRepository,
                          CurrentUserService currentUserService) {
        this.bookingRepository = bookingRepository;
        this.currentUserService = currentUserService;
    }

    // CREATE BOOKING
    public BookingResponseDto createBooking(BookingRequestDto dto) {

        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new BookingActionNotAllowedException("You must be logged in to make a booking"));

        // Validate time range
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new BookingActionNotAllowedException("End time must be after start time");
        }

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            dto.getResourceId(),
            dto.getBookingDate(),
            dto.getStartTime(),
            dto.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new BookingConflictException(
                "This resource is already booked from " +
                conflict.getStartTime() + " to " + conflict.getEndTime() +
                " on " + conflict.getBookingDate() +
                ". Please choose a different time."
            );
        }

        // Save booking
        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setResourceId(dto.getResourceId());
        booking.setResourceName(dto.getResourceName());
        booking.setBookingDate(dto.getBookingDate());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setExpectedAttendees(dto.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return toDto(bookingRepository.save(booking));
    }

    // APPROVE BOOKING (Admin only)
    public BookingResponseDto approveBooking(String bookingId, BookingActionDto dto) {

        Booking booking = findById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingActionNotAllowedException(
                "Only PENDING bookings can be approved. Current status: " + booking.getStatus()
            );
        }

        // Re-check conflicts at approval time
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            booking.getResourceId(),
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                "Cannot approve — a conflicting booking already exists for this time slot"
            );
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminNote(dto != null ? dto.getNote() : null);
        booking.setUpdatedAt(Instant.now());

        return toDto(bookingRepository.save(booking));
    }

    // REJECT BOOKING (Admin only)
    public BookingResponseDto rejectBooking(String bookingId, BookingActionDto dto) {

        Booking booking = findById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingActionNotAllowedException(
                "Only PENDING bookings can be rejected. Current status: " + booking.getStatus()
            );
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(dto != null ? dto.getNote() : "No reason provided");
        booking.setUpdatedAt(Instant.now());

        return toDto(bookingRepository.save(booking));
    }

    // CANCEL BOOKING (User cancels own, Admin cancels any)
    public BookingResponseDto cancelBooking(String bookingId, BookingActionDto dto) {

        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new BookingActionNotAllowedException("You must be logged in"));

        Booking booking = findById(bookingId);

        if (booking.getStatus() != BookingStatus.APPROVED &&
            booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingActionNotAllowedException(
                "Cannot cancel a booking with status: " + booking.getStatus()
            );
        }

        // Users can only cancel their own bookings
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isAdmin && !booking.getUser().getId().equals(currentUser.getId())) {
            throw new BookingActionNotAllowedException("You can only cancel your own bookings");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(dto != null ? dto.getNote() : "No reason provided");
        booking.setUpdatedAt(Instant.now());

        return toDto(bookingRepository.save(booking));
    }

    // GET SINGLE BOOKING
    public BookingResponseDto getBookingById(String bookingId) {
        return toDto(findById(bookingId));
    }

    // GET MY BOOKINGS
    public List<BookingResponseDto> getMyBookings() {
        User currentUser = currentUserService.getCurrentUser()
            .orElseThrow(() -> new BookingActionNotAllowedException("You must be logged in"));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    // GET ALL BOOKINGS (Admin)
    public List<BookingResponseDto> getAllBookings(BookingStatus status) {
        List<Booking> bookings = (status != null)
            ? bookingRepository.findByStatusOrderByCreatedAtDesc(status)
            : bookingRepository.findAll();
        return bookings.stream().map(this::toDto).collect(Collectors.toList());
    }

    // HELPER - find booking or throw
    private Booking findById(String id) {
        return bookingRepository.findById(UUID.fromString(id))
            .orElseThrow(() -> new BookingNotFoundException(id));
    }

    // HELPER - convert Booking entity to BookingResponseDto
    public BookingResponseDto toDto(Booking b) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(b.getId());
        dto.setResourceId(b.getResourceId());
        dto.setResourceName(b.getResourceName());
        dto.setUserId(b.getUser().getId());
        dto.setUserName(b.getUser().getName());
        dto.setUserEmail(b.getUser().getEmail());
        dto.setBookingDate(b.getBookingDate());
        dto.setStartTime(b.getStartTime());
        dto.setEndTime(b.getEndTime());
        dto.setPurpose(b.getPurpose());
        dto.setExpectedAttendees(b.getExpectedAttendees());
        dto.setStatus(b.getStatus());
        dto.setAdminNote(b.getAdminNote());
        dto.setCancellationReason(b.getCancellationReason());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());
        return dto;
    }
}