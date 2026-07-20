package com.immobilier.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String EVENTS_EXCHANGE = "gestion-logement.events";
    private static final String RK_PASSWORD_RESET = "user.password.reset.requested";

    private final RabbitTemplate rabbitTemplate;

    @Async
    public void envoyerCodeRecuperation(String destinataire, String code) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("email", destinataire);
        event.put("code", code);
        event.put("name", destinataire);

        rabbitTemplate.convertAndSend(EVENTS_EXCHANGE, RK_PASSWORD_RESET, event);
        log.info("Evenement password_reset publie pour {}", destinataire);
    }
}
