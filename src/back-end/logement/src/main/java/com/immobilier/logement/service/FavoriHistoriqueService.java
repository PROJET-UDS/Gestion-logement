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
@Transactional
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

    public String basculerFavori(String utilisateurId, Long logementId) {
        Logement logement = logementRepository.findById(logementId)
                .orElseThrow(() -> new RuntimeException("Logement introuvable"));

        var favoriExistant = favoriRepository.findByUtilisateurIdAndLogementId(utilisateurId, logementId);

        if (favoriExistant.isPresent()) {
            favoriRepository.delete(favoriExistant.get());
            return "Logement retiré des favoris";
        } else {
            Favori nouveauFavori = Favori.builder()
                    .utilisateurId(utilisateurId)
                    .logement(logement)
                    .dateAjout(LocalDateTime.now())
                    .build();
            favoriRepository.save(nouveauFavori);
            return "Logement ajouté aux favoris";
        }
    }

    public List<Favori> obtenirFavorisUtilisateur(String utilisateurId) {
        return favoriRepository.findByUtilisateurIdOrderByDateAjoutDesc(utilisateurId);
    }

    public void enregistrerConsultation(String utilisateurId, Long logementId) {
        Logement logement = logementRepository.findById(logementId)
                .orElseThrow(() -> new RuntimeException("Logement introuvable"));

        HistoriqueConsultation historique = HistoriqueConsultation.builder()
                .utilisateurId(utilisateurId)
                .logement(logement)
                .dateConsultation(LocalDateTime.now())
                .build();

        historiqueRepository.save(historique);
    }

    public List<HistoriqueConsultation> obtenirHistoriqueUtilisateur(String utilisateurId) {
        return historiqueRepository.trouverDernieresConsultations(utilisateurId);
    }
}
