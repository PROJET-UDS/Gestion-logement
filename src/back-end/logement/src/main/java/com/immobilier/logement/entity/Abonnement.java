package com.immobilier.logement.entity;

import com.immobilier.logement.enums.StatutAbonnement;
import com.immobilier.logement.enums.TypeAbonnement;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_abonnements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Abonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "proprietaire_id", nullable = false)
    private String proprietaireId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_abonnement", nullable = false)
    private TypeAbonnement typeAbonnement;

    @Column(name = "publications_incluses", nullable = false)
    private Integer publicationsIncluses;

    @Column(name = "publications_utilisees", nullable = false)
    @Builder.Default
    private Integer publicationsUtilisees = 0;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutAbonnement statut = StatutAbonnement.ACTIF;

    @Column(name = "montant_paye")
    private Double montantPaye;

    @Column(name = "payment_ref")
    private String paymentRef;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
