package com.immobilier.auth.dto;

import com.immobilier.shared.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeUserRoleRequestDTO {

    @NotNull(message = "Le role est obligatoire")
    private UserRole role;
}
