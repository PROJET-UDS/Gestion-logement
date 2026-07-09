package com.immobilier.paiement.mapper;

import com.immobilier.paiement.dto.PaymentRequestDTO;
import com.immobilier.paiement.dto.PaymentResponseDTO;
import com.immobilier.paiement.entity.Payment;
import com.immobilier.paiement.entity.PaymentStatus;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public Payment toEntity(PaymentRequestDTO dto) {
        return Payment.builder()
                .reservationId(dto.getReservationId())
                .userId(dto.getUserId())
                .amount(dto.getAmount())
                .currency("XAF")
                .provider(dto.getProvider())
                .phoneNumber(dto.getPhoneNumber())
                .status(PaymentStatus.PENDING)
                .build();
    }

    public PaymentResponseDTO toResponseDTO(Payment payment) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .reservationId(payment.getReservationId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .provider(payment.getProvider())
                .status(payment.getStatus())
                .transactionRef(payment.getTransactionRef())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}