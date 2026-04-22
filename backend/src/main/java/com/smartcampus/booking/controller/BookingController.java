package com.smartcampus.booking.controller;

import com.smartcampus.booking.dto.BookingActionDto;
import com.smartcampus.booking.dto.BookingRequestDto;
import com.smartcampus.booking.dto.BookingResponseDto;
import com.smartcampus.booking.dto.SlotSuggestionDto;
import com.smartcampus.booking.enums.BookingStatus;
import com.smartcampus.booking.service.BookingService;
import com.smartcampus.booking.service.SlotSuggestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final SlotSuggestionService slotSuggestionService;

    public BookingController(BookingService bookingService,
                             SlotSuggestionService slotSuggestionService) {
        this.bookingService = bookingService;
        this.slotSuggestionService = slotSuggestionService;
    }

    // POST /api/bookings
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDto> createBooking(
            @Valid @RequestBody BookingRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(bookingService.createBooking(dto));
    }

    // GET /api/bookings/my
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    // GET /api/bookings
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    // GET /api/bookings/{id}
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDto> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // PUT /api/bookings/{id}/approve
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDto> approveBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingActionDto dto) {
        return ResponseEntity.ok(bookingService.approveBooking(id, dto));
    }

    // PUT /api/bookings/{id}/reject
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDto> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingActionDto dto) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, dto));
    }

    // PUT /api/bookings/{id}/cancel
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDto> cancelBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingActionDto dto) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, dto));
    }

    // GET /api/bookings/suggest-slots
    @GetMapping("/suggest-slots")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SlotSuggestionDto>> suggestSlots(
            @RequestParam Long resourceId,
            @RequestParam LocalDate date,
            @RequestParam(defaultValue = "60") int durationMinutes) {
        return ResponseEntity.ok(
            slotSuggestionService.suggestSlots(resourceId, date, durationMinutes)
        );
    }
}