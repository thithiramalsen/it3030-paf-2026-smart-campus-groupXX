package com.smartcampus.booking.controller;

import com.smartcampus.booking.dto.BookingActionDto;
import com.smartcampus.booking.dto.BookingRequestDto;
import com.smartcampus.booking.dto.BookingResponseDto;
import com.smartcampus.booking.enums.BookingStatus;
import com.smartcampus.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST /api/bookings
    // Any logged in user can request a booking
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDto> createBooking(
            @Valid @RequestBody BookingRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(bookingService.createBooking(dto));
    }

    // GET /api/bookings/my
    // User sees only their own bookings
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    // GET /api/bookings
    // Admin sees all bookings, optional ?status=PENDING filter
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    // GET /api/bookings/{id}
    // Get a single booking by ID
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDto> getBookingById(
            @PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // PUT /api/bookings/{id}/approve
    // Admin approves a booking
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDto> approveBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingActionDto dto) {
        return ResponseEntity.ok(bookingService.approveBooking(id, dto));
    }

    // PUT /api/bookings/{id}/reject
    // Admin rejects a booking with a reason
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDto> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingActionDto dto) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, dto));
    }

    // PUT /api/bookings/{id}/cancel
    // User cancels their own booking, Admin can cancel any
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDto> cancelBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingActionDto dto) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, dto));
    }
}