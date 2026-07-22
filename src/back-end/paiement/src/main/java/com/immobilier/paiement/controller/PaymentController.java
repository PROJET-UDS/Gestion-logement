package com.immobilier.paiement.controller;

import com.immobilier.paiement.dto.CardPaymentRequestDTO;
import com.immobilier.paiement.dto.PaiementFromReservationRequestDTO;
import com.immobilier.paiement.dto.PaymentRequestDTO;
import com.immobilier.paiement.dto.PaymentResponseDTO;
import com.immobilier.paiement.entity.PaymentStatus;
import com.immobilier.paiement.security.AuthenticatedUser;
import com.immobilier.paiement.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> initiatePayment(
            @Valid @RequestBody PaymentRequestDTO requestDTO,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        PaymentResponseDTO response = paymentService.initiatePayment(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/from-reservation")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> creerDepuisReservation(
            @RequestBody PaiementFromReservationRequestDTO requestDTO) {
        PaymentResponseDTO response = paymentService.creerPaiementDepuisReservation(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/card")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> processCardPayment(
            @Valid @RequestBody CardPaymentRequestDTO requestDTO) {
        PaymentResponseDTO response = paymentService.processCardPayment(requestDTO);
        HttpStatus status = response.getStatus() == PaymentStatus.SUCCESS ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        PaymentResponseDTO response = paymentService.getPaymentById(id);
        String role = user.role();
        if (!"ADMIN".equals(role) && !user.userId().equals(response.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByReservation(
            @PathVariable Long reservationId) {
        List<PaymentResponseDTO> response = paymentService.getPaymentsByReservation(reservationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByUser(
            @PathVariable String userId) {
        List<PaymentResponseDTO> response = paymentService.getPaymentsByUser(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        PaymentResponseDTO response = paymentService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }
}
