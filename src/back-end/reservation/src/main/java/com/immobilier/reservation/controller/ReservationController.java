package com.immobilier.reservation.controller;

import com.immobilier.reservation.dto.ReservationRequestDTO;
import com.immobilier.reservation.dto.ReservationResponseDTO;
import com.immobilier.reservation.entity.Reservation;
import com.immobilier.reservation.exception.RessourceNonTrouveeException;
import com.immobilier.reservation.repository.ReservationRepository;
import com.immobilier.reservation.security.AuthenticatedUser;
import com.immobilier.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;

    @GetMapping("/proprietaire")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsProprietaire(
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reservationService.getReservationsParProprietaire(user.userId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponseDTO> creer(
            @Valid @RequestBody ReservationRequestDTO dto,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        dto.setClientId(user.userId());
        ReservationResponseDTO reservation = reservationService.creerReservation(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    @GetMapping("/mes-reservations")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponseDTO>> mesReservations(
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reservationService.getReservationsParClient(user.userId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponseDTO> getParId(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RessourceNonTrouveeException("Reservation introuvable"));
        String role = user.role();
        if (!"ADMIN".equals(role) &&
            !user.userId().equals(reservation.getClientId()) &&
            !user.userId().equals(reservation.getProprietaireId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reservationService.getReservationParId(id));
    }

    @PostMapping("/{id}/payer")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponseDTO> payer(
            @PathVariable Long id,
            @RequestParam String methodepayment,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RessourceNonTrouveeException("Reservation introuvable"));
        String role = user.role();
        if (!"ADMIN".equals(role) && !user.userId().equals(reservation.getClientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reservationService.payerReservation(id, methodepayment));
    }

    @PostMapping("/{id}/payer-le-reste")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponseDTO> payerLeReste(
            @PathVariable Long id,
            @RequestParam String methodepayment,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RessourceNonTrouveeException("Reservation introuvable"));
        String role = user.role();
        if (!"ADMIN".equals(role) && !user.userId().equals(reservation.getClientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reservationService.payerLeReste(id, methodepayment));
    }

    @PostMapping("/{id}/rembourser")
    @PreAuthorize("hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponseDTO> rembourser(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RessourceNonTrouveeException("Reservation introuvable"));
        String role = user.role();
        if (!"ADMIN".equals(role) && !user.userId().equals(reservation.getProprietaireId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reservationService.rembourser(id));
    }

    @PatchMapping("/{id}/annuler")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROPRIETAIRE') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponseDTO> annuler(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RessourceNonTrouveeException("Reservation introuvable"));
        String role = user.role();
        if (!"ADMIN".equals(role) &&
            !user.userId().equals(reservation.getClientId()) &&
            !user.userId().equals(reservation.getProprietaireId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reservationService.annulerReservation(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        reservationService.supprimerReservation(id);
        return ResponseEntity.noContent().build();
    }
}
