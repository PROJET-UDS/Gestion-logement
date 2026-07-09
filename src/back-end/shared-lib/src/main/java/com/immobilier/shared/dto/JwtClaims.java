package com.immobilier.shared.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JwtClaims {
    private String userId;
    private String email;
    private String role;
}
