package com.immobilier.paiement.controller;

import com.immobilier.paiement.dto.PaymentRequestDTO;
import com.immobilier.paiement.dto.PaymentResponseDTO;
import com.immobilier.paiement.entity.PaymentStatus;
import com.immobilier.paiement.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponseDTO> initiatePayment(@Valid @RequestBody PaymentRequestDTO requestDTO) {
        PaymentResponseDTO response = paymentService.initiatePayment(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        PaymentResponseDTO response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByReservation(@PathVariable Long reservationId) {
        List<PaymentResponseDTO> response = paymentService.getPaymentsByReservation(reservationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByUser(@PathVariable Long userId) {
        List<PaymentResponseDTO> response = paymentService.getPaymentsByUser(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PaymentResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        PaymentResponseDTO response = paymentService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }
}