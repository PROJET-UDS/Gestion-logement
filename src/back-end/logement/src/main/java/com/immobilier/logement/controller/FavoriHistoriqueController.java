package com.immobilier.logement.controller;

import com.immobilier.logement.entity.Favori;
import com.immobilier.logement.entity.HistoriqueConsultation;
import com.immobilier.logement.security.AuthenticatedUser;
import com.immobilier.logement.service.FavoriHistoriqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/interactions")
public class FavoriHistoriqueController {

    private final FavoriHistoriqueService interactionService;

    public FavoriHistoriqueController(FavoriHistoriqueService interactionService) {
        this.interactionService = interactionService;
    }

    @PostMapping("/favoris")
    public ResponseEntity<String> basculerFavori(
            @RequestParam Long logementId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        String message = interactionService.basculerFavori(user.userId(), logementId);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/favoris/mes-favoris")
    public ResponseEntity<List<Favori>> getFavoris(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(interactionService.obtenirFavorisUtilisateur(user.userId()));
    }

    @GetMapping("/historique/mes-historiques")
    public ResponseEntity<List<HistoriqueConsultation>> getHistorique(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(interactionService.obtenirHistoriqueUtilisateur(user.userId()));
    }
}
