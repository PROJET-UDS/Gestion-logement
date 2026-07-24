package com.immobilier.logement.service;

import com.immobilier.logement.dto.LogementRequestDTO;
import com.immobilier.logement.dto.LogementResponseDTO;
import com.immobilier.logement.dto.PrixInsightDTO;
import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;

import java.util.List;

public interface LogementService {

    LogementResponseDTO creerLogement(LogementRequestDTO requestDTO);

    // Version classique (sans utilisateur connecté, n'enregistre rien dans l'historique)
    LogementResponseDTO obtenirLogementParId(Long id);

    // Version surchargée (avec utilisateur connecté, enregistre dans l'historique)
    LogementResponseDTO obtenirLogementParId(Long id, String utilisateurIdConnecte);

    List<LogementResponseDTO> obtenirTousLesLogementsValides();

    LogementResponseDTO changerStatutAnnonce(Long id, StatutAnnonce statut);

    List<LogementResponseDTO> rechercherLogements(String ville, Double prixMax, TypeLogement typeLogement, TypeTransaction typeTransaction);

    List<LogementResponseDTO> obtenirLogementsProches(Double lat, Double lon, Double rayon);

    PrixInsightDTO obtenirInsightsPrix(String ville, TypeLogement typeLogement, Double prixPropose);

    List<LogementResponseDTO> obtenirLogementsParProprietaire(String proprietaireId);

    LogementResponseDTO soumettreAValidation(Long id, String proprietaireId);

    LogementResponseDTO validerLogement(Long id, String adminId);

    LogementResponseDTO rejeterLogement(Long id, String adminId, String motif);

    LogementResponseDTO archiverLogement(Long id, String proprietaireId);

    List<LogementResponseDTO> obtenirLogementsEnAttenteValidation();

    List<LogementResponseDTO> obtenirLogementsPublies();

    LogementResponseDTO modifierLogement(Long id, LogementRequestDTO requestDTO, String proprietaireId);

    void supprimerLogement(Long id, String proprietaireId);
}