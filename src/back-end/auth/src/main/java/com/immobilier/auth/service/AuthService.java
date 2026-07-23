package com.immobilier.auth.service;

import com.immobilier.auth.dto.*;
import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.enums.UserRole;

public interface AuthService {
    TokenResponseDTO register(RegisterRequestDTO request);
    TokenResponseDTO login(LoginRequestDTO request);
    TokenResponseDTO refresh(RefreshRequestDTO request);
    JwtClaims        validate(ValidateTokenRequestDTO request);
    void             logout(RefreshRequestDTO request);
    void             changePassword(String userId, String oldPassword, String newPassword);
    void             changeUserRole(String requesterId, String userId, UserRole newRole);
}
