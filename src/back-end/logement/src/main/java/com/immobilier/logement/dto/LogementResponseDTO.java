package com.immobilier.logement.dto;

import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.enums.StatutLogement;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class LogementResponseDTO {
    private Long id;
    private String titre;
    private String description;
    private BigDecimal prix;
    private String adresse;
    private String ville;
    private String quartier;
    private TypeLogement typeLogement;
    private TypeTransaction typeTransaction;
    private StatutAnnonce statutAnnonce;
    private StatutLogement statutLogement;
    private String proprietaireId;
    private BigDecimal charges;
    private Integer nbPieces;
    private Double superficie;
    private String equipements;
    private Boolean supprime;
    private List<MediaDTO> medias;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private Double latitude;
    private Double longitude;
    private Double noteMoyenne = 0.0;
    private Boolean enVedette = false;
    private LocalDateTime dateVedetteDebut;
    private LocalDateTime dateVedetteFin;
}
