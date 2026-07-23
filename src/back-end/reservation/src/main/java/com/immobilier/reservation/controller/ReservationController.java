package com.immobilier.reservation.controller;

import com.immobilier.reservation.dto.ReservationRequestDTO;
import com.immobilier.reservation.dto.ReservationResponseDTO;
import com.immobilier.reservation.security.AuthenticatedUser;
import com.immobilier.reservation.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponseDTO>> getToutesLesReservations() {
        return ResponseEntity.ok(reservationService.getToutesLesReservations());
    }

    @GetMapping("/proprietaire")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsProprietaire(
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reservationService.getReservationsParProprietaire(user.userId()));
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDTO> creer(
            @Valid @RequestBody ReservationRequestDTO dto,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user != null) {
            dto.setClientId(user.userId());
        }
        ReservationResponseDTO reservation = reservationService.creerReservation(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ReservationResponseDTO>> getParClient(@PathVariable String clientId) {
        return ResponseEntity.ok(reservationService.getReservationsParClient(clientId));
    }

    @GetMapping("/mes-reservations")
    public ResponseEntity<List<ReservationResponseDTO>> mesReservations(
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reservationService.getReservationsParClient(user.userId()));
    }

    @GetMapping("/logement/{logementId}")
    public ResponseEntity<List<ReservationResponseDTO>> getParLogement(@PathVariable Long logementId) {
        return ResponseEntity.ok(reservationService.getReservationsParLogement(logementId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> getParId(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationParId(id));
    }

    @PostMapping("/{id}/payer")
    public ResponseEntity<ReservationResponseDTO> payer(
            @PathVariable Long id,
            @RequestParam String methodepayment) {
        return ResponseEntity.ok(reservationService.payerReservation(id, methodepayment));
    }

    @PostMapping("/{id}/payer-le-reste")
    public ResponseEntity<ReservationResponseDTO> payerLeReste(
            @PathVariable Long id,
            @RequestParam String methodepayment) {
        return ResponseEntity.ok(reservationService.payerLeReste(id, methodepayment));
    }

    @PostMapping("/{id}/rembourser")
    public ResponseEntity<ReservationResponseDTO> rembourser(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.rembourser(id));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<ReservationResponseDTO> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.annulerReservation(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        reservationService.supprimerReservation(id);
        return ResponseEntity.noContent().build();
    }
}
