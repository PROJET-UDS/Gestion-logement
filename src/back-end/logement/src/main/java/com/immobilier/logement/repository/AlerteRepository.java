package com.immobilier.logement.repository;

import com.immobilier.logement.entity.Alerte;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AlerteRepository extends JpaRepository<Alerte, Long> {

    @Query("SELECT a FROM Alerte a WHERE a.active = true " +
            "AND LOWER(a.ville) = LOWER(:ville) " +
            "AND (:prix IS NULL OR a.prixMax >= :prix) " +
            "AND (:typeLogement IS NULL OR a.typeLogement = :typeLogement) " +
            "AND (:typeTransaction IS NULL OR a.typeTransaction = :typeTransaction)")
    List<Alerte> trouverAlertesCorrespondantes(
            @Param("ville") String ville,
            @Param("prix") BigDecimal prix,
            @Param("typeLogement") TypeLogement typeLogement,
            @Param("typeTransaction") TypeTransaction typeTransaction
    );
}