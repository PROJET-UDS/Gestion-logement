package com.immobilier.logement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "t_medias_logement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaLogement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "is_360_view", nullable = false)
    private boolean is360View; // true si c'est une ressource de visite virtuelle 3D/360°

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logement_id", nullable = false)
    private Logement logement;
}