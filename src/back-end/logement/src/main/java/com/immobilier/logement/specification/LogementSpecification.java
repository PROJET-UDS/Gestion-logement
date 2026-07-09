package com.immobilier.logement.specification;

import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class LogementSpecification {

    /**
     * Méthode statique qui construit la requête dynamique selon les critères fournis.
     * Si un paramètre est nul, il est tout simplement ignoré dans le WHERE de la requête SQL.
     */
    public static Specification<Logement> filterLogements(
            String ville,
            Double prixMax,
            TypeLogement typeLogement,
            TypeTransaction typeTransaction) {

        return (root, query, criteriaBuilder) -> {
            // Liste pour stocker toutes nos conditions SQL (les Predicates)
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filtre par Ville (recherche insensible à la casse et partielle ex: "dsch" trouvera "Dschang")
            if (ville != null && !ville.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("ville")),
                        "%" + ville.toLowerCase() + "%"
                ));
            }

            // 2. Filtre par Prix Maximum (Inférieur ou égal à...)
            if (prixMax != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("prix"), prixMax));
            }

            // 3. Filtre par Type de Logement (STUDIO, APPARTEMENT, etc.)
            if (typeLogement != null) {
                predicates.add(criteriaBuilder.equal(root.get("typeLogement"), typeLogement));
            }

            // 4. Filtre par Type de Transaction (LOCATION, VENTE)
            if (typeTransaction != null) {
                predicates.add(criteriaBuilder.equal(root.get("typeTransaction"), typeTransaction));
            }

            // On combine toutes nos conditions avec un "AND" logique (Condition1 AND Condition2 AND ...)
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}