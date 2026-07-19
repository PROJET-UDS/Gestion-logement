package com.immobilier.reservation.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ : déclare l'exchange et les routing keys utilisés
 * pour publier les événements liés aux réservations (création, confirmation, annulation).
 * Les autres microservices (payment, messagerie) pourront s'abonner à ces événements.
 */
@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_RESERVATION = "reservation.exchange";
    public static final String ROUTING_KEY_CREEE = "reservation.creee";
    public static final String ROUTING_KEY_CONFIRMEE = "reservation.confirmee";
    public static final String ROUTING_KEY_ANNULEE = "reservation.annulee";

    @Bean
    public TopicExchange reservationExchange() {
        return new TopicExchange(EXCHANGE_RESERVATION);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory, MessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }
}

