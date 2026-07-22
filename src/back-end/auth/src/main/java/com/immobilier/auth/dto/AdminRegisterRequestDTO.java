package com.immobilier.auth.dto;

import com.immobilier.shared.enums.UserRole;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdminRegisterRequestDTO {
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format email invalide")
    private String email;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 120, message = "Le nom doit contenir entre 2 et 120 caracteres")
    private String nom;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Minimum 8 caracteres")
    private String password;

    @NotNull(message = "Le role est obligatoire")
    private UserRole role;
}
