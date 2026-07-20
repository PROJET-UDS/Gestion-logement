package com.immobilier.paiement.service;

import com.immobilier.paiement.dto.CardPaymentRequestDTO;
import com.immobilier.paiement.dto.PaiementFromReservationRequestDTO;
import com.immobilier.paiement.dto.PaymentRequestDTO;
import com.immobilier.paiement.dto.PaymentResponseDTO;
import com.immobilier.paiement.entity.Payment;
import com.immobilier.paiement.entity.PaymentProvider;
import com.immobilier.paiement.entity.PaymentStatus;
import com.immobilier.paiement.exception.PaymentNotFoundException;
import com.immobilier.paiement.mapper.PaymentMapper;
import com.immobilier.paiement.rabbitmq.PaymentEventDTO;
import com.immobilier.paiement.rabbitmq.PaymentEventPublisher;
import com.immobilier.paiement.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentEventPublisher paymentEventPublisher;
    private final CardValidationService cardValidationService;

    public PaymentResponseDTO creerPaiementDepuisReservation(PaiementFromReservationRequestDTO requestDTO) {
        PaymentProvider provider = mapMethodeToProvider(requestDTO.getMethode());

        Payment payment = Payment.builder()
                .reservationId(requestDTO.getReservationId())
                .userId(requestDTO.getUserId())
                .amount(requestDTO.getAmount())
                .currency("XAF")
                .provider(provider)
                .phoneNumber(requestDTO.getPhoneNumber() != null ? requestDTO.getPhoneNumber() : "0000000000")
                .status(PaymentStatus.SUCCESS)
                .transactionRef(generateTransactionRef())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        paymentEventPublisher.publishPaymentEvent(buildEvent(savedPayment));
        log.info("Paiement cree depuis reservation {} : {}", requestDTO.getReservationId(), savedPayment.getTransactionRef());

        return paymentMapper.toResponseDTO(savedPayment);
    }

    private PaymentProvider mapMethodeToProvider(String methode) {
        if (methode == null) return PaymentProvider.CARD;
        switch (methode.toUpperCase()) {
            case "ORANGE_MONEY": return PaymentProvider.ORANGE_MONEY;
            case "MTN_MOMO": return PaymentProvider.MTN_MOMO;
            case "WAVE": return PaymentProvider.WAVE;
            case "VISA": return PaymentProvider.CARD;
            default: return PaymentProvider.CARD;
        }
    }

    public PaymentResponseDTO initiatePayment(PaymentRequestDTO requestDTO) {
        Payment payment = paymentMapper.toEntity(requestDTO);
        payment.setTransactionRef(generateTransactionRef());
        Payment savedPayment = paymentRepository.save(payment);

        paymentEventPublisher.publishPaymentEvent(buildEvent(savedPayment));
        log.info("Payment initie : {}", savedPayment.getTransactionRef());

        return paymentMapper.toResponseDTO(savedPayment);
    }

    @Transactional
    public PaymentResponseDTO processCardPayment(CardPaymentRequestDTO requestDTO) {
        // Check idempotency: if same key already processed, return existing result
        Optional<Payment> existingPayment = paymentRepository.findByIdempotencyKey(requestDTO.getIdempotencyKey());
        if (existingPayment.isPresent()) {
            log.info("Paiement deja traite avec la cle d'idempotence : {}", requestDTO.getIdempotencyKey());
            return paymentMapper.toResponseDTO(existingPayment.get());
        }

        // Validate card details
        String cardNumber = requestDTO.getCardNumber().replaceAll("\\s+", "");

        if (!cardValidationService.validateLuhn(cardNumber)) {
            return createFailedCardPayment(requestDTO, "Numero de carte invalide");
        }

        if (!cardValidationService.validateExpiry(requestDTO.getExpiryDate())) {
            return createFailedCardPayment(requestDTO, "Date d'expiration invalide ou expiree");
        }

        if (!cardValidationService.validateCvv(requestDTO.getCvv())) {
            return createFailedCardPayment(requestDTO, "CVV invalide");
        }

        // Detect card brand and get last 4 digits
        String cardBrand = cardValidationService.detectBrand(cardNumber);
        String lastFour = cardNumber.substring(cardNumber.length() - 4);

        // Simulate payment
        CardValidationService.PaymentSimulationResult simulationResult =
                cardValidationService.simulatePayment(cardNumber);

        // Create payment entity - NEVER store full card number or CVV
        Payment payment = Payment.builder()
                .reservationId(requestDTO.getReservationId())
                .userId(requestDTO.getUserId())
                .amount(requestDTO.getAmount())
                .currency("XAF")
                .provider(PaymentProvider.CARD)
                .cardLastFour(lastFour)
                .cardBrand(cardBrand)
                .idempotencyKey(requestDTO.getIdempotencyKey())
                .transactionRef(generateTransactionRef())
                .build();

        // Set status based on simulation result
        switch (simulationResult) {
            case SUCCESS -> {
                payment.setStatus(PaymentStatus.SUCCESS);
                log.info("Paiement par carte reussi : {}", payment.getTransactionRef());
            }
            case DECLINED -> {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Carte refusee");
                log.warn("Paiement par carte refuse : {}", payment.getTransactionRef());
            }
            case INSUFFICIENT_FUNDS -> {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Fonds insuffisants");
                log.warn("Paiement par carte echoue - fonds insuffisants : {}", payment.getTransactionRef());
            }
            case INVALID_CARD -> {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Carte invalide");
                log.warn("Paiement par carte echoue - carte invalide : {}", payment.getTransactionRef());
            }
        }

        Payment savedPayment = paymentRepository.save(payment);

        // Publish RabbitMQ event
        PaymentEventDTO event = buildEvent(savedPayment);
        paymentEventPublisher.publishPaymentEvent(event);

        return paymentMapper.toResponseDTO(savedPayment);
    }

    private PaymentResponseDTO createFailedCardPayment(CardPaymentRequestDTO requestDTO, String failureReason) {
        String cardNumber = requestDTO.getCardNumber().replaceAll("\\s+", "");
        String lastFour = cardNumber.length() >= 4 ? cardNumber.substring(cardNumber.length() - 4) : "****";
        String cardBrand = cardValidationService.detectBrand(cardNumber);

        Payment payment = Payment.builder()
                .reservationId(requestDTO.getReservationId())
                .userId(requestDTO.getUserId())
                .amount(requestDTO.getAmount())
                .currency("XAF")
                .provider(PaymentProvider.CARD)
                .status(PaymentStatus.FAILED)
                .cardLastFour(lastFour)
                .cardBrand(cardBrand)
                .failureReason(failureReason)
                .idempotencyKey(requestDTO.getIdempotencyKey())
                .transactionRef(generateTransactionRef())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        paymentEventPublisher.publishPaymentEvent(buildEvent(savedPayment));
        log.warn("Paiement par carte echoue - {} : {}", failureReason, savedPayment.getTransactionRef());

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

    public List<PaymentResponseDTO> getPaymentsByUser(String userId) {
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

        paymentEventPublisher.publishPaymentEvent(buildEvent(updatedPayment));
        log.info("Statut payment mis a jour : {} -> {}", updatedPayment.getTransactionRef(), newStatus);

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