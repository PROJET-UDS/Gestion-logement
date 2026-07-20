package com.immobilier.reservation.repository;

import com.immobilier.reservation.entity.Reservation;
import com.immobilier.reservation.entity.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByClientId(String clientId);

    List<Reservation> findByLogementId(Long logementId);

    List<Reservation> findByProprietaireId(String proprietaireId);

    List<Reservation> findByLogementIdIn(List<Long> logementIds);

    List<Reservation> findByStatut(StatutReservation statut);

    /**
     * Recherche les réservations d'un logement qui chevauchent une période donnée.
     * Une réservation ANNULEE n'est pas prise en compte dans le calcul de disponibilité.
     * Deux périodes [debut1, fin1] et [debut2, fin2] se chevauchent si :
     * debut1 <= fin2 ET fin1 >= debut2
     */
    @Query("SELECT r FROM Reservation r " +
            "WHERE r.logementId = :logementId " +
            "AND r.statut <> com.immobilier.reservation.entity.StatutReservation.ANNULEE " +
            "AND r.dateDebut <= :dateFin " +
            "AND r.dateFin >= :dateDebut")
    List<Reservation> findReservationsChevauchantes(
            @Param("logementId") Long logementId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);

    /**
     * Même recherche que ci-dessus, mais en excluant une réservation précise.
     * Utile lors de la mise à jour d'une réservation existante (pour ne pas se comparer à elle-même).
     */
    @Query("SELECT r FROM Reservation r " +
            "WHERE r.logementId = :logementId " +
            "AND r.id <> :reservationId " +
            "AND r.statut <> com.immobilier.reservation.entity.StatutReservation.ANNULEE " +
            "AND r.dateDebut <= :dateFin " +
            "AND r.dateFin >= :dateDebut")
    List<Reservation> findReservationsChevauchantesSauf(
            @Param("logementId") Long logementId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("reservationId") Long reservationId);
}
