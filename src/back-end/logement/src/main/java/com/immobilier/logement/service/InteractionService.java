package com.immobilier.logement.service;

import com.immobilier.logement.entity.Avis;
import com.immobilier.logement.entity.Signalement;
import com.immobilier.logement.enums.MotifSignalement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InteractionService {
    Avis ajouterAvis(Long logementId, String utilisateurId, String nomUtilisateur, Integer note, String commentaire);
    Page<Avis> obtenirAvisParLogement(Long logementId, Pageable pageable);
    Signalement signalerLogement(Long logementId, String utilisateurId, MotifSignalement motif, String description);
}
