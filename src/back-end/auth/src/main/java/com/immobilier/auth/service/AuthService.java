package com.immobilier.auth.service;

import com.immobilier.auth.dto.*;
import com.immobilier.shared.dto.JwtClaims;

public interface AuthService {
    TokenResponseDTO register(RegisterRequestDTO request);
    TokenResponseDTO login(LoginRequestDTO request);
    TokenResponseDTO refresh(RefreshRequestDTO request);
    JwtClaims        validate(ValidateTokenRequestDTO request);
}
