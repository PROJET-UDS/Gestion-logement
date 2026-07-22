package com.immobilier.logement.controller;

import com.immobilier.logement.dto.AbonnementRequestDTO;
import com.immobilier.logement.dto.AbonnementResponseDTO;
import com.immobilier.logement.dto.VedetteRequestDTO;
import com.immobilier.logement.dto.VedetteResponseDTO;
import com.immobilier.logement.enums.TypeAbonnement;
import com.immobilier.logement.security.AuthenticatedUser;
import com.immobilier.logement.service.AbonnementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/abonnements")
@RequiredArgsConstructor
public class AbonnementController {

    private final AbonnementService abonnementService;

    @GetMapping("/moi")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<AbonnementResponseDTO> monAbonnement(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(abonnementService.getAbonnementActif(user.userId()));
    }

    @PostMapping("/souscrire")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<AbonnementResponseDTO> souscrire(
            @Valid @RequestBody AbonnementRequestDTO request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        AbonnementResponseDTO response = abonnementService.souscrire(
                user.userId(), request.getTypeAbonnement(),
                request.getPaymentRef(), request.getMontantPaye());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/peut-publier")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> peutPublier(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("peutPublier", abonnementService.peutPublier(user.userId())));
    }

    @PostMapping("/vedette")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<VedetteResponseDTO> passerEnVedette(
            @Valid @RequestBody VedetteRequestDTO request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        VedetteResponseDTO response = abonnementService.passerEnVedette(user.userId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/vedette/{logementId}")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> retirerDeVedette(
            @PathVariable Long logementId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        abonnementService.retirerDeVedette(user.userId(), logementId);
        return ResponseEntity.ok(Map.of("message", "Logement retire de la vedette"));
    }

    @GetMapping("/vedette/mes-vedettes")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<List<VedetteResponseDTO>> mesVedettes(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(abonnementService.mesLogementsEnVedette(user.userId()));
    }

    @GetMapping("/vedette/compter")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> compterVedettes(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("count", abonnementService.compterLogementsEnVedetteCeMois(user.userId())));
    }
}
