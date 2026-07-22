package com.immobilier.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserProfileResponseDTO {
    private String id;
    private String email;
    private String nomComplet;
    private String telephone;
    private String photoUrl;
    private String role;
    private boolean actif;
    private Instant createdAt;
    private Instant updatedAt;
}
