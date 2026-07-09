package com.immobilier.logement.controller;

import com.immobilier.logement.entity.Avis;
import com.immobilier.logement.entity.Signalement;
import com.immobilier.logement.enums.MotifSignalement;
import com.immobilier.logement.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    // 1. Ajouter un Avis
    @PostMapping("/logements/{id}/avis")
    public ResponseEntity<Avis> ajouterAvis(
            @PathVariable Long id,
            @RequestParam Long utilisateurId,
            @RequestParam String nomUtilisateur,
            @RequestParam Integer note,
            @RequestParam String commentaire) {

        Avis nouvelAvis = interactionService.ajouterAvis(id, utilisateurId, nomUtilisateur, note, commentaire);
        return new ResponseEntity<>(nouvelAvis, HttpStatus.CREATED);
    }

    // 2. Récupérer les Avis d'un logement (PAGINÉ)
    @GetMapping("/logements/{id}/avis")
    public ResponseEntity<Page<Avis>> obtenirAvisDuLogement(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Avis> listeAvis = interactionService.obtenirAvisParLogement(id, pageable);
        return ResponseEntity.ok(listeAvis);
    }

    // 3. Signaler un Logement
    @PostMapping("/logements/{id}/signaler")
    public ResponseEntity<Signalement> signalerLogement(
            @PathVariable Long id,
            @RequestParam Long utilisateurId,
            @RequestParam MotifSignalement motif,
            @RequestParam String description) {

        Signalement nouveauSignalement = interactionService.signalerLogement(id, utilisateurId, motif, description);
        return new ResponseEntity<>(nouveauSignalement, HttpStatus.CREATED);
    }
}