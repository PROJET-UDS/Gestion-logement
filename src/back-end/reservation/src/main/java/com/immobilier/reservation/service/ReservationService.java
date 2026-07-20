package com.immobilier.reservation.service;

import com.immobilier.reservation.client.LogementServiceClient;
import com.immobilier.reservation.client.PaiementServiceClient;
import com.immobilier.reservation.dto.LogementInfoDTO;
import com.immobilier.reservation.dto.PaiementRequestDTO;
import com.immobilier.reservation.dto.ReservationRequestDTO;
import com.immobilier.reservation.dto.ReservationResponseDTO;
import com.immobilier.reservation.entity.PaymentStatut;
import com.immobilier.reservation.entity.Reservation;
import com.immobilier.reservation.entity.StatutReservation;
import com.immobilier.reservation.event.ReservationEventPublisher;
import com.immobilier.reservation.exception.LogementIndisponibleException;
import com.immobilier.reservation.exception.RessourceNonTrouveeException;
import com.immobilier.reservation.mapper.ReservationMapper;
import com.immobilier.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private static final BigDecimal POURCENTAGE_RESERVATION = new BigDecimal("0.10");

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;
    private final ReservationEventPublisher eventPublisher;
    private final LogementServiceClient logementServiceClient;
    private final PaiementServiceClient paiementServiceClient;

    @Transactional
    public ReservationResponseDTO creerReservation(ReservationRequestDTO dto) {
        if (!dto.getDateFin().isAfter(dto.getDateDebut())) {
            throw new IllegalArgumentException("La date de fin doit être postérieure à la date de début");
        }

        verifierDisponibilite(dto.getLogementId(), dto.getDateDebut(), dto.getDateFin(), null);

        LogementInfoDTO logement = logementServiceClient.getLogementById(dto.getLogementId());

        if (logement == null) {
            throw new RessourceNonTrouveeException("Logement introuvable avec l'id : " + dto.getLogementId());
        }

        BigDecimal prixLogement = logement.getPrix();
        BigDecimal montantReservation = prixLogement.multiply(POURCENTAGE_RESERVATION).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montantRestant = prixLogement.subtract(montantReservation).setScale(2, RoundingMode.HALF_UP);

        Reservation reservation = new Reservation();
        reservation.setLogementId(dto.getLogementId());
        reservation.setClientId(dto.getClientId());
        reservation.setProprietaireId(logement.getProprietaireId());
        reservation.setDateDebut(dto.getDateDebut());
        reservation.setDateFin(dto.getDateFin());
        reservation.setPrixLogement(prixLogement);
        reservation.setPrixTotal(prixLogement);
        reservation.setMontantReservation(montantReservation);
        reservation.setMontantRestant(montantRestant);
        reservation.setStatut(StatutReservation.EN_ATTENTE);
        reservation.setPaymentStatut(PaymentStatut.EN_ATTENTE);
        reservation.setMethodepayment(dto.getMethodepayment());
        reservation.setPhoneNumber(dto.getPhoneNumber());

        Reservation sauvegardee = reservationRepository.save(reservation);
        eventPublisher.publierReservationCreee(sauvegardee);

        ReservationResponseDTO response = reservationMapper.toResponseDTO(sauvegardee);
        response.setLogementTitre(logement.getTitre());
        response.setLogementAdresse(logement.getAdresse() + ", " + logement.getVille());
        return response;
    }

    @Transactional
    public ReservationResponseDTO payerReservation(Long id, String methodepayment) {
        Reservation reservation = getReservationOuLeverException(id);

        if (reservation.getPaymentStatut() == PaymentStatut.PAYE) {
            throw new IllegalStateException("Cette réservation a déjà été payée");
        }

        reservation.setPaymentStatut(PaymentStatut.PAYE);
        reservation.setMethodepayment(methodepayment);
        reservation.setDatepayment(java.time.LocalDateTime.now());
        reservation.setStatut(StatutReservation.CONFIRMEE);

        Reservation sauvegardee = reservationRepository.save(reservation);

        try {
            PaiementRequestDTO paiementReq = new PaiementRequestDTO();
            paiementReq.setReservationId(sauvegardee.getId());
            paiementReq.setUserId(sauvegardee.getClientId());
            paiementReq.setAmount(sauvegardee.getMontantReservation().doubleValue());
            paiementReq.setMethode(methodepayment);
            paiementReq.setPhoneNumber(sauvegardee.getPhoneNumber());
            paiementServiceClient.creerPaiementDepuisReservation(paiementReq);
        } catch (Exception e) {
            log.warn("Impossible de créer le paiement dans le module paiement : {}", e.getMessage());
        }

        try {
            logementServiceClient.changerStatut(reservation.getLogementId(), "RESERVE");
        } catch (Exception e) {
            log.warn("Impossible de mettre à jour le statut du logement {} : {}", reservation.getLogementId(), e.getMessage());
        }

        eventPublisher.publierReservationConfirmee(sauvegardee);

        return enrichirAvecLogement(reservationMapper.toResponseDTO(sauvegardee));
    }

    @Transactional
    public ReservationResponseDTO payerLeReste(Long id, String methodepayment) {
        Reservation reservation = getReservationOuLeverException(id);

        if (reservation.getPaymentStatut() != PaymentStatut.PAYE) {
            throw new IllegalStateException("Le dépôt de 10% doit être payé d'abord");
        }

        reservation.setMontantRestant(BigDecimal.ZERO);
        reservation.setMethodepayment(methodepayment);
        reservation.setDatepayment(java.time.LocalDateTime.now());

        Reservation sauvegardee = reservationRepository.save(reservation);

        try {
            LogementInfoDTO logement = logementServiceClient.getLogementById(reservation.getLogementId());
            if (logement != null && "LOCATION".equals(logement.getTypeTransaction())) {
                logementServiceClient.changerStatut(reservation.getLogementId(), "LOUE");
            } else {
                logementServiceClient.changerStatut(reservation.getLogementId(), "VENDU");
            }
        } catch (Exception e) {
            log.warn("Impossible de mettre à jour le statut du logement {} : {}", reservation.getLogementId(), e.getMessage());
        }

        return enrichirAvecLogement(reservationMapper.toResponseDTO(sauvegardee));
    }

    @Transactional
    public ReservationResponseDTO rembourser(Long id) {
        Reservation reservation = getReservationOuLeverException(id);

        if (reservation.getPaymentStatut() != PaymentStatut.PAYE) {
            throw new IllegalStateException("Seules les réservations payées peuvent être remboursées");
        }

        reservation.setPaymentStatut(PaymentStatut.REMBOURSE);
        reservation.setStatut(StatutReservation.ANNULEE);

        Reservation sauvegardee = reservationRepository.save(reservation);

        try {
            logementServiceClient.changerStatut(reservation.getLogementId(), "VALIDE");
        } catch (Exception e) {
            log.warn("Impossible de remettre le logement {} en vente : {}", reservation.getLogementId(), e.getMessage());
        }

        eventPublisher.publierReservationAnnulee(sauvegardee);

        return enrichirAvecLogement(reservationMapper.toResponseDTO(sauvegardee));
    }

    @Transactional
    public ReservationResponseDTO annulerReservation(Long id) {
        Reservation reservation = getReservationOuLeverException(id);

        if (reservation.getPaymentStatut() == PaymentStatut.PAYE) {
            throw new IllegalStateException("Cette réservation est déjà payée. Utilisez le remboursement.");
        }

        reservation.setStatut(StatutReservation.ANNULEE);
        Reservation sauvegardee = reservationRepository.save(reservation);

        eventPublisher.publierReservationAnnulee(sauvegardee);

        return enrichirAvecLogement(reservationMapper.toResponseDTO(sauvegardee));
    }

    public ReservationResponseDTO getReservationParId(Long id) {
        return enrichirAvecLogement(reservationMapper.toResponseDTO(getReservationOuLeverException(id)));
    }

    public List<ReservationResponseDTO> getReservationsParClient(String clientId) {
        return reservationRepository.findByClientId(clientId).stream()
                .map(reservationMapper::toResponseDTO)
                .map(this::enrichirAvecLogement)
                .sorted(Comparator.comparing(ReservationResponseDTO::getJoursRestants))
                .collect(Collectors.toList());
    }

    public List<ReservationResponseDTO> getReservationsParLogement(Long logementId) {
        return reservationRepository.findByLogementId(logementId).stream()
                .map(reservationMapper::toResponseDTO)
                .map(this::enrichirAvecLogement)
                .collect(Collectors.toList());
    }

    public List<ReservationResponseDTO> getReservationsParProprietaire(String proprietaireId) {
        return reservationRepository.findByProprietaireId(proprietaireId).stream()
                .map(reservationMapper::toResponseDTO)
                .map(this::enrichirAvecLogement)
                .sorted(Comparator.comparing(ReservationResponseDTO::getDateCreation).reversed())
                .collect(Collectors.toList());
    }

    @Transactional
    public void supprimerReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new RessourceNonTrouveeException("Réservation introuvable avec l'id : " + id);
        }
        reservationRepository.deleteById(id);
    }

    private void verifierDisponibilite(Long logementId, LocalDate dateDebut,
                                        LocalDate dateFin, Long reservationIdAExclure) {
        List<Reservation> conflits = (reservationIdAExclure == null)
                ? reservationRepository.findReservationsChevauchantes(logementId, dateDebut, dateFin)
                : reservationRepository.findReservationsChevauchantesSauf(
                logementId, dateDebut, dateFin, reservationIdAExclure);

        if (!conflits.isEmpty()) {
            throw new LogementIndisponibleException(
                    "Le logement n'est pas disponible pour la période du " + dateDebut + " au " + dateFin);
        }
    }

    private ReservationResponseDTO enrichirAvecLogement(ReservationResponseDTO dto) {
        try {
            LogementInfoDTO logement = logementServiceClient.getLogementById(dto.getLogementId());
            if (logement != null) {
                dto.setLogementTitre(logement.getTitre());
                dto.setLogementAdresse(logement.getAdresse() + ", " + logement.getVille());
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer les infos du logement {} : {}", dto.getLogementId(), e.getMessage());
        }
        return dto;
    }

    private Reservation getReservationOuLeverException(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RessourceNonTrouveeException(
                        "Réservation introuvable avec l'id : " + id));
    }
}
