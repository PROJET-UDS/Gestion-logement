package com.immobilier.logement.dto;

import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class LogementRequestDTO {
    private String titre;
    private String description;
    private BigDecimal prix;
    private String adresse;
    private String ville;
    private TypeLogement typeLogement;
    private TypeTransaction typeTransaction;
    private Long proprietaireId;
    private List<MediaDTO> medias;
    private Double latitude;
    private Double longitude;
}