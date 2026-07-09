package com.immobilier.logement.controller;

import com.immobilier.logement.dto.LogementRequestDTO;
import com.immobilier.logement.dto.LogementResponseDTO;
import com.immobilier.logement.dto.PrixInsightDTO;
import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import com.immobilier.logement.service.LogementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logements")
@RequiredArgsConstructor
public class LogementController {

    private final LogementService logementService;

    @PostMapping
    public ResponseEntity<LogementResponseDTO> publierLogement(@RequestBody LogementRequestDTO requestDTO) {
        return new ResponseEntity<>(logementService.creerLogement(requestDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LogementResponseDTO> obtenirLogementParId(@PathVariable Long id) {
        return ResponseEntity.ok(logementService.obtenirLogementParId(id));
    }

    @GetMapping
    public ResponseEntity<List<LogementResponseDTO>> obtenirTousLesLogementsValides() {
        return ResponseEntity.ok(logementService.obtenirTousLesLogementsValides());
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

        // On transmet les paramètres (tous optionnels grâce à required = false) au service
        List<LogementResponseDTO> resultats = logementService.rechercherLogements(ville, prixMax, typeLogement, typeTransaction);

        // On retourne la liste avec un statut 200 OK
        return ResponseEntity.ok(resultats);
    }
    @GetMapping("/autour-de-moi")
    public ResponseEntity<List<LogementResponseDTO>> rechercherAutourDeMoi(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false) Double rayon) { // Le rayon est optionnel (5km par défaut)

        // On passe les coordonnées reçues au service
        List<LogementResponseDTO> logements = logementService.obtenirLogementsProches(latitude, longitude, rayon);

        // Retourne la liste
        return ResponseEntity.ok(logements);
    }

    @GetMapping("/insights-prix")
    public ResponseEntity<PrixInsightDTO> getInsightsPrix(
            @RequestParam String ville,
            @RequestParam com.immobilier.logement.enums.TypeLogement typeLogement,
            @RequestParam(required = false) Double prixPropose) {

        // On récupère les analyses du marché
        PrixInsightDTO insights = logementService.obtenirInsightsPrix(ville, typeLogement, prixPropose);

        return ResponseEntity.ok(insights);
    }
}