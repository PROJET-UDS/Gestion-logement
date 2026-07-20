package com.immobilier.logement.controller;

import com.immobilier.logement.dto.AvisRequestDTO;
import com.immobilier.logement.dto.AvisResponseDTO;
import com.immobilier.logement.security.AuthenticatedUser;
import com.immobilier.logement.service.AvisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/avis")
@RequiredArgsConstructor
public class AvisController {

    private final AvisService avisService;

    @PostMapping
    public ResponseEntity<AvisResponseDTO> creerAvis(
            @Valid @RequestBody AvisRequestDTO requestDTO,
            @AuthenticationPrincipal AuthenticatedUser user) {
        AvisResponseDTO response = avisService.creerAvis(requestDTO, user.userId(), user.email());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/logement/{logementId}")
    public ResponseEntity<Page<AvisResponseDTO>> obtenirAvisParLogement(
            @PathVariable Long logementId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        return ResponseEntity.ok(avisService.obtenirAvisParLogement(logementId, page, taille));
    }

    @GetMapping("/logement/{logementId}/moyenne")
    public ResponseEntity<Double> obtenirNoteMoyenne(@PathVariable Long logementId) {
        return ResponseEntity.ok(avisService.obtenirNoteMoyenne(logementId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerAvis(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        avisService.supprimerAvis(id, user.userId(), user.role());
        return ResponseEntity.noContent().build();
    }
}
