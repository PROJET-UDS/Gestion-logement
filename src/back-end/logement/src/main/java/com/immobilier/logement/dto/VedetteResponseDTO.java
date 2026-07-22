package com.immobilier.logement.dto;

import com.immobilier.logement.enums.StatutVedette;
import com.immobilier.logement.enums.TypeVedette;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VedetteResponseDTO {
    private Long id;
    private Long logementId;
    private String titreLogement;
    private String proprietaireId;
    private TypeVedette typeVedette;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private StatutVedette statut;
    private Double montantPaye;
}
