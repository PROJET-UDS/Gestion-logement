package com.immobilier.logement.entity;

import com.immobilier.logement.enums.MotifSignalement;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "signalements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logement_id", nullable = false)
    private Logement logement;

    private String utilisateurId;

    @Enumerated(EnumType.STRING)
    private MotifSignalement motif;

    private String description;
    private LocalDateTime dateSignalement;

    @PrePersist
    protected void onCreate() {
        this.dateSignalement = LocalDateTime.now();
    }
}