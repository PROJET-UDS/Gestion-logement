package com.immobilier.auth.controller;

import com.immobilier.auth.dto.*;
import com.immobilier.auth.service.AuthService;
import com.immobilier.auth.service.PasswordResetService;
import com.immobilier.shared.dto.JwtClaims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<TokenResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        log.info("Enregistrement d'un nouvel utilisateur : {}", request.getEmail());
        TokenResponseDTO response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        log.info("Connexion de l'utilisateur : {}", request.getEmail());
        TokenResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refresh(@Valid @RequestBody RefreshRequestDTO request) {
        log.info("Rafraîchissement du token");
        TokenResponseDTO response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<JwtClaims> validate(@Valid @RequestBody ValidateTokenRequestDTO request) {
        log.info("Validation d'un token");
        JwtClaims claims = authService.validate(request);
        return ResponseEntity.ok(claims);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO request) {
        log.info("Demande de reinitialisation pour : {}", request.getEmail());
        passwordResetService.envoyerCode(request.getEmail());
        return ResponseEntity.ok(Map.of(
            "message", "Un code de recuperation a ete envoye a votre adresse email"
        ));
    }

    @PostMapping("/forgot-password/resend")
    public ResponseEntity<Map<String, String>> resendCode(
            @Valid @RequestBody ForgotPasswordRequestDTO request) {
        log.info("Renvoi du code de recuperation pour : {}", request.getEmail());
        passwordResetService.renvoyerCode(request.getEmail());
        return ResponseEntity.ok(Map.of(
            "message", "Un nouveau code a ete envoye a votre adresse email"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDTO request) {
        log.info("Reinitialisation du mot de passe pour : {}", request.getEmail());
        passwordResetService.reinitialiserMotDePasse(
            request.getEmail(), request.getCode(), request.getNewPassword()
        );
        return ResponseEntity.ok(Map.of(
            "message", "Votre mot de passe a ete reinitialise avec succes"
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody(required = false) RefreshRequestDTO request) {
        log.info("Deconnexion demandee");
        authService.logout(request != null ? request : new RefreshRequestDTO());
        return ResponseEntity.ok(Map.of("message", "Deconnexion reussie"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        JwtClaims claims = claims(authentication);
        authService.changePassword(claims.getUserId(), request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Mot de passe change avec succes"));
    }

    @PatchMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> changeUserRole(
            Authentication authentication,
            @PathVariable String userId,
            @Valid @RequestBody ChangeUserRoleRequestDTO request) {
        JwtClaims claims = claims(authentication);
        authService.changeUserRole(claims.getUserId(), userId, request.getRole());
        return ResponseEntity.ok(Map.of(
                "message", "Role utilisateur modifie avec succes",
                "role", request.getRole().name()
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }

    private JwtClaims claims(Authentication authentication) {
        return (JwtClaims) authentication.getPrincipal();
    }
}
