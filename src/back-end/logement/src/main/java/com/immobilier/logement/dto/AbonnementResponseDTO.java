package com.immobilier.logement.dto;

import com.immobilier.logement.enums.StatutAbonnement;
import com.immobilier.logement.enums.TypeAbonnement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AbonnementResponseDTO {
    private Long id;
    private String proprietaireId;
    private TypeAbonnement typeAbonnement;
    private Integer publicationsIncluses;
    private Integer publicationsUtilisees;
    private Integer publicationsRestantes;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private StatutAbonnement statut;
    private Double montantPaye;
    private Boolean peutPublier;
}
