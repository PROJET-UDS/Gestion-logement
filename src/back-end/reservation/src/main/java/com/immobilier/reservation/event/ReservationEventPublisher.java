package com.immobilier.reservation.event;

import com.immobilier.reservation.config.RabbitMQConfig;
import com.immobilier.reservation.entity.Reservation;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReservationEventPublisher {

    private final AmqpTemplate amqpTemplate;

    @Autowired
    public ReservationEventPublisher(AmqpTemplate amqpTemplate) {
        this.amqpTemplate = amqpTemplate;
    }

    public void publierReservationCreee(Reservation reservation) {
        ReservationEvent event = toEvent(reservation);
        amqpTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_RESERVATION,
                RabbitMQConfig.ROUTING_KEY_CREEE,
                event
        );
    }

    public void publierReservationConfirmee(Reservation reservation) {
        ReservationEvent event = toEvent(reservation);
        amqpTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_RESERVATION,
                RabbitMQConfig.ROUTING_KEY_CONFIRMEE,
                event
        );
    }

    public void publierReservationAnnulee(Reservation reservation) {
        ReservationEvent event = toEvent(reservation);
        amqpTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_RESERVATION,
                RabbitMQConfig.ROUTING_KEY_ANNULEE,
                event
        );
    }

    private ReservationEvent toEvent(Reservation r) {
        return new ReservationEvent(
                r.getId(),
                r.getLogementId(),
                r.getClientId(),
                r.getDateDebut(),
                r.getDateFin(),
                r.getPrixLogement(),
                r.getMontantReservation(),
                r.getMontantRestant(),
                r.getStatut(),
                r.getPaymentStatut()
        );
    }
}
