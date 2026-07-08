package com.immobilier.user.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String AUTH_EXCHANGE = "auth.exchange";

    public static final String USER_REGISTERED_KEY = "auth.user.registered";
    public static final String USER_ROLE_CHANGED_KEY = "auth.user.role.changed";

    public static final String USER_REGISTERED_QUEUE = "auth.user.registered";
    public static final String USER_ROLE_CHANGED_QUEUE = "auth.user.role.changed";

    @Bean
    public TopicExchange authExchange() {
        return new TopicExchange(AUTH_EXCHANGE);
    }

    @Bean
    public Queue userRegisteredQueue() {
        return QueueBuilder.durable(USER_REGISTERED_QUEUE).build();
    }

    @Bean
    public Queue userRoleChangedQueue() {
        return QueueBuilder.durable(USER_ROLE_CHANGED_QUEUE).build();
    }

    @Bean
    public Binding userRegisteredBinding() {
        return BindingBuilder
                .bind(userRegisteredQueue())
                .to(authExchange())
                .with(USER_REGISTERED_KEY);
    }

    @Bean
    public Binding userRoleChangedBinding() {
        return BindingBuilder
                .bind(userRoleChangedQueue())
                .to(authExchange())
                .with(USER_ROLE_CHANGED_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
