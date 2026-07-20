package com.immobilier.logement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvisResponseDTO {

    private Long id;
    private Long logementId;
    private String utilisateurId;
    private String nomUtilisateur;
    private Integer note;
    private String commentaire;
    private LocalDateTime dateCreation;
}
