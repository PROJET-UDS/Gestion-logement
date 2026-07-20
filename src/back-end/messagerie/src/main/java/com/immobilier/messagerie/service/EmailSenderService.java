package com.immobilier.messagerie.service;

import com.immobilier.messagerie.entity.EmailHistory;
import com.immobilier.messagerie.entity.EmailStatus;
import com.immobilier.messagerie.repository.EmailHistoryRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailSenderService {

    private final JavaMailSender mailSender;
    private final EmailHistoryRepository emailHistoryRepository;

    private static final String FROM_ADDRESS = "noreply@gestion-logement.com";

    /**
     * Send an email and record it in the history.
     *
     * @param recipient  the email recipient
     * @param subject    the email subject
     * @param htmlBody   the HTML content of the email
     * @param eventId    the unique event ID for idempotency
     * @param correlationId optional correlation ID
     * @param emailType  the type of email (for tracking)
     */
    public void sendEmail(String recipient, String subject, String htmlBody,
                          String eventId, String correlationId, String emailType) {

        EmailHistory history = EmailHistory.builder()
                .eventId(eventId)
                .correlationId(correlationId)
                .recipient(recipient)
                .emailType(emailType)
                .subject(subject)
                .status(EmailStatus.EN_COURS)
                .createdAt(Instant.now())
                .build();

        history = emailHistoryRepository.save(history);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);

            history.setStatus(EmailStatus.ENVOYE);
            history.setSentAt(Instant.now());
            history.setAttempts(history.getAttempts() + 1);

            log.info("Email envoye avec succes a {} [type={}, eventId={}]", recipient, emailType, eventId);

        } catch (MessagingException e) {
            history.setStatus(EmailStatus.ECHOUE);
            history.setAttempts(history.getAttempts() + 1);
            history.setErrorMessage(truncateMessage(e.getMessage()));

            log.error("Echec d'envoi d'email a {} [type={}, eventId={}]: {}",
                    recipient, emailType, eventId, e.getMessage());

        } catch (Exception e) {
            history.setStatus(EmailStatus.ECHOUE);
            history.setAttempts(history.getAttempts() + 1);
            history.setErrorMessage(truncateMessage(e.getMessage()));

            log.error("Erreur inattendue lors de l'envoi d'email a {} [type={}, eventId={}]: {}",
                    recipient, emailType, eventId, e.getMessage());
        } finally {
            emailHistoryRepository.save(history);
        }
    }

    private String truncateMessage(String message) {
        if (message == null) return "Erreur inconnue";
        return message.length() > 1900 ? message.substring(0, 1900) : message;
    }
}
