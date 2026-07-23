package com.immobilier.auth.rabbitmq;

import com.immobilier.auth.config.RabbitMQConfig;
import com.immobilier.shared.events.UserRegisteredEvent;
import com.immobilier.shared.events.UserRoleChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserRegistered(String userId, String email, String nom, String role) {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(userId)
                .email(email)
                .nom(nom)
                .role(role)
                .occurredAt(Instant.now())
                .build();

        send(
                RabbitMQConfig.USER_REGISTERED_KEY,
                event,
                "user_registered",
                userId
        );
    }

    public void publishRoleChanged(String userId, String ancienRole, String nouveauRole) {
        UserRoleChangedEvent event = UserRoleChangedEvent.builder()
                .userId(userId)
                .ancienRole(ancienRole)
                .nouveauRole(nouveauRole)
                .occurredAt(Instant.now())
                .build();

        send(
                RabbitMQConfig.USER_ROLE_CHANGED_KEY,
                event,
                "role_changed",
                userId
        );
    }

    private void send(String routingKey, Object event, String eventName, String userId) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.AUTH_EXCHANGE, routingKey, event);
            log.info("Evenement {} publie pour userId={}", eventName, userId);
        } catch (AmqpException ex) {
            // La base auth reste la source de verite. Le service user peut
            // reconstruire le profil depuis le JWT via GET /users/me.
            log.warn(
                    "Evenement {} non publie pour userId={} : RabbitMQ indisponible ({})",
                    eventName,
                    userId,
                    ex.getMessage()
            );
        }
    }
}
