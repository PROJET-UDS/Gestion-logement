package com.immobilier.reservation.dto;

public class PaiementRequestDTO {

    private Long reservationId;
    private String userId;
    private Double amount;
    private String methode;
    private String phoneNumber;

    public PaiementRequestDTO() {
    }

    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getMethode() { return methode; }
    public void setMethode(String methode) { this.methode = methode; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
