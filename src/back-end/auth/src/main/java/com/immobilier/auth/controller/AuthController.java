package com.immobilier.auth.controller;

import com.immobilier.auth.dto.*;
import com.immobilier.auth.security.JwtService;
import com.immobilier.auth.service.AuthService;
import com.immobilier.auth.service.PasswordResetService;
import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.enums.UserRole;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:3000,http://localhost:3001}")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final JwtService jwtService;

    @Value("${internal-api-key:}")
    private String internalApiKey;

    @PostMapping("/register")
    public ResponseEntity<TokenResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        log.info("Enregistrement d'un nouvel utilisateur : {}", request.getEmail());
        TokenResponseDTO response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/admin/register")
    public ResponseEntity<TokenResponseDTO> registerByAdmin(
            @RequestHeader(value = "X-Internal-Key", required = false) String internalKey,
            @Valid @RequestBody AdminRegisterRequestDTO request) {
        if (!isValidInternalKey(internalKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null);
        }
        log.info("Creation d'un utilisateur par admin : {}", request.getEmail());
        TokenResponseDTO response = authService.registerByAdmin(request);
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
        log.info("Rafraichissement du token");
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
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token manquant"));
        }
        String token = authHeader.substring(7);
        JwtClaims claims = jwtService.validateAndExtractAccessToken(token);
        authService.changePassword(claims.getUserId(), request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Mot de passe change avec succes"));
    }

    @PutMapping("/admin/users/{userId}/role")
    public ResponseEntity<Map<String, String>> syncUserRole(
            @RequestHeader(value = "X-Internal-Key", required = false) String internalKey,
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        if (!isValidInternalKey(internalKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String role = body.get("role");
        UserRole newRole = UserRole.valueOf(role);
        authService.changeUserRole(userId, newRole);
        return ResponseEntity.ok(Map.of("message", "Role synchronise"));
    }

    @PatchMapping("/admin/users/{userId}/ban")
    public ResponseEntity<Map<String, String>> syncUserBan(
            @RequestHeader(value = "X-Internal-Key", required = false) String internalKey,
            @PathVariable String userId,
            @RequestBody Map<String, Boolean> body) {
        if (!isValidInternalKey(internalKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        boolean actif = body.getOrDefault("actif", true);
        authService.toggleBanUser(userId, actif);
        return ResponseEntity.ok(Map.of("message", "Statut synchronise"));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }

    private boolean isValidInternalKey(String providedKey) {
        if (internalApiKey == null || internalApiKey.isBlank()) {
            return true;
        }
        return internalApiKey.equals(providedKey);
    }
}