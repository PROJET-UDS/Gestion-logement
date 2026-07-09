package com.immobilier.logement.entity;

import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "t_alertes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alerte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // L'identifiant de l'utilisateur qui attend un logement
    @Column(nullable = false)
    private Long utilisateurId;

    @Column(nullable = false)
    private String ville;

    private BigDecimal prixMax;

    @Enumerated(EnumType.STRING)
    private TypeLogement typeLogement;

    @Enumerated(EnumType.STRING)
    private TypeTransaction typeTransaction;

    // Pour savoir si l'alerte est toujours active
    @Column(nullable = false)
    private boolean active = true;
}