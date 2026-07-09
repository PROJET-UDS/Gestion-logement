package com.immobilier.user.rabbitmq;

import com.immobilier.shared.events.UserRegisteredEvent;
import com.immobilier.shared.events.UserRoleChangedEvent;
import com.immobilier.user.config.RabbitMQConfig;
import com.immobilier.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthEventListener {

    private final UserProfileService userProfileService;

    @RabbitListener(queues = RabbitMQConfig.USER_REGISTERED_QUEUE)
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Evenement recu : utilisateur enregistre {}", event.getEmail());
        userProfileService.createOrUpdateFromRegistration(event);
    }

    @RabbitListener(queues = RabbitMQConfig.USER_ROLE_CHANGED_QUEUE)
    public void handleUserRoleChanged(UserRoleChangedEvent event) {
        log.info("Evenement recu : role utilisateur modifie {}", event.getUserId());
        userProfileService.updateRoleFromEvent(event);
    }
}
