package com.immobilier.paiement.rabbitmq;

import com.immobilier.paiement.entity.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishPaymentEvent(PaymentEventDTO event) {
        String routingKey = determineRoutingKey(event.getStatus());
        log.info("Publication d'un evenement payment [{}] : {}", routingKey, event.getTransactionRef());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.PAYMENT_EXCHANGE,
                routingKey,
                event
        );
        log.info("Evenement publie avec succes pour le payment : {}", event.getPaymentId());
    }

    private String determineRoutingKey(PaymentStatus status) {
        if (status == PaymentStatus.SUCCESS) {
            return RabbitMQConfig.PAYMENT_SUCCEEDED_ROUTING_KEY;
        } else if (status == PaymentStatus.FAILED) {
            return RabbitMQConfig.PAYMENT_FAILED_ROUTING_KEY;
        }
        return RabbitMQConfig.PAYMENT_ROUTING_KEY;
    }
}