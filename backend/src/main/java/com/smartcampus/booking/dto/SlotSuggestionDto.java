package com.smartcampus.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SlotSuggestionDto {

    private LocalDate date;
    private LocalTime suggestedStart;
    private LocalTime suggestedEnd;
    private String message;

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getSuggestedStart() { return suggestedStart; }
    public void setSuggestedStart(LocalTime suggestedStart) { this.suggestedStart = suggestedStart; }

    public LocalTime getSuggestedEnd() { return suggestedEnd; }
    public void setSuggestedEnd(LocalTime suggestedEnd) { this.suggestedEnd = suggestedEnd; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}