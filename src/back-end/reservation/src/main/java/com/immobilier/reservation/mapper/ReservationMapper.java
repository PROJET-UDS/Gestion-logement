package com.immobilier.reservation.mapper;

import com.immobilier.reservation.dto.ReservationResponseDTO;
import com.immobilier.reservation.entity.Reservation;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class ReservationMapper {

    public ReservationResponseDTO toResponseDTO(Reservation reservation) {
        ReservationResponseDTO dto = new ReservationResponseDTO();
        dto.setId(reservation.getId());
        dto.setLogementId(reservation.getLogementId());
        dto.setClientId(reservation.getClientId());
        dto.setProprietaireId(reservation.getProprietaireId());
        dto.setDateDebut(reservation.getDateDebut());
        dto.setDateFin(reservation.getDateFin());
        dto.setPrixLogement(reservation.getPrixLogement());
        dto.setMontantReservation(reservation.getMontantReservation());
        dto.setMontantRestant(reservation.getMontantRestant());
        dto.setStatut(reservation.getStatut());
        dto.setPaymentStatut(reservation.getPaymentStatut());
        dto.setMethodepayment(reservation.getMethodepayment());
        dto.setPhoneNumber(reservation.getPhoneNumber());
        dto.setDateCreation(reservation.getDateCreation());
        dto.setDatepayment(reservation.getDatepayment());

        long joursRestants = ChronoUnit.DAYS.between(LocalDate.now(), reservation.getDateFin());
        dto.setJoursRestants(Math.max(0, joursRestants));

        return dto;
    }
}
