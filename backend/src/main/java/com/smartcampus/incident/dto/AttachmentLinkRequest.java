package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotBlank;

public class AttachmentLinkRequest {

    @NotBlank(message = "Attachment URL is required")
    private String fileUrl;

    private String fileName;

    private String fileType;

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
}
