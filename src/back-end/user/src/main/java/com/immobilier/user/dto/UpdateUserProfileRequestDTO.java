package com.immobilier.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserProfileRequestDTO {

    @Size(max = 120, message = "Le nom complet ne doit pas depasser 120 caracteres")
    private String nomComplet;

    @Size(max = 30, message = "Le telephone ne doit pas depasser 30 caracteres")
    private String telephone;
}
