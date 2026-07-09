package com.immobilier.logement.rabbitmq;

import com.immobilier.logement.enums.TypeTransaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogementEvent {
    private Long logementId;
    private String titre;
    private BigDecimal prix;
    private TypeTransaction typeTransaction;
    private Long proprietaireId;
}