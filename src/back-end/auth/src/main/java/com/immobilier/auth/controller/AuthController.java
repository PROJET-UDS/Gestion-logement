package com.immobilier.auth.controller;

import com.immobilier.auth.dto.*;
import com.immobilier.auth.service.AuthService;
import com.immobilier.shared.dto.JwtClaims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur d'authentification
 * Gère l'enregistrement, la connexion, le refresh token et la validation des tokens
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permet au Front-End (React/Angular) de contacter ce service sans blocage CORS
public class AuthController {

    private final AuthService authService;

    /**
     * Enregistrer un nouvel utilisateur
     */
    @PostMapping("/register")
    public ResponseEntity<TokenResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        log.info("Enregistrement d'un nouvel utilisateur : {}", request.getEmail());
        TokenResponseDTO response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Connexion d'un utilisateur
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        log.info("Connexion de l'utilisateur : {}", request.getEmail());
        TokenResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Rafraîchir le token d'accès
     */
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refresh(@Valid @RequestBody RefreshRequestDTO request) {
        log.info("Rafraîchissement du token");
        TokenResponseDTO response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Valider un token
     */
    @PostMapping("/validate")
    public ResponseEntity<JwtClaims> validate(@Valid @RequestBody ValidateTokenRequestDTO request) {
        log.info("Validation d'un token");
        JwtClaims claims = authService.validate(request);
        return ResponseEntity.ok(claims);
    }

    /**
     * Endpoint de santé pour les checks de service
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }
}