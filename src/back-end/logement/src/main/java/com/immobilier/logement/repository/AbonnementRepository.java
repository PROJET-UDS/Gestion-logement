package com.immobilier.logement.repository;

import com.immobilier.logement.entity.Abonnement;
import com.immobilier.logement.enums.StatutAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {

    Optional<Abonnement> findTopByProprietaireIdAndStatutOrderByDateFinDesc(
            String proprietaireId, StatutAbonnement statut);

    List<Abonnement> findByProprietaireIdOrderByDateDebutDesc(String proprietaireId);

    boolean existsByProprietaireIdAndStatut(String proprietaireId, StatutAbonnement statut);

    long countByProprietaireIdAndStatut(String proprietaireId, StatutAbonnement statut);
}
