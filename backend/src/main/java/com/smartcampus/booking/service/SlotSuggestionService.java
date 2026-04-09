package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.SlotSuggestionDto;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class SlotSuggestionService {
    

    private final BookingRepository bookingRepository;



    // Facility open hours
    private static final LocalTime DAY_START = LocalTime.of(8, 0);
    private static final LocalTime DAY_END = LocalTime.of(20, 0);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd");

    public SlotSuggestionService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // Returns up to 3 available slots starting from the given date
    // Searches forward up to 7 days if current day is fully booked
    public List<SlotSuggestionDto> suggestSlots(String resourceId, LocalDate fromDate, int durationMinutes) {

        List<SlotSuggestionDto> suggestions = new ArrayList<>();
        LocalDate searchDate = fromDate;
        int maxDays = 7;

        while (suggestions.size() < 3 && maxDays-- > 0) {
            List<SlotSuggestionDto> daySlots = findSlotsOnDay(resourceId, searchDate, durationMinutes);
            suggestions.addAll(daySlots);
            searchDate = searchDate.plusDays(1);
        }

        return suggestions.subList(0, Math.min(3, suggestions.size()));
    }

    // Finds free gaps on a single day that fit the requested duration
    private List<SlotSuggestionDto> findSlotsOnDay(String resourceId, LocalDate date, int durationMinutes) {

        // Get all approved bookings on this day sorted by start time
        List<Booking> existing = bookingRepository
            .findApprovedBookingsByResourceAndDate(resourceId, date);

        List<SlotSuggestionDto> available = new ArrayList<>();
        LocalTime cursor = DAY_START;

        for (Booking booked : existing) {
            // Is there a gap before this booking starts?
            if (cursor.plusMinutes(durationMinutes).compareTo(booked.getStartTime()) <= 0) {
                available.add(buildSuggestion(date, cursor, cursor.plusMinutes(durationMinutes)));
                if (available.size() >= 3) return available;
            }
            // Move cursor to end of this booking
            if (booked.getEndTime().isAfter(cursor)) {
                cursor = booked.getEndTime();
            }
        }

        // Check remaining time after last booking
        if (cursor.plusMinutes(durationMinutes).compareTo(DAY_END) <= 0) {
            available.add(buildSuggestion(date, cursor, cursor.plusMinutes(durationMinutes)));
        }

        return available;
    }

    private SlotSuggestionDto buildSuggestion(LocalDate date, LocalTime start, LocalTime end) {
        SlotSuggestionDto dto = new SlotSuggestionDto();
        dto.setDate(date);
        dto.setSuggestedStart(start);
        dto.setSuggestedEnd(end);
        dto.setMessage(String.format("Available on %s, %s – %s",
            date.format(DATE_FMT),
            start.format(TIME_FMT),
            end.format(TIME_FMT)));
        return dto;
    }
}