package com.immobilier.reservation.controller;
import com.immobilier.reservation.dto.ReservationRequestDTO;
import com.immobilier.reservation.dto.ReservationResponseDTO;
import com.immobilier.reservation.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDTO> creer(@Valid @RequestBody ReservationRequestDTO dto) {
        ReservationResponseDTO reservation = reservationService.creerReservation(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDTO>> getToutes() {
        return ResponseEntity.ok(reservationService.getToutesLesReservations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> getParId(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationParId(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ReservationResponseDTO>> getParClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(reservationService.getReservationsParClient(clientId));
    }

    @GetMapping("/logement/{logementId}")
    public ResponseEntity<List<ReservationResponseDTO>> getParLogement(@PathVariable Long logementId) {
        return ResponseEntity.ok(reservationService.getReservationsParLogement(logementId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> mettreAJour(
            @PathVariable Long id, @Valid @RequestBody ReservationRequestDTO dto) {
        return ResponseEntity.ok(reservationService.mettreAJourReservation(id, dto));
    }

    @PatchMapping("/{id}/confirmer")
    public ResponseEntity<ReservationResponseDTO> confirmer(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.confirmerReservation(id));
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