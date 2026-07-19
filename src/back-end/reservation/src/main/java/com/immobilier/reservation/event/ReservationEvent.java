package com.immobilier.reservation.event;

import com.immobilier.reservation.entity.PaymentStatut;
import com.immobilier.reservation.entity.StatutReservation;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ReservationEvent implements Serializable {

    private Long reservationId;
    private Long logementId;
    private String clientId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private BigDecimal prixLogement;
    private BigDecimal montantReservation;
    private BigDecimal montantRestant;
    private StatutReservation statut;
    private PaymentStatut paymentStatut;

    public ReservationEvent() {
    }

    public ReservationEvent(Long reservationId, Long logementId, String clientId,
                            LocalDate dateDebut, LocalDate dateFin,
                            BigDecimal prixLogement, BigDecimal montantReservation,
                            BigDecimal montantRestant, StatutReservation statut,
                            PaymentStatut paymentStatut) {
        this.reservationId = reservationId;
        this.logementId = logementId;
        this.clientId = clientId;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.prixLogement = prixLogement;
        this.montantReservation = montantReservation;
        this.montantRestant = montantRestant;
        this.statut = statut;
        this.paymentStatut = paymentStatut;
    }

    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

    public Long getLogementId() { return logementId; }
    public void setLogementId(Long logementId) { this.logementId = logementId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public BigDecimal getPrixLogement() { return prixLogement; }
    public void setPrixLogement(BigDecimal prixLogement) { this.prixLogement = prixLogement; }

    public BigDecimal getMontantReservation() { return montantReservation; }
    public void setMontantReservation(BigDecimal montantReservation) { this.montantReservation = montantReservation; }

    public BigDecimal getMontantRestant() { return montantRestant; }
    public void setMontantRestant(BigDecimal montantRestant) { this.montantRestant = montantRestant; }

    public StatutReservation getStatut() { return statut; }
    public void setStatut(StatutReservation statut) { this.statut = statut; }

    public PaymentStatut getPaymentStatut() { return paymentStatut; }
    public void setPaymentStatut(PaymentStatut paymentStatut) { this.paymentStatut = paymentStatut; }
}
