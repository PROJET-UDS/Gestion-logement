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

    @Override
    @Transactional
    public TokenResponseDTO register(RegisterRequestDTO request) {
        if (authUserRepository.existsByEmail(request.getEmail()))
            throw new UserAlreadyExistsException(request.getEmail());

        AuthUser user = AuthUser.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CLIENT)
                .actif(true)
                .build();

        authUserRepository.save(user);
        log.info("Nouvel utilisateur enregistré : {}", user.getEmail());

        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
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
    public TokenResponseDTO login(LoginRequestDTO request) {
        AuthUser user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Identifiants invalides"));

        if (!user.isActif())
            throw new AuthException("Compte suspendu");

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
            throw new AuthException("Identifiants invalides");

        log.info("Connexion rÃ©ussie pour : {}", user.getEmail());
        return buildTokenResponse(user);
    }

    @Override
    public TokenResponseDTO refresh(RefreshRequestDTO request) {
        if (!jwtService.isValid(request.getRefreshToken()))
            throw new AuthException("Refresh token invalide ou expirÃ©");

        JwtClaims claims = jwtService.validateAndExtract(request.getRefreshToken());
        AuthUser user = authUserRepository.findById(claims.getUserId())
                .orElseThrow(() -> new AuthException("Utilisateur introuvable"));

        return buildTokenResponse(user);
    }

    @Override
    public JwtClaims validate(ValidateTokenRequestDTO request) {
        if (!jwtService.isValid(request.getToken()))
            throw new AuthException("Token invalide ou expirÃ©");
        return jwtService.validateAndExtract(request.getToken());
    }

    private TokenResponseDTO buildTokenResponse(AuthUser user) {
        return TokenResponseDTO.builder()
                .accessToken(jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name()))
                .refreshToken(jwtService.generateRefreshToken(user.getId()))
                .tokenType("Bearer")
                .expiresIn(900)
                .role(user.getRole().name())
                .build();
    }
}
