package com.immobilier.logement.entity;

import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "t_logements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Logement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prix;

    @Column(nullable = false)
    private String adresse;

    @Column(nullable = false)
    private String ville;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_logement", nullable = false)
    private TypeLogement typeLogement;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_transaction", nullable = false)
    private TypeTransaction typeTransaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_annonce", nullable = false)
    private StatutAnnonce statutAnnonce;

    @Column(name = "proprietaire_id", nullable = false)
    private Long proprietaireId;

    @OneToMany(mappedBy = "logement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MediaLogement> medias = new ArrayList<>();

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(nullable = true)
    private Double latitude;

    @Column(nullable = true)
    private Double longitude;

    private Double noteMoyenne = 0.0;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        this.statutAnnonce = StatutAnnonce.EN_ATTENTE;
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}