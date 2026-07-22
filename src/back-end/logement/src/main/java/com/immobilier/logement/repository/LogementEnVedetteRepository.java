package com.immobilier.logement.repository;

import com.immobilier.logement.entity.LogementEnVedette;
import com.immobilier.logement.enums.StatutVedette;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LogementEnVedetteRepository extends JpaRepository<LogementEnVedette, Long> {

    List<LogementEnVedette> findByProprietaireIdAndStatutOrderByDateFinDesc(
            String proprietaireId, StatutVedette statut);

    Optional<LogementEnVedette> findByLogementIdAndStatut(Long logementId, StatutVedette statut);

    long countByProprietaireIdAndStatutAndDateDebutBetween(
            String proprietaireId, StatutVedette statut, LocalDateTime debut, LocalDateTime fin);

    List<LogementEnVedette> findByStatutAndDateDebutLessThanEqualAndDateFinGreaterThanEqual(
            StatutVedette statut, LocalDateTime maintenant1, LocalDateTime maintenant2);

    @Query("SELECT v.logementId FROM LogementEnVedette v WHERE v.statut = :statut AND v.dateDebut <= :now AND v.dateFin >= :now")
    List<Long> findLogementIdsEnVedetteActifs(@Param("statut") StatutVedette statut, @Param("now") LocalDateTime now);
}
