package com.immobilier.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequestDTO {

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le code est obligatoire")
    @Size(min = 6, max = 6, message = "Le code doit contenir 6 chiffres")
    private String code;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @jakarta.validation.constraints.Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres")
    private String newPassword;
}
