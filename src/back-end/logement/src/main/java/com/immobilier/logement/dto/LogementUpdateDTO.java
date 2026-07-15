package com.immobilier.logement.dto;

import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LogementUpdateDTO {

    @NotBlank(message = "Le titre ne peut pas être vide")
    @Size(max = 150, message = "Le titre ne peut pas dépasser 150 caractères")
    private String titre;

    @NotBlank(message = "La description ne peut pas être vide")
    @Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
    private String description;

    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0", inclusive = false, message = "Le prix doit être supérieur à 0")
    private BigDecimal prix;

    @NotBlank(message = "L'adresse ne peut pas être vide")
    private String adresse;

    @NotBlank(message = "La ville ne peut pas être vide")
    private String ville;

    private String quartier;

    @NotNull(message = "Le type de logement est obligatoire")
    private TypeLogement typeLogement;

    @NotNull(message = "Le type de transaction est obligatoire")
    private TypeTransaction typeTransaction;

    @DecimalMin(value = "0", message = "Les charges ne peuvent pas être négatives")
    private BigDecimal charges;

    @Min(value = 1, message = "Le nombre de pièces doit être au moins 1")
    @Max(value = 50, message = "Le nombre de pièces ne peut pas dépasser 50")
    private Integer nbPieces;

    @Min(value = 1, message = "La superficie doit être d'au moins 1 m²")
    private Double superficie;

    private String equipements;

    private Double latitude;

    private Double longitude;
}
