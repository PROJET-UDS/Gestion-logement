package com.immobilier.logement.repository;

import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.enums.StatutAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LogementRepository extends JpaRepository<Logement, Long>, JpaSpecificationExecutor<Logement> {
    List<Logement> findByProprietaireId(Long proprietaireId);
    List<Logement> findByStatutAnnonce(StatutAnnonce statutAnnonce);

    /**
     * Requête native SQL utilisant la formule de Haversine.
     * Le nombre 6371 représente le rayon moyen de la Terre en kilomètres.
     * La requête calcule la distance et ne retourne que les logements dont la distance est <= au rayon demandé.
     */
    @Query(value = "SELECT * FROM t_logements l WHERE " +
            "(6371 * acos(cos(radians(:latUtilisateur)) * cos(radians(l.latitude)) * " +
            "cos(radians(l.longitude) - radians(:lonUtilisateur)) + " +
            "sin(radians(:latUtilisateur)) * sin(radians(l.latitude)))) <= :rayonMax",
            nativeQuery = true)
    List<Logement> trouverLogementsProches(
            @Param("latUtilisateur") Double latUtilisateur,
            @Param("lonUtilisateur") Double lonUtilisateur,
            @Param("rayonMax") Double rayonMax
    );

    @Query(value = "SELECT l.ville as ville, l.type_logement as typeLogement, " +
            "COUNT(*) as totalLogements, " +
            "AVG(l.prix) as prixMoyen, " +
            "MIN(l.prix) as prixMin, " +
            "MAX(l.prix) as prixMax " +
            "FROM t_logements l " +
            "WHERE LOWER(l.ville) = LOWER(:ville) AND l.type_logement = :typeLogement " +
            "GROUP BY l.ville, l.type_logement",
            nativeQuery = true)
    Optional<StatistiquesPrixProjection> obtenirStatistiquesZone(
            @Param("ville") String ville,
            @Param("typeLogement") String typeLogement
    );
}