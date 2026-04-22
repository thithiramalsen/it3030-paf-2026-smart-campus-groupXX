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

    private static final LocalTime DAY_START = LocalTime.of(8, 0);
    private static final LocalTime DAY_END = LocalTime.of(20, 0);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd");

    public SlotSuggestionService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<SlotSuggestionDto> suggestSlots(Long resourceId, LocalDate fromDate, int durationMinutes) {

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

    private List<SlotSuggestionDto> findSlotsOnDay(Long resourceId, LocalDate date, int durationMinutes) {

        List<Booking> existing = bookingRepository
            .findApprovedBookingsByResourceAndDate(resourceId, date);

        int bookingCount = existing.size();
        String busyLevel;
        if (bookingCount <= 1) {
            busyLevel = "QUIET";
        } else if (bookingCount <= 3) {
            busyLevel = "MODERATE";
        } else {
            busyLevel = "PEAK";
        }

        List<SlotSuggestionDto> available = new ArrayList<>();
        LocalTime cursor = DAY_START;

        for (Booking booked : existing) {
            if (cursor.plusMinutes(durationMinutes).compareTo(booked.getStartTime()) <= 0) {
                available.add(buildSuggestion(date, cursor, cursor.plusMinutes(durationMinutes), bookingCount, busyLevel));
                if (available.size() >= 3) return available;
            }
            if (booked.getEndTime().isAfter(cursor)) {
                cursor = booked.getEndTime();
            }
        }

        if (cursor.plusMinutes(durationMinutes).compareTo(DAY_END) <= 0) {
            available.add(buildSuggestion(date, cursor, cursor.plusMinutes(durationMinutes), bookingCount, busyLevel));
        }

        return available;
    }

    private SlotSuggestionDto buildSuggestion(LocalDate date, LocalTime start, LocalTime end, int bookingCount, String busyLevel) {
        SlotSuggestionDto dto = new SlotSuggestionDto();
        dto.setDate(date);
        dto.setSuggestedStart(start);
        dto.setSuggestedEnd(end);
        dto.setTotalBookingsOnDay(bookingCount);
        dto.setBusyLevel(busyLevel);
        dto.setMessage(String.format("Available on %s, %s – %s",
            date.format(DATE_FMT),
            start.format(TIME_FMT),
            end.format(TIME_FMT)));
        return dto;
    }
}