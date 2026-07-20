package com.immobilier.logement.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvisRequestDTO {

    @NotNull(message = "L'identifiant du logement est obligatoire")
    private Long logementId;

    @NotNull(message = "La note est obligatoire")
    @Min(value = 1, message = "La note minimale est 1")
    @Max(value = 5, message = "La note maximale est 5")
    private Integer note;

    @NotBlank(message = "Le commentaire est obligatoire")
    @Size(max = 1000, message = "Le commentaire ne peut pas dépasser 1000 caractères")
    private String commentaire;
}
