package com.smartcampus.booking.exception;

public class BookingActionNotAllowedException extends RuntimeException {
    public BookingActionNotAllowedException(String message) {
        super(message);
    }
}