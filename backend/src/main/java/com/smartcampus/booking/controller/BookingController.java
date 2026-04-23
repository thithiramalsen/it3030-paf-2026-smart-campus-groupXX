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
    private final com.smartcampus.booking.repository.BookingRepository bookingRepository;

    public BookingController(BookingService bookingService,
                             SlotSuggestionService slotSuggestionService,
                             com.smartcampus.booking.repository.BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.slotSuggestionService = slotSuggestionService;
        this.bookingRepository = bookingRepository;
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

    // GET /api/bookings/busy-hours?resourceId=1&days=14
    // Returns hour-by-hour booking counts for heatmap
    @GetMapping("/busy-hours")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.Map<Integer, Integer>> getBusyHours(
            @RequestParam Long resourceId,
            @RequestParam(defaultValue = "14") int days) {

        java.util.Map<Integer, Integer> hourCounts = new java.util.LinkedHashMap<>();
        for (int h = 8; h < 20; h++) hourCounts.put(h, 0);

        java.time.LocalDate date = java.time.LocalDate.now();
        for (int d = 0; d < days; d++) {
            java.util.List<com.smartcampus.booking.entity.Booking> bookings =
                bookingRepository.findApprovedBookingsByResourceAndDate(resourceId, date);

            for (com.smartcampus.booking.entity.Booking b : bookings) {
                int start = b.getStartTime().getHour();
                int end = b.getEndTime().getHour();
                for (int h = start; h < end && h < 20; h++) {
                    hourCounts.merge(h, 1, Integer::sum);
                }
            }
            date = date.plusDays(1);
        }
        return ResponseEntity.ok(hourCounts);
    }

    // GET /api/bookings/daily-schedule?resourceId=1&date=2026-04-23
    // Returns hour-by-hour bookings for a specific day
    @GetMapping("/daily-schedule")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.Map<Integer, String>> getDailySchedule(
            @RequestParam Long resourceId,
            @RequestParam java.time.LocalDate date) {

        java.util.Map<Integer, String> schedule = new java.util.LinkedHashMap<>();
        for (int h = 8; h < 20; h++) schedule.put(h, "FREE");

        java.util.List<com.smartcampus.booking.entity.Booking> bookings =
            bookingRepository.findApprovedBookingsByResourceAndDate(resourceId, date);

        for (com.smartcampus.booking.entity.Booking b : bookings) {
            int start = b.getStartTime().getHour();
            int end = b.getEndTime().getHour();
            for (int h = start; h < end && h < 20; h++) {
                schedule.put(h, "BOOKED");
            }
        }
        return ResponseEntity.ok(schedule);
    }
}