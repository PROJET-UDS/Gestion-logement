package com.immobilier.logement.entity;

import com.immobilier.logement.enums.StatutVedette;
import com.immobilier.logement.enums.TypeVedette;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_logements_en_vedette")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LogementEnVedette {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "logement_id", nullable = false)
    private Long logementId;

    @Column(name = "proprietaire_id", nullable = false)
    private String proprietaireId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_vedette", nullable = false)
    private TypeVedette typeVedette;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutVedette statut = StatutVedette.ACTIF;

    @Column(name = "montant_paye")
    private Double montantPaye;

    @Column(name = "payment_ref")
    private String paymentRef;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
