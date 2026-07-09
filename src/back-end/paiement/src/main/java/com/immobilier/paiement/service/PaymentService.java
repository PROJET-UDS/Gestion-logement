package com.immobilier.paiement.service;

import com.immobilier.paiement.dto.PaymentRequestDTO;
import com.immobilier.paiement.dto.PaymentResponseDTO;
import com.immobilier.paiement.entity.Payment;
import com.immobilier.paiement.entity.PaymentStatus;
import com.immobilier.paiement.exception.PaymentNotFoundException;
import com.immobilier.paiement.mapper.PaymentMapper;
import com.immobilier.paiement.rabbitmq.PaymentEventDTO;
import com.immobilier.paiement.rabbitmq.PaymentEventPublisher;
import com.immobilier.paiement.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentEventPublisher paymentEventPublisher;

    public PaymentResponseDTO initiatePayment(PaymentRequestDTO requestDTO) {
        Payment payment = paymentMapper.toEntity(requestDTO);
        payment.setTransactionRef(generateTransactionRef());
        Payment savedPayment = paymentRepository.save(payment);

        // Publier l'événement dans RabbitMQ
        paymentEventPublisher.publishPaymentEvent(buildEvent(savedPayment));
        log.info("Paiement initié : {}", savedPayment.getTransactionRef());

        return paymentMapper.toResponseDTO(savedPayment);
    }

    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException(id));
        return paymentMapper.toResponseDTO(payment);
    }

    public List<PaymentResponseDTO> getPaymentsByReservation(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .stream()
                .map(paymentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId)
                .stream()
                .map(paymentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public PaymentResponseDTO updateStatus(Long id, PaymentStatus newStatus) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException(id));
        payment.setStatus(newStatus);
        Payment updatedPayment = paymentRepository.save(payment);

        // Publier l'événement de mise à jour dans RabbitMQ
        paymentEventPublisher.publishPaymentEvent(buildEvent(updatedPayment));
        log.info("Statut paiement mis à jour : {} -> {}", updatedPayment.getTransactionRef(), newStatus);

        return paymentMapper.toResponseDTO(updatedPayment);
    }

    private String generateTransactionRef() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private PaymentEventDTO buildEvent(Payment payment) {
        return PaymentEventDTO.builder()
                .paymentId(payment.getId())
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