package com.immobilier.messagerie.listener;

import com.immobilier.messagerie.config.RabbitMQConfig;
import com.immobilier.messagerie.repository.EmailHistoryRepository;
import com.immobilier.messagerie.service.EmailSenderService;
import com.immobilier.messagerie.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventListener {

    private final EmailSenderService emailSenderService;
    private final EmailTemplateService emailTemplateService;
    private final EmailHistoryRepository emailHistoryRepository;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void handleEmailEvent(Map<String, Object> event, Message message) {
        String routingKey = message.getMessageProperties().getReceivedRoutingKey();
        String eventId = extractEventId(event, message);

        log.info("Evenement recu [routingKey={}, eventId={}]", routingKey, eventId);

        // Idempotency check
        if (eventId != null && emailHistoryRepository.existsByEventId(eventId)) {
            log.warn("Evenement deja traite, ignorer [eventId={}]", eventId);
            return;
        }

        try {
            String emailType = mapRoutingKeyToEmailType(routingKey);
            String recipient = extractRecipient(event);

            if (recipient == null || recipient.isBlank()) {
                log.error("Pas de destinataire dans l'evenement [eventId={}, routingKey={}]", eventId, routingKey);
                return;
            }

            String subject = emailTemplateService.getSubject(emailType, event);
            String htmlBody = emailTemplateService.generateHtml(emailType, event);
            String correlationId = extractCorrelationId(event, message);

            emailSenderService.sendEmail(recipient, subject, htmlBody, eventId, correlationId, emailType);

        } catch (Exception e) {
            log.error("Erreur lors du traitement de l'evenement [eventId={}, routingKey={}]: {}",
                    eventId, routingKey, e.getMessage(), e);
            throw new RuntimeException("Echec du traitement de l'evenement email", e);
        }
    }

    private String mapRoutingKeyToEmailType(String routingKey) {
        if (routingKey == null) return "generic";
        return switch (routingKey) {
            case RabbitMQConfig.RK_USER_REGISTERED -> "welcome";
            case RabbitMQConfig.RK_USER_PASSWORD_RESET -> "password_reset";
            case RabbitMQConfig.RK_LOGEMENT_SUBMITTED -> "logement_submitted";
            case RabbitMQConfig.RK_LOGEMENT_APPROVED -> "logement_approved";
            case RabbitMQConfig.RK_LOGEMENT_REJECTED -> "logement_rejected";
            case RabbitMQConfig.RK_RESERVATION_CREATED -> "reservation_created";
            case RabbitMQConfig.RK_RESERVATION_CONFIRMED -> "reservation_confirmed";
            case RabbitMQConfig.RK_PAYMENT_SUCCEEDED -> "payment_succeeded";
            case RabbitMQConfig.RK_PAYMENT_FAILED -> "payment_failed";
            case RabbitMQConfig.RK_REVIEW_CREATED -> "review_created";
            case RabbitMQConfig.RK_CONTACT_OWNER -> "contact_owner";
            case RabbitMQConfig.RK_NEWSLETTER -> "newsletter";
            default -> "generic";
        };
    }

    private String extractRecipient(Map<String, Object> event) {
        // Try common field names for recipient email
        if (event.containsKey("email")) {
            return event.get("email").toString();
        }
        if (event.containsKey("recipient")) {
            return event.get("recipient").toString();
        }
        if (event.containsKey("recipientEmail")) {
            return event.get("recipientEmail").toString();
        }
        if (event.containsKey("to")) {
            return event.get("to").toString();
        }
        return null;
    }

    private String extractEventId(Map<String, Object> event, Message message) {
        // Try from event payload first
        if (event.containsKey("eventId")) {
            return event.get("eventId").toString();
        }
        // Try from message properties
        String messageId = message.getMessageProperties().getMessageId();
        if (messageId != null && !messageId.isBlank()) {
            return messageId;
        }
        // Generate a unique one as fallback
        return UUID.randomUUID().toString();
    }

    private String extractCorrelationId(Map<String, Object> event, Message message) {
        if (event.containsKey("correlationId")) {
            return event.get("correlationId").toString();
        }
        String correlationId = message.getMessageProperties().getCorrelationId();
        return correlationId != null ? correlationId : null;
    }
}
