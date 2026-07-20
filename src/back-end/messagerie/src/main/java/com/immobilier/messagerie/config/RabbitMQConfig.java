package com.immobilier.messagerie.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "gestion-logement.events";
    public static final String EMAIL_QUEUE = "messagerie.email.queue";
    public static final String DLX_EXCHANGE = "messagerie.dlx";
    public static final String DLQ_QUEUE = "messagerie.dlq";

    // Routing keys
    public static final String RK_USER_REGISTERED = "user.registered";
    public static final String RK_USER_PASSWORD_RESET = "user.password.reset.requested";
    public static final String RK_LOGEMENT_SUBMITTED = "logement.submitted";
    public static final String RK_LOGEMENT_APPROVED = "logement.approved";
    public static final String RK_LOGEMENT_REJECTED = "logement.rejected";
    public static final String RK_RESERVATION_CREATED = "reservation.created";
    public static final String RK_RESERVATION_CONFIRMED = "reservation.confirmed";
    public static final String RK_PAYMENT_SUCCEEDED = "payment.succeeded";
    public static final String RK_PAYMENT_FAILED = "payment.failed";
    public static final String RK_REVIEW_CREATED = "review.created";
    public static final String RK_CONTACT_OWNER = "contact.owner.requested";
    public static final String RK_NEWSLETTER = "newsletter.requested";

    // --- Main exchange ---
    @Bean
    public TopicExchange eventsExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE_NAME)
                .durable(true)
                .build();
    }

    // --- Dead Letter Exchange & Queue ---
    @Bean
    public DirectExchange deadLetterExchange() {
        return ExchangeBuilder.directExchange(DLX_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ_QUEUE).build();
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue())
                .to(deadLetterExchange())
                .with("dead-letter");
    }

    // --- Email Queue with DLX ---
    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "dead-letter")
                .build();
    }

    // --- Bindings ---
    @Bean
    public Binding bindingUserRegistered() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_USER_REGISTERED);
    }

    @Bean
    public Binding bindingPasswordReset() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_USER_PASSWORD_RESET);
    }

    @Bean
    public Binding bindingLogementSubmitted() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_LOGEMENT_SUBMITTED);
    }

    @Bean
    public Binding bindingLogementApproved() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_LOGEMENT_APPROVED);
    }

    @Bean
    public Binding bindingLogementRejected() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_LOGEMENT_REJECTED);
    }

    @Bean
    public Binding bindingReservationCreated() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_RESERVATION_CREATED);
    }

    @Bean
    public Binding bindingReservationConfirmed() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_RESERVATION_CONFIRMED);
    }

    @Bean
    public Binding bindingPaymentSucceeded() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_PAYMENT_SUCCEEDED);
    }

    @Bean
    public Binding bindingPaymentFailed() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_PAYMENT_FAILED);
    }

    @Bean
    public Binding bindingReviewCreated() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_REVIEW_CREATED);
    }

    @Bean
    public Binding bindingContactOwner() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_CONTACT_OWNER);
    }

    @Bean
    public Binding bindingNewsletter() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(RK_NEWSLETTER);
    }

    // --- Message Converter ---
    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // --- Retry Template ---
    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();

        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);
        retryTemplate.setRetryPolicy(retryPolicy);

        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(1000);
        backOffPolicy.setMultiplier(2.0);
        backOffPolicy.setMaxInterval(10000);
        retryTemplate.setBackOffPolicy(backOffPolicy);

        return retryTemplate;
    }

    // --- Listener Container Factory with retry ---
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jackson2JsonMessageConverter());
        factory.setAdviceChain(
                RetryInterceptorBuilder.stateless()
                        .retryPolicy(new SimpleRetryPolicy(3))
                        .backOffPolicy(createBackOffPolicy())
                        .recoverer(new RejectAndDontRequeueRecoverer())
                        .build()
        );
        return factory;
    }

    private ExponentialBackOffPolicy createBackOffPolicy() {
        ExponentialBackOffPolicy policy = new ExponentialBackOffPolicy();
        policy.setInitialInterval(1000);
        policy.setMultiplier(2.0);
        policy.setMaxInterval(10000);
        return policy;
    }
}
