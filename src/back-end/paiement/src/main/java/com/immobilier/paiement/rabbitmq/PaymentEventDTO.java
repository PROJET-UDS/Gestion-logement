package com.immobilier.paiement.rabbitmq;

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
public class PaymentEventDTO {

    private Long paymentId;
    private Long reservationId;
    private String userId;
    private Double amount;
    private String currency;
    private PaymentProvider provider;
    private PaymentStatus status;
    private String transactionRef;
    private LocalDateTime createdAt;
}