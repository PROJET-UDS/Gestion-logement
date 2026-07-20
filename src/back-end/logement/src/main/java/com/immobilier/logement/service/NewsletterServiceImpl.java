package com.immobilier.logement.service;

import com.immobilier.logement.config.RabbitMQConfig;
import com.immobilier.logement.entity.NewsletterSubscription;
import com.immobilier.logement.repository.NewsletterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterServiceImpl implements NewsletterService {

    private final NewsletterRepository newsletterRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public void subscribe(String email) {
        Optional<NewsletterSubscription> existing = newsletterRepository.findByEmail(email);

        if (existing.isPresent()) {
            NewsletterSubscription subscription = existing.get();
            if (!subscription.isActive()) {
                subscription.setActive(true);
                newsletterRepository.save(subscription);
                log.info("Réactivation de l'abonnement newsletter pour : {}", email);
            } else {
                log.info("L'email {} est déjà abonné à la newsletter", email);
            }
            return;
        }

        NewsletterSubscription subscription = NewsletterSubscription.builder()
                .email(email)
                .active(true)
                .build();
        newsletterRepository.save(subscription);
        log.info("Nouvel abonnement newsletter pour : {}", email);

        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.LOGEMENT_EXCHANGE,
                    "newsletter.subscribe",
                    Map.of("email", email)
            );
        } catch (Exception e) {
            log.warn("Impossible de publier l'événement newsletter.subscribe : {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void unsubscribe(String email) {
        Optional<NewsletterSubscription> existing = newsletterRepository.findByEmail(email);

        if (existing.isPresent()) {
            NewsletterSubscription subscription = existing.get();
            subscription.setActive(false);
            newsletterRepository.save(subscription);
            log.info("Désabonnement newsletter pour : {}", email);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSubscribed(String email) {
        return newsletterRepository.existsByEmailAndActiveTrue(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NewsletterSubscription> getAllActiveSubscribers() {
        return newsletterRepository.findByActiveTrue();
    }

    @Override
    @Transactional
    public void sendNotificationToSubscribers(String subject, String content) {
        List<NewsletterSubscription> subscribers = newsletterRepository.findByActiveTrue();
        for (NewsletterSubscription sub : subscribers) {
            try {
                rabbitTemplate.convertAndSend(
                        "gestion-logement.events",
                        "newsletter.requested",
                        Map.of(
                                "email", sub.getEmail(),
                                "name", sub.getEmail(),
                                "subject", subject,
                                "content", content
                        )
                );
            } catch (Exception e) {
                log.warn("Echec envoi newsletter a {} : {}", sub.getEmail(), e.getMessage());
            }
        }
        log.info("Newsletter envoyee a {} abonnes", subscribers.size());
    }
}
