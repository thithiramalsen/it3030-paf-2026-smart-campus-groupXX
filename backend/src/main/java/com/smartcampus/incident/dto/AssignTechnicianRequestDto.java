package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignTechnicianRequestDto {

    @NotBlank(message = "Technician is required")
    private String technician;

    public String getTechnician() {
        return technician;
    }

    public void setTechnician(String technician) {
        this.technician = technician;
    }
}
