package com.immobilier.reservation.service;

import com.immobilier.reservation.dto.ReservationRequestDTO;
import com.immobilier.reservation.dto.ReservationResponseDTO;
import com.immobilier.reservation.event.ReservationEventPublisher;
import com.immobilier.reservation.exception.LogementIndisponibleException;
import com.immobilier.reservation.exception.RessourceNonTrouveeException;
import com.immobilier.reservation.entity.Reservation;
import com.immobilier.reservation.entity.StatutReservation;
import com.immobilier.reservation.mapper.ReservationMapper;
import com.immobilier.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;
    private final ReservationEventPublisher eventPublisher;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository,
                              ReservationMapper reservationMapper,
                              ReservationEventPublisher eventPublisher) {
        this.reservationRepository = reservationRepository;
        this.reservationMapper = reservationMapper;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Crée une nouvelle réservation après vérification de la disponibilité du logement.
     * Version simplifiée : logementId/clientId ne sont pas vérifiés auprès d'autres
     * microservices pour l'instant (à ajouter à la fusion via Feign).
     * Publie un événement RabbitMQ "reservation.creee" après sauvegarde.
     */
    @Transactional
    public ReservationResponseDTO creerReservation(ReservationRequestDTO dto) {

        if (!dto.getDateFin().isAfter(dto.getDateDebut())) {
            throw new IllegalArgumentException("La date de fin doit être postérieure à la date de début");
        }

        verifierDisponibilite(dto.getLogementId(), dto.getDateDebut(), dto.getDateFin(), null);

        Reservation reservation = new Reservation();
        reservation.setLogementId(dto.getLogementId());
        reservation.setClientId(dto.getClientId());
        reservation.setDateDebut(dto.getDateDebut());
        reservation.setDateFin(dto.getDateFin());
        reservation.setPrixTotal(java.math.BigDecimal.ZERO); // à calculer plus tard via le microservice logement
        reservation.setStatut(StatutReservation.EN_ATTENTE);

        Reservation sauvegardee = reservationRepository.save(reservation);

        eventPublisher.publierReservationCreee(sauvegardee);

        return reservationMapper.toResponseDTO(sauvegardee);
    }

    private void verifierDisponibilite(Long logementId, java.time.LocalDate dateDebut,
                                       java.time.LocalDate dateFin, Long reservationIdAExclure) {

        List<Reservation> conflits = (reservationIdAExclure == null)
                ? reservationRepository.findReservationsChevauchantes(logementId, dateDebut, dateFin)
                : reservationRepository.findReservationsChevauchantesSauf(
                logementId, dateDebut, dateFin, reservationIdAExclure);

        if (!conflits.isEmpty()) {
            throw new LogementIndisponibleException(
                    "Le logement n'est pas disponible pour la période du " + dateDebut + " au " + dateFin);
        }
    }

    @Transactional
    public ReservationResponseDTO mettreAJourReservation(Long id, ReservationRequestDTO dto) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RessourceNonTrouveeException(
                        "Réservation introuvable avec l'id : " + id));

        if (reservation.getStatut() == StatutReservation.ANNULEE) {
            throw new IllegalStateException("Impossible de modifier une réservation annulée");
        }

        if (!dto.getDateFin().isAfter(dto.getDateDebut())) {
            throw new IllegalArgumentException("La date de fin doit être postérieure à la date de début");
        }

        verifierDisponibilite(dto.getLogementId(), dto.getDateDebut(), dto.getDateFin(), id);

        reservation.setLogementId(dto.getLogementId());
        reservation.setDateDebut(dto.getDateDebut());
        reservation.setDateFin(dto.getDateFin());

        Reservation sauvegardee = reservationRepository.save(reservation);
        return reservationMapper.toResponseDTO(sauvegardee);
    }

    /**
     * Confirme une réservation et publie un événement RabbitMQ "reservation.confirmee".
     */
    @Transactional
    public ReservationResponseDTO confirmerReservation(Long id) {
        Reservation reservation = getReservationOuLeverException(id);
        reservation.setStatut(StatutReservation.CONFIRMEE);
        Reservation sauvegardee = reservationRepository.save(reservation);

        eventPublisher.publierReservationConfirmee(sauvegardee);

        return reservationMapper.toResponseDTO(sauvegardee);
    }

    /**
     * Annule une réservation et publie un événement RabbitMQ "reservation.annulee".
     */
    @Transactional
    public ReservationResponseDTO annulerReservation(Long id) {
        Reservation reservation = getReservationOuLeverException(id);
        reservation.setStatut(StatutReservation.ANNULEE);
        Reservation sauvegardee = reservationRepository.save(reservation);

        eventPublisher.publierReservationAnnulee(sauvegardee);

        return reservationMapper.toResponseDTO(sauvegardee);
    }

    public ReservationResponseDTO getReservationParId(Long id) {
        return reservationMapper.toResponseDTO(getReservationOuLeverException(id));
    }

    public List<ReservationResponseDTO> getToutesLesReservations() {
        return reservationRepository.findAll().stream()
                .map(reservationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ReservationResponseDTO> getReservationsParClient(String clientId) {
        return reservationRepository.findByClientId(clientId).stream()
                .map(reservationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ReservationResponseDTO> getReservationsParLogement(Long logementId) {
        return reservationRepository.findByLogementId(logementId).stream()
                .map(reservationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void supprimerReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new RessourceNonTrouveeException("Réservation introuvable avec l'id : " + id);
        }
        reservationRepository.deleteById(id);
    }

    private Reservation getReservationOuLeverException(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RessourceNonTrouveeException(
                        "Réservation introuvable avec l'id : " + id));
    }
}
