package com.immobilier.logement.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String LOGEMENT_EXCHANGE = "logement.exchange";
    public static final String QUEUE_LOGEMENT_CREE = "logement.cree.queue";
    public static final String ROUTING_KEY_LOGEMENT_CREE = "logement.evenement.cree";

    @Bean
    public TopicExchange logementExchange() {
        return new TopicExchange(LOGEMENT_EXCHANGE);
    }

    @Bean
    public Queue queueLogementCree() {
        return new Queue(QUEUE_LOGEMENT_CREE, true);
    }

    @Bean
    public Binding bindingLogementCree(Queue queueLogementCree, TopicExchange logementExchange) {
        return BindingBuilder.bind(queueLogementCree).to(logementExchange).with(ROUTING_KEY_LOGEMENT_CREE);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter());
        return rabbitTemplate;
    }
}