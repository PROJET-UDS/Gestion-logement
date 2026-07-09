package com.immobilier.logement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_favoris", uniqueConstraints = {
        // Cette contrainte empêche un utilisateur d'ajouter deux fois le même logement en favori
        @UniqueConstraint(columnNames = {"utilisateurId", "logement_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favori {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID de l'utilisateur (provenant du microservice utilisateur / Token JWT)
    @Column(nullable = false)
    private Long utilisateurId;

    // Liaison avec le logement mis en favori
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logement_id", nullable = false)
    private Logement logement;

    @Column(nullable = false)
    private LocalDateTime dateAjout = LocalDateTime.now();
}