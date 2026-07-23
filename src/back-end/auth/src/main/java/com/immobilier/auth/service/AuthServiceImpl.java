package com.immobilier.auth.service;

import com.immobilier.auth.dto.*;
import com.immobilier.auth.entity.AuthUser;
import com.immobilier.auth.exception.*;
import com.immobilier.auth.rabbitmq.AuthEventPublisher;
import com.immobilier.auth.repository.AuthUserRepository;
import com.immobilier.auth.security.JwtService;
import com.immobilier.shared.enums.UserRole;
import com.immobilier.shared.dto.JwtClaims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final JwtService          jwtService;
    private final PasswordEncoder     passwordEncoder;
    private final AuthEventPublisher  authEventPublisher;

    @org.springframework.beans.factory.annotation.Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpMs;

    @Override
    @Transactional
    public TokenResponseDTO register(RegisterRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (authUserRepository.existsByEmailIgnoreCase(email))
            throw new UserAlreadyExistsException(email);

        AuthUser user = AuthUser.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CLIENT)
                .actif(true)
                .build();

        authUserRepository.saveAndFlush(user);
        log.info("Nouvel utilisateur enregistre : {}", user.getEmail());

        authEventPublisher.publishUserRegistered(
                user.getId(),
                user.getEmail(),
                request.getNom().trim(),
                user.getRole().name()
        );

        return buildTokenResponse(user);
    }

    @Override
    @Transactional
    public TokenResponseDTO login(LoginRequestDTO request) {
        AuthUser user = authUserRepository.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
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

        JwtClaims tokenClaims = jwtService.validateAndExtractAccessToken(request.getToken());
        AuthUser user = authUserRepository.findById(tokenClaims.getUserId())
                .orElseThrow(() -> new AuthException("Utilisateur introuvable"));

        if (!user.isActif())
            throw new AuthException("Compte suspendu");

        return JwtClaims.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
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
        user.setMustChangePassword(false);
        authUserRepository.save(user);
        log.info("Mot de passe change pour l'utilisateur : {}", user.getEmail());
    }

    @Override
    @Transactional
    public void changeUserRole(String requesterId, String userId, UserRole newRole) {
        AuthUser requester = authUserRepository.findById(requesterId)
                .orElseThrow(() -> new AuthException("Administrateur introuvable"));

        if (requester.getRole() != UserRole.ADMIN || !requester.isActif()) {
            throw new AccessDeniedException("Seul un administrateur peut modifier un role");
        }
        if (requesterId.equals(userId)) {
            throw new AccessDeniedException("Vous ne pouvez pas modifier votre propre role");
        }
        if (newRole == null || newRole == UserRole.VISITEUR) {
            throw new IllegalArgumentException("Le role VISITEUR ne peut pas etre attribue a un compte");
        }

        AuthUser user = authUserRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Utilisateur introuvable"));

        UserRole oldRole = user.getRole();
        if (oldRole == newRole) {
            return;
        }

        user.setRole(newRole);
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        authUserRepository.save(user);

        authEventPublisher.publishRoleChanged(userId, oldRole.name(), newRole.name());
        log.info("Role modifie par admin={} pour userId={} : {} -> {}", requesterId, userId, oldRole, newRole);
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

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
