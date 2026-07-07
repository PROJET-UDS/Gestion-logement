package com.immobilier.auth.messaging;

import com.immobilier.auth.config.RabbitMQConfig;
import com.immobilier.shared.events.UserRoleChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishRoleChanged(String userId, String ancienRole, String nouveauRole) {
        UserRoleChangedEvent event = UserRoleChangedEvent.builder()
                .userId(userId)
                .ancienRole(ancienRole)
                .nouveauRole(nouveauRole)
                .occurredAt(Instant.now())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.AUTH_EXCHANGE,
                RabbitMQConfig.USER_ROLE_CHANGED_KEY,
                event
        );

        log.info("Événement role_changed publié pour userId={}", userId);
    }
}