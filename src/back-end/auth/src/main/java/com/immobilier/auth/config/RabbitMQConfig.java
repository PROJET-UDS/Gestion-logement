package com.immobilier.auth.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Noms des exchanges
    public static final String AUTH_EXCHANGE = "auth.exchange";

    // Noms des queues
    public static final String USER_REGISTERED_QUEUE = "auth.user.registered";
    public static final String USER_LOGGED_IN_QUEUE = "auth.user.loggedin";

    // Routing keys
    public static final String USER_REGISTERED_KEY = "auth.user.registered";
    public static final String USER_LOGGED_IN_KEY = "auth.user.loggedin";

    // Exchange
    @Bean
    public TopicExchange authExchange() {
        return new TopicExchange(AUTH_EXCHANGE);
    }

    // Queues
    @Bean
    public Queue userRegisteredQueue() {
        return QueueBuilder.durable(USER_REGISTERED_QUEUE).build();
    }

    @Bean
    public Queue userLoggedInQueue() {
        return QueueBuilder.durable(USER_LOGGED_IN_QUEUE).build();
    }

    // Bindings
    @Bean
    public Binding userRegisteredBinding() {
        return BindingBuilder
                .bind(userRegisteredQueue())
                .to(authExchange())
                .with(USER_REGISTERED_KEY);
    }

    @Bean
    public Binding userLoggedInBinding() {
        return BindingBuilder
                .bind(userLoggedInQueue())
                .to(authExchange())
                .with(USER_LOGGED_IN_KEY);
    }

    // Convertisseur JSON
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // Template avec convertisseur JSON
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}