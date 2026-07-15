package com.immobilier.logement.dto;

import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationAlerteEvent implements Serializable {
    private String utilisateurId;
    private Long logementId;
    private String titreLogement;
    private String ville;
    private BigDecimal prix;
}