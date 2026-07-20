package com.immobilier.auth.service;

import com.immobilier.auth.dto.*;
import com.immobilier.auth.entity.AuthUser;
import com.immobilier.auth.exception.*;
import com.immobilier.auth.repository.AuthUserRepository;
import com.immobilier.auth.security.JwtService;
import com.immobilier.shared.enums.UserRole;
import com.immobilier.shared.events.UserRegisteredEvent;
import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.auth.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final JwtService          jwtService;
    private final PasswordEncoder     passwordEncoder;
    private final RabbitTemplate      rabbitTemplate;

    @org.springframework.beans.factory.annotation.Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpMs;

    @Override
    @Transactional
    public TokenResponseDTO register(RegisterRequestDTO request) {
        if (authUserRepository.existsByEmail(request.getEmail()))
            throw new UserAlreadyExistsException(request.getEmail());

        UserRole role = resolveRegisterRole(request.getRole());

        AuthUser user = AuthUser.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .actif(true)
                .build();

        authUserRepository.save(user);
        log.info("Nouvel utilisateur enregistre : {}", user.getEmail());

        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nom(request.getNom())
                .role(user.getRole().name())
                .occurredAt(Instant.now())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.AUTH_EXCHANGE,
                RabbitMQConfig.USER_REGISTERED_KEY,
                event
        );

        return buildTokenResponse(user);
    }

    @Override
    @Transactional
    public TokenResponseDTO login(LoginRequestDTO request) {
        AuthUser user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Identifiants invalides"));

        if (!user.isActif())
            throw new AuthException("Compte suspendu");

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
            throw new AuthException("Identifiants invalides");

        log.info("Connexion reussie pour : {}", user.getEmail());
        return buildTokenResponse(user);
    }

    @Override
    @Transactional
    public TokenResponseDTO refresh(RefreshRequestDTO request) {
        if (!jwtService.isRefreshTokenValid(request.getRefreshToken()))
            throw new AuthException("Refresh token invalide ou expire");

        JwtClaims claims = jwtService.validateAndExtractRefreshToken(request.getRefreshToken());
        AuthUser user = authUserRepository.findById(claims.getUserId())
                .orElseThrow(() -> new AuthException("Utilisateur introuvable"));

        if (user.getRefreshToken() == null || user.getRefreshTokenExpiry() == null) {
            throw new AuthException("Aucun refresh token actif. Veuillez vous reconnecter.");
        }

        if (Instant.now().isAfter(user.getRefreshTokenExpiry())) {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            authUserRepository.save(user);
            throw new AuthException("Refresh token expire. Veuillez vous reconnecter.");
        }

        if (!user.getRefreshToken().equals(request.getRefreshToken())) {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            authUserRepository.save(user);
            log.warn("Refresh token reuse detecte pour userId={}, token possible volé", user.getId());
            throw new AuthException("Refresh token invalide. Veuillez vous reconnecter.");
        }

        return buildTokenResponse(user);
    }

    @Override
    public JwtClaims validate(ValidateTokenRequestDTO request) {
        if (!jwtService.isAccessTokenValid(request.getToken()))
            throw new AuthException("Token invalide ou expire");
        return jwtService.validateAndExtractAccessToken(request.getToken());
    }

    @Override
    @Transactional
    public void logout(RefreshRequestDTO request) {
        if (request.getRefreshToken() == null) return;

        try {
            JwtClaims claims = jwtService.validateAndExtractRefreshToken(request.getRefreshToken());
            authUserRepository.findById(claims.getUserId()).ifPresent(user -> {
                user.setRefreshToken(null);
                user.setRefreshTokenExpiry(null);
                authUserRepository.save(user);
                log.info("Utilisateur deconnecte : {}", user.getEmail());
            });
        } catch (Exception e) {
            log.warn("Erreur lors de la deconnexion : {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void changePassword(String userId, String oldPassword, String newPassword) {
        AuthUser user = authUserRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new AuthException("Ancien mot de passe incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        authUserRepository.save(user);
        log.info("Mot de passe change pour l'utilisateur : {}", user.getEmail());
    }

    private UserRole resolveRegisterRole(UserRole requestedRole) {
        if (requestedRole == null)
            return UserRole.CLIENT;
        if (requestedRole == UserRole.CLIENT || requestedRole == UserRole.PROPRIETAIRE)
            return requestedRole;
        throw new AuthException("Role non autorise pour l'inscription");
    }

    @Transactional
    private TokenResponseDTO buildTokenResponse(AuthUser user) {
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        Instant expiry = Instant.now().plusMillis(refreshExpMs);

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(expiry);
        authUserRepository.save(user);

        return TokenResponseDTO.builder()
                .userId(user.getId())
                .accessToken(jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name()))
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900)
                .role(user.getRole().name())
                .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
                .build();
    }
}
