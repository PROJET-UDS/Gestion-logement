package com.immobilier.reservation.dto;

import com.immobilier.reservation.entity.StatutReservation;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationResponseDTO {

    private Long id;
    private Long logementId;
    private String logementTitre;
    private String clientId;
    private String clientNom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private BigDecimal prixTotal;
    private StatutReservation statut;
    private LocalDateTime dateCreation;

    public ReservationResponseDTO() {
    }

    public ReservationResponseDTO(Long id, Long logementId, String logementTitre,
                                  String clientId, String clientNom,
                                  LocalDate dateDebut, LocalDate dateFin,
                                  BigDecimal prixTotal, StatutReservation statut,
                                  LocalDateTime dateCreation) {
        this.id = id;
        this.logementId = logementId;
        this.logementTitre = logementTitre;
        this.clientId = clientId;
        this.clientNom = clientNom;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.prixTotal = prixTotal;
        this.statut = statut;
        this.dateCreation = dateCreation;
    }

    // Getters et Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLogementId() {
        return logementId;
    }

    public void setLogementId(Long logementId) {
        this.logementId = logementId;
    }

    public String getLogementTitre() {
        return logementTitre;
    }

    public void setLogementTitre(String logementTitre) {
        this.logementTitre = logementTitre;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientNom() {
        return clientNom;
    }

    public void setClientNom(String clientNom) {
        this.clientNom = clientNom;
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

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}

