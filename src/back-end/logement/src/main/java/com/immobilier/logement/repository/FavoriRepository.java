package com.immobilier.logement.repository;

import com.immobilier.logement.entity.Favori;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriRepository extends JpaRepository<Favori, Long> {

    // Récupère la liste des favoris d'un utilisateur triés par date décroissante
    List<Favori> findByUtilisateurIdOrderByDateAjoutDesc(Long utilisateurId);

    // Permet de vérifier si un favori existe déjà pour le supprimer (Unfavori)
    Optional<Favori> findByUtilisateurIdAndLogementId(Long utilisateurId, Long logementId);
}