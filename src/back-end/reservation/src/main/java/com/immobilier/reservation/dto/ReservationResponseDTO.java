package com.immobilier.reservation.dto;

import com.immobilier.reservation.entity.PaymentStatut;
import com.immobilier.reservation.entity.StatutReservation;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationResponseDTO {

    private Long id;
    private Long logementId;
    private String logementTitre;
    private String logementAdresse;
    private String clientId;
    private String clientNom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private BigDecimal prixLogement;
    private BigDecimal montantReservation;
    private BigDecimal montantRestant;
    private StatutReservation statut;
    private PaymentStatut paymentStatut;
    private String methodepayment;
    private LocalDateTime dateCreation;
    private LocalDateTime datepayment;
    private Long joursRestants;

    public ReservationResponseDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLogementId() { return logementId; }
    public void setLogementId(Long logementId) { this.logementId = logementId; }

    public String getLogementTitre() { return logementTitre; }
    public void setLogementTitre(String logementTitre) { this.logementTitre = logementTitre; }

    public String getLogementAdresse() { return logementAdresse; }
    public void setLogementAdresse(String logementAdresse) { this.logementAdresse = logementAdresse; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientNom() { return clientNom; }
    public void setClientNom(String clientNom) { this.clientNom = clientNom; }

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

    public String getMethodepayment() { return methodepayment; }
    public void setMethodepayment(String methodepayment) { this.methodepayment = methodepayment; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDatepayment() { return datepayment; }
    public void setDatepayment(LocalDateTime datepayment) { this.datepayment = datepayment; }

    public Long getJoursRestants() { return joursRestants; }
    public void setJoursRestants(Long joursRestants) { this.joursRestants = joursRestants; }
}
