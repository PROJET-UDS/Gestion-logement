package com.immobilier.logement.service;

import com.immobilier.logement.entity.Favori;
import com.immobilier.logement.entity.HistoriqueConsultation;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.repository.FavoriRepository;
import com.immobilier.logement.repository.HistoriqueConsultationRepository;
import com.immobilier.logement.repository.LogementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional // Sécurise les transactions d'écriture et de suppression en base de données
public class FavoriHistoriqueService {

    private final FavoriRepository favoriRepository;
    private final HistoriqueConsultationRepository historiqueRepository;
    private final LogementRepository logementRepository;

    public FavoriHistoriqueService(FavoriRepository favoriRepository,
                                   HistoriqueConsultationRepository historiqueRepository,
                                   LogementRepository logementRepository) {
        this.favoriRepository = favoriRepository;
        this.historiqueRepository = historiqueRepository;
        this.logementRepository = logementRepository;
    }

    // --- GESTION DES FAVORIS ---

    public String basculerFavori(Long utilisateurId, Long logementId) {
        Logement logement = logementRepository.findById(logementId)
                .orElseThrow(() -> new RuntimeException("Logement introuvable"));

        // On regarde si le logement est déjà dans les favoris
        var favoriExistant = favoriRepository.findByUtilisateurIdAndLogementId(utilisateurId, logementId);

        if (favoriExistant.isPresent()) {
            // S'il existe, on le retire (Action de "Retirer des favoris")
            favoriRepository.delete(favoriExistant.get());
            return "Logement retiré des favoris";
        } else {
            // S'il n'existe pas, on l'ajoute (Action de "Mettre en favori")
            Favori nouveauFavori = Favori.builder()
                    .utilisateurId(utilisateurId)
                    .logement(logement)
                    .dateAjout(LocalDateTime.now())
                    .build();
            favoriRepository.save(nouveauFavori);
            return "Logement ajouté aux favoris";
        }
    }

    public List<Favori> obtenirFavorisUtilisateur(Long utilisateurId) {
        return favoriRepository.findByUtilisateurIdOrderByDateAjoutDesc(utilisateurId);
    }

    // --- GESTION DE L'HISTORIQUE ---

    public void enregistrerConsultation(Long utilisateurId, Long logementId) {
        Logement logement = logementRepository.findById(logementId)
                .orElseThrow(() -> new RuntimeException("Logement introuvable"));

        // On enregistre simplement la visite
        HistoriqueConsultation historique = HistoriqueConsultation.builder()
                .utilisateurId(utilisateurId)
                .logement(logement)
                .dateConsultation(LocalDateTime.now())
                .build();

        historiqueRepository.save(historique);
    }

    public List<HistoriqueConsultation> obtenirHistoriqueUtilisateur(Long utilisateurId) {
        // Retourne les consultations de l'utilisateur
        return historiqueRepository.trouverDernieresConsultations(utilisateurId);
    }
}