package com.immobilier.reservation.dto;

public class PaiementResponseDTO {

    private Long id;
    private String status;

    public PaiementResponseDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
