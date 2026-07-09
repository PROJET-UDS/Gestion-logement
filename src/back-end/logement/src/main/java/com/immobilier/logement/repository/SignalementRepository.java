package com.immobilier.logement.repository;

import com.immobilier.logement.entity.Signalement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    // Compter combien de fois un logement a été signalé
    long countByLogementId(Long logementId);

    // Récupérer les signalements d'un logement avec pagination pour les admins
    Page<Signalement> findByLogementId(Long logementId, Pageable pageable);
}