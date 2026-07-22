package com.immobilier.logement.dto;

import com.immobilier.logement.enums.TypeVedette;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VedetteRequestDTO {

    @NotNull(message = "L'identifiant du logement est obligatoire")
    private Long logementId;

    @NotNull(message = "Le type de vedette est obligatoire")
    private TypeVedette typeVedette;

    private String paymentRef;
    private Double montantPaye;
}
