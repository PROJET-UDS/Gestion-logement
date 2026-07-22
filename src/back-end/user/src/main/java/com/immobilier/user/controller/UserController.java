package com.immobilier.user.controller;

import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.shared.enums.UserRole;
import com.immobilier.user.dto.ChangeRoleRequestDTO;
import com.immobilier.user.dto.CreateUserRequestDTO;
import com.immobilier.user.dto.UpdateUserProfileRequestDTO;
import com.immobilier.user.dto.UserProfileResponseDTO;
import com.immobilier.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:3000,http://localhost:3001}")
public class UserController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> me(Authentication authentication) {
        JwtClaims claims = claims(authentication);
        log.info("Consultation du profil courant : {}", claims.getUserId());
        return ResponseEntity.ok(userProfileService.getCurrentUser(claims));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequestDTO request
    ) {
        JwtClaims claims = claims(authentication);
        log.info("Mise a jour du profil courant : {}", claims.getUserId());
        return ResponseEntity.ok(userProfileService.updateCurrentUser(claims, request));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<UserProfileResponseDTO> updatePhoto(
            Authentication authentication,
            @RequestParam("photo") MultipartFile photo
    ) throws IOException {
        JwtClaims claims = claims(authentication);
        log.info("Mise a jour de la photo de profil : {}", claims.getUserId());

        if (photo.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String contentType = photo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().build();
        }

        if (photo.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(null);
        }

        String base64Photo = Base64.getEncoder().encodeToString(photo.getBytes());
        String dataUrl = "data:" + contentType + ";base64," + base64Photo;

        return ResponseEntity.ok(userProfileService.updatePhoto(claims, dataUrl));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponseDTO> getById(
            Authentication authentication,
            @PathVariable String userId
    ) {
        JwtClaims claims = claims(authentication);
        return ResponseEntity.ok(userProfileService.getUserById(claims.getUserId(), claims.getRole(), userId));
    }

    @GetMapping
    public ResponseEntity<List<UserProfileResponseDTO>> getAll(Authentication authentication) {
        JwtClaims claims = claims(authentication);
        return ResponseEntity.ok(userProfileService.getAllUsers(claims.getRole()));
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<UserProfileResponseDTO> changeRole(
            Authentication authentication,
            @PathVariable String userId,
            @Valid @RequestBody ChangeRoleRequestDTO request
    ) {
        JwtClaims claims = claims(authentication);
        log.info("Changement de role pour userId={} par admin={}", userId, claims.getUserId());
        return ResponseEntity.ok(userProfileService.changeUserRole(claims.getRole(), claims.getUserId(), userId, request.getRole()));
    }

    @PostMapping
    public ResponseEntity<UserProfileResponseDTO> createUser(
            Authentication authentication,
            @Valid @RequestBody CreateUserRequestDTO request
    ) {
        JwtClaims claims = claims(authentication);
        log.info("Creation d'un utilisateur par admin={}", claims.getUserId());
        return ResponseEntity.ok(userProfileService.createUserByAdmin(claims.getRole(), request));
    }

    @PatchMapping("/{userId}/ban")
    public ResponseEntity<UserProfileResponseDTO> toggleBan(
            Authentication authentication,
            @PathVariable String userId
    ) {
        JwtClaims claims = claims(authentication);
        log.info("Ban/Unban utilisateur userId={} par admin={}", userId, claims.getUserId());
        return ResponseEntity.ok(userProfileService.toggleBanUser(claims.getRole(), claims.getUserId(), userId));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("User service is running");
    }

    private JwtClaims claims(Authentication authentication) {
        return (JwtClaims) authentication.getPrincipal();
    }
}
