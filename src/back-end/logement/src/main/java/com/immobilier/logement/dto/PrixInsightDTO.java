package com.immobilier.logement.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrixInsightDTO {
    private String ville;
    private String typeLogement;
    private Long totalLogementsSimilaires; // Nombre de logements concurrents dans la zone
    private Double prixMoyen;              // Prix moyen dans cette ville pour ce type
    private Double prixMinimum;            // Le moins cher
    private Double prixMaximum;            // Le plus cher
    private String conseilPositionnement;  // Message d'aide personnalisé (ex: "Prix compétitif", "Trop cher")
}