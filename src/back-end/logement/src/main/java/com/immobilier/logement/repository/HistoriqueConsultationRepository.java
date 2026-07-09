package com.immobilier.logement.repository;

import com.immobilier.logement.entity.HistoriqueConsultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // Assure-toi que cet import est correct suite aux étapes précédentes
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistoriqueConsultationRepository extends JpaRepository<HistoriqueConsultation, Long> {

    // Correction ici : Ajout du "u" à trouverDernieresConsultations
    @Query("SELECT h FROM HistoriqueConsultation h WHERE h.utilisateurId = :userId ORDER BY h.dateConsultation DESC")
    List<HistoriqueConsultation> trouverDernieresConsultations(@Param("userId") Long utilisateurId);
}