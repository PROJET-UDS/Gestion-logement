package com.immobilier.reservation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LogementInfoDTO {

    private Long id;
    private String titre;
    private String description;
    private BigDecimal prix;
    private String adresse;
    private String ville;
    private String typeLogement;
    private String typeTransaction;
    private String statutAnnonce;
    private String proprietaireId;

    public LogementInfoDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrix() { return prix; }
    public void setPrix(BigDecimal prix) { this.prix = prix; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getTypeLogement() { return typeLogement; }
    public void setTypeLogement(String typeLogement) { this.typeLogement = typeLogement; }

    public String getTypeTransaction() { return typeTransaction; }
    public void setTypeTransaction(String typeTransaction) { this.typeTransaction = typeTransaction; }

    public String getStatutAnnonce() { return statutAnnonce; }
    public void setStatutAnnonce(String statutAnnonce) { this.statutAnnonce = statutAnnonce; }

    public String getProprietaireId() { return proprietaireId; }
    public void setProprietaireId(String proprietaireId) { this.proprietaireId = proprietaireId; }
}
