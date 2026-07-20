package com.immobilier.logement.controller;

import com.immobilier.logement.dto.LogementRequestDTO;
import com.immobilier.logement.dto.LogementResponseDTO;
import com.immobilier.logement.dto.PrixInsightDTO;
import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import com.immobilier.logement.security.AuthenticatedUser;
import com.immobilier.logement.service.LogementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logements")
@RequiredArgsConstructor
public class LogementController {

    private final LogementService logementService;

    @PostMapping
    public ResponseEntity<LogementResponseDTO> publierLogement(
            @Valid @RequestBody LogementRequestDTO requestDTO,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user != null) {
            requestDTO.setProprietaireId(user.userId());
        }
        return new ResponseEntity<>(logementService.creerLogement(requestDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LogementResponseDTO> obtenirLogementParId(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        String userId = (user != null) ? user.userId() : null;
        return ResponseEntity.ok(logementService.obtenirLogementParId(id, userId));
    }

    @GetMapping
    public ResponseEntity<List<LogementResponseDTO>> obtenirTousLesLogementsValides() {
        return ResponseEntity.ok(logementService.obtenirTousLesLogementsValides());
    }

    @GetMapping("/mes-logements")
    public ResponseEntity<List<LogementResponseDTO>> mesLogements(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(logementService.obtenirLogementsParProprietaire(user.userId()));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<LogementResponseDTO> modererAnnonce(
            @PathVariable Long id,
            @RequestParam StatutAnnonce statut) {
        return ResponseEntity.ok(logementService.changerStatutAnnonce(id, statut));
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<LogementResponseDTO>> rechercher(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) Double prixMax,
            @RequestParam(required = false) TypeLogement typeLogement,
            @RequestParam(required = false) TypeTransaction typeTransaction) {
        return ResponseEntity.ok(logementService.rechercherLogements(ville, prixMax, typeLogement, typeTransaction));
    }

    @GetMapping("/autour-de-moi")
    public ResponseEntity<List<LogementResponseDTO>> rechercherAutourDeMoi(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false) Double rayon) {
        return ResponseEntity.ok(logementService.obtenirLogementsProches(latitude, longitude, rayon));
    }

    @GetMapping("/insights-prix")
    public ResponseEntity<PrixInsightDTO> getInsightsPrix(
            @RequestParam String ville,
            @RequestParam TypeLogement typeLogement,
            @RequestParam(required = false) Double prixPropose) {
        return ResponseEntity.ok(logementService.obtenirInsightsPrix(ville, typeLogement, prixPropose));
    }

    @PatchMapping("/{id}/soumettre")
    public ResponseEntity<LogementResponseDTO> soumettreAValidation(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(logementService.soumettreAValidation(id, user.userId()));
    }

    @PatchMapping("/{id}/valider")
    public ResponseEntity<LogementResponseDTO> validerLogement(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(logementService.validerLogement(id, user.userId()));
    }

    @PatchMapping("/{id}/rejeter")
    public ResponseEntity<LogementResponseDTO> rejeterLogement(
            @PathVariable Long id,
            @RequestParam String motif,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(logementService.rejeterLogement(id, user.userId(), motif));
    }

    @PatchMapping("/{id}/archiver")
    public ResponseEntity<LogementResponseDTO> archiverLogement(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(logementService.archiverLogement(id, user.userId()));
    }

    @GetMapping("/en-attente-validation")
    public ResponseEntity<List<LogementResponseDTO>> logementsEnAttenteValidation() {
        return ResponseEntity.ok(logementService.obtenirLogementsEnAttenteValidation());
    }

    @GetMapping("/publies")
    public ResponseEntity<List<LogementResponseDTO>> logementsPublies() {
        return ResponseEntity.ok(logementService.obtenirLogementsPublies());
    }
}
