package com.immobilier.logement.dto;

import com.immobilier.logement.enums.TypeAbonnement;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AbonnementRequestDTO {

    @NotNull(message = "Le type d'abonnement est obligatoire")
    private TypeAbonnement typeAbonnement;

    private String paymentRef;
    private Double montantPaye;
}
