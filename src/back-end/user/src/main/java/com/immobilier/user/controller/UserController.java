package com.immobilier.user.controller;

import com.immobilier.shared.dto.JwtClaims;
import com.immobilier.user.dto.UpdateUserProfileRequestDTO;
import com.immobilier.user.dto.UserProfileResponseDTO;
import com.immobilier.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("User service is running");
    }

    private JwtClaims claims(Authentication authentication) {
        return (JwtClaims) authentication.getPrincipal();
    }
}
