package com.immobilier.logement.service;

import com.immobilier.logement.dto.AvisRequestDTO;
import com.immobilier.logement.dto.AvisResponseDTO;
import org.springframework.data.domain.Page;

public interface AvisService {

    AvisResponseDTO creerAvis(AvisRequestDTO dto, String utilisateurId, String nomUtilisateur);

    Page<AvisResponseDTO> obtenirAvisParLogement(Long logementId, int page, int taille);

    Double obtenirNoteMoyenne(Long logementId);

    void supprimerAvis(Long id, String utilisateurId, String userRole);
}
