package com.immobilier.reservation.event;

import com.immobilier.reservation.entity.StatutReservation;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Représentation d'un événement de réservation, publié sur RabbitMQ.
 * Sérialisable en JSON automatiquement grâce au Jackson2JsonMessageConverter.
 */
public class ReservationEvent implements Serializable {

    private Long reservationId;
    private Long logementId;
    private Long clientId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private BigDecimal prixTotal;
    private StatutReservation statut;

    public ReservationEvent() {
    }

    public ReservationEvent(Long reservationId, Long logementId, Long clientId,
                            LocalDate dateDebut, LocalDate dateFin,
                            BigDecimal prixTotal, StatutReservation statut) {
        this.reservationId = reservationId;
        this.logementId = logementId;
        this.clientId = clientId;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.prixTotal = prixTotal;
        this.statut = statut;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getLogementId() {
        return logementId;
    }

    public void setLogementId(Long logementId) {
        this.logementId = logementId;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public BigDecimal getPrixTotal() {
        return prixTotal;
    }

    public void setPrixTotal(BigDecimal prixTotal) {
        this.prixTotal = prixTotal;
    }

    public StatutReservation getStatut() {
        return statut;
    }

    public void setStatut(StatutReservation statut) {
        this.statut = statut;
    }
}

