package com.immobilier.auth.rabbitmq;

import com.immobilier.auth.config.RabbitMQConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpConnectException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.net.ConnectException;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;

@ExtendWith(MockitoExtension.class)
class AuthEventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private AuthEventPublisher authEventPublisher;

    @Test
    void rabbitOutageDoesNotBreakRegistration() {
        doThrow(new AmqpConnectException(new ConnectException("RabbitMQ indisponible")))
                .when(rabbitTemplate)
                .convertAndSend(
                        eq(RabbitMQConfig.AUTH_EXCHANGE),
                        eq(RabbitMQConfig.USER_REGISTERED_KEY),
                        any(Object.class)
                );

        assertThatCode(() -> authEventPublisher.publishUserRegistered(
                "user-1",
                "client@example.com",
                "Client Test",
                "CLIENT"
        )).doesNotThrowAnyException();
    }
}
