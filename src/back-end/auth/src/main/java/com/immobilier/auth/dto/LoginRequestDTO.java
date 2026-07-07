package com.immobilier.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequestDTO {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
}
