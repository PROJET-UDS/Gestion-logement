package com.immobilier.paiement.dto;

import com.immobilier.paiement.entity.PaymentProvider;
import com.immobilier.paiement.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {

    private Long id;
    private Long reservationId;
    private String userId;
    private Double amount;
    private String currency;
    private PaymentProvider provider;
    private PaymentStatus status;
    private String transactionRef;
    private String cardLastFour;
    private String cardBrand;
    private String failureReason;
    private LocalDateTime createdAt;
}