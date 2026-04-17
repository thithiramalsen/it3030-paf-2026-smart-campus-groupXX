package com.smartcampus.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SlotSuggestionDto {

    private LocalDate date;
    private LocalTime suggestedStart;
    private LocalTime suggestedEnd;
    private String message;
    private int totalBookingsOnDay; // how busy this day is
    private String busyLevel;       // QUIET, MODERATE, PEAK

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getSuggestedStart() { return suggestedStart; }
    public void setSuggestedStart(LocalTime suggestedStart) { this.suggestedStart = suggestedStart; }

    public LocalTime getSuggestedEnd() { return suggestedEnd; }
    public void setSuggestedEnd(LocalTime suggestedEnd) { this.suggestedEnd = suggestedEnd; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getTotalBookingsOnDay() { return totalBookingsOnDay; }
    public void setTotalBookingsOnDay(int totalBookingsOnDay) { this.totalBookingsOnDay = totalBookingsOnDay; }

    public String getBusyLevel() { return busyLevel; }
    public void setBusyLevel(String busyLevel) { this.busyLevel = busyLevel; }
}