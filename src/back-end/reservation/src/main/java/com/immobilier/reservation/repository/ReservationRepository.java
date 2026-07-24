package com.immobilier.reservation.repository;

import com.immobilier.reservation.entity.Reservation;
import com.immobilier.reservation.entity.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByClientId(String clientId);

    List<Reservation> findByLogementId(Long logementId);

    List<Reservation> findByProprietaireId(String proprietaireId);

    List<Reservation> findByLogementIdIn(List<Long> logementIds);

    List<Reservation> findByStatut(StatutReservation statut);
}
