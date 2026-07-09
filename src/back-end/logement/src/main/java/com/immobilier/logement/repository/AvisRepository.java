package com.immobilier.logement.repository;

import com.immobilier.logement.entity.Avis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {
    // Récupérer les avis d'un logement ordonnés du plus récent au plus ancien (paginé)
    Page<Avis> findByLogementIdOrderByDateCreationDesc(Long logementId, Pageable pageable);

    // Calculer la note moyenne d'un logement directement en base de données
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.logement.id = :logementId")
    Double findAverageNoteByLogementId(Long logementId);
}