package com.immobilier.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "reservation")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "logement_id", nullable = false)
    private Long logementId;

    @Column(name = "proprietaire_id")
    private String proprietaireId;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "prix_logement", nullable = false)
    private BigDecimal prixLogement;

    @Column(name = "prix_total", nullable = false)
    private BigDecimal prixTotal;

    @Column(name = "montant_reservation", nullable = false)
    private BigDecimal montantReservation;

    @Column(name = "montant_restant", nullable = false)
    private BigDecimal montantRestant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutReservation statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_statut")
    private PaymentStatut paymentStatut;

    @Column(name = "methode_payment")
    private String methodepayment;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_payment")
    private LocalDateTime datepayment;

    public Reservation() {
    }

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = StatutReservation.EN_ATTENTE;
        }
        if (this.paymentStatut == null) {
            this.paymentStatut = PaymentStatut.EN_ATTENTE;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLogementId() { return logementId; }
    public void setLogementId(Long logementId) { this.logementId = logementId; }

    public String getProprietaireId() { return proprietaireId; }
    public void setProprietaireId(String proprietaireId) { this.proprietaireId = proprietaireId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public BigDecimal getPrixLogement() { return prixLogement; }
    public void setPrixLogement(BigDecimal prixLogement) { this.prixLogement = prixLogement; }

    public BigDecimal getPrixTotal() { return prixTotal; }
    public void setPrixTotal(BigDecimal prixTotal) { this.prixTotal = prixTotal; }

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

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDatepayment() { return datepayment; }
    public void setDatepayment(LocalDateTime datepayment) { this.datepayment = datepayment; }
}
