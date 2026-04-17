package com.smartcampus.booking.dto;

import jakarta.validation.constraints.Size;

public class BookingActionDto {

    @Size(max = 500, message = "Note cannot exceed 500 characters")
    private String note;

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}