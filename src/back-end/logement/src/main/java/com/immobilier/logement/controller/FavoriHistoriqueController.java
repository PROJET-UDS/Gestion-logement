package com.immobilier.logement.controller;

import com.immobilier.logement.entity.Favori;
import com.immobilier.logement.entity.HistoriqueConsultation;
import com.immobilier.logement.service.FavoriHistoriqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/interactions")
public class FavoriHistoriqueController {

    private final FavoriHistoriqueService interactionService;

    public FavoriHistoriqueController(FavoriHistoriqueService interactionService) {
        this.interactionService = interactionService;
    }

    // Ajouter ou supprimer un favori en un clic (Bouton Like/Dislike)
    // POST http://localhost:8083/api/v1/interactions/favoris?userId=1&logementId=5
    @PostMapping("/favoris")
    public ResponseEntity<String> basculerFavori(
            @RequestParam Long userId,
            @RequestParam Long logementId) {
        String message = interactionService.basculerFavori(userId, logementId);
        return ResponseEntity.ok(message);
    }

    // Récupérer tous les favoris d'un utilisateur
    // GET http://localhost:8083/api/v1/interactions/favoris/1
    @GetMapping("/favoris/{userId}")
    public ResponseEntity<List<Favori>> getFavoris(@PathVariable Long userId) {
        return ResponseEntity.ok(interactionService.obtenirFavorisUtilisateur(userId));
    }

    // Récupérer l'historique de recherche/consultation d'un utilisateur
    // GET http://localhost:8083/api/v1/interactions/historique/1
    @GetMapping("/historique/{userId}")
    public ResponseEntity<List<HistoriqueConsultation>> getHistorique(@PathVariable Long userId) {
        return ResponseEntity.ok(interactionService.obtenirHistoriqueUtilisateur(userId));
    }
}