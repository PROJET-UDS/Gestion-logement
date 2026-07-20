package com.immobilier.logement.entity;

import com.immobilier.logement.enums.StatutAnnonce;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "t_validation_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "logement_id", nullable = false)
    private Long logementId;

    @Column(name = "admin_id", nullable = false)
    private String adminId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAnnonce decision;

    @Column(columnDefinition = "TEXT")
    private String motif;

    @Column(name = "date_decision", nullable = false)
    private LocalDateTime dateDecision;

    @Column(name = "correlation_id")
    private String correlationId;

    @PrePersist
    protected void onCreate() {
        this.dateDecision = LocalDateTime.now();
    }
}
