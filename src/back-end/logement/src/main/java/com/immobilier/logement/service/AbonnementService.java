package com.immobilier.logement.service;

import com.immobilier.logement.dto.AbonnementResponseDTO;
import com.immobilier.logement.dto.VedetteResponseDTO;
import com.immobilier.logement.dto.VedetteRequestDTO;
import com.immobilier.logement.enums.TypeAbonnement;
import com.immobilier.logement.enums.TypeVedette;

public interface AbonnementService {

    AbonnementResponseDTO getAbonnementActif(String proprietaireId);

    AbonnementResponseDTO souscrire(String proprietaireId, TypeAbonnement type, String paymentRef, Double montant);

    boolean peutPublier(String proprietaireId);

    void incrementerPublications(String proprietaireId);

    VedetteResponseDTO passerEnVedette(String proprietaireId, VedetteRequestDTO request);

    void retirerDeVedette(String proprietaireId, Long logementId);

    java.util.List<VedetteResponseDTO> mesLogementsEnVedette(String proprietaireId);

    long compterLogementsEnVedetteCeMois(String proprietaireId);
}
