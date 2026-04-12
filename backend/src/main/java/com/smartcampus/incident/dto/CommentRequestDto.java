package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentRequestDto {

    private String author;

    @NotBlank(message = "Message is required")
    private String message;

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
