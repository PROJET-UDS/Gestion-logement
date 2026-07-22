package com.immobilier.user.dto;

import com.immobilier.shared.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequestDTO {
    @NotNull(message = "Le role est obligatoire")
    private UserRole role;
}
