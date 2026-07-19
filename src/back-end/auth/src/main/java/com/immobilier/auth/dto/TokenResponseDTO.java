package com.immobilier.auth.dto;

import lombok.*;

@Data @Builder
public class TokenResponseDTO {
    private String userId;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private String role;
}
