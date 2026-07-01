package com.immobilier.paiement.service;

import com.immobilier.paiement.dto.PaymentRequestDTO;
import com.immobilier.paiement.dto.PaymentResponseDTO;
import com.immobilier.paiement.entity.Payment;
import com.immobilier.paiement.entity.PaymentStatus;
import com.immobilier.paiement.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentResponseDTO initiatePayment(PaymentRequestDTO requestDTO) {
        Payment payment = Payment.builder()
                .reservationId(requestDTO.getReservationId())
                .userId(requestDTO.getUserId())
                .amount(requestDTO.getAmount())
                .currency("XAF")
                .provider(requestDTO.getProvider())
                .phoneNumber(requestDTO.getPhoneNumber())
                .status(PaymentStatus.PENDING)
                .transactionRef(generateTransactionRef())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        return mapToResponseDTO(savedPayment);
    }

    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement introuvable avec l'id : " + id));
        return mapToResponseDTO(payment);
    }

    public List<PaymentResponseDTO> getPaymentsByReservation(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public PaymentResponseDTO updateStatus(Long id, PaymentStatus newStatus) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement introuvable avec l'id : " + id));

        payment.setStatus(newStatus);
        Payment updatedPayment = paymentRepository.save(payment);

        return mapToResponseDTO(updatedPayment);
    }

    private String generateTransactionRef() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private PaymentResponseDTO mapToResponseDTO(Payment payment) {
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