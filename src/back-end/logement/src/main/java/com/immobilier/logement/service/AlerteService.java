package com.immobilier.logement.service;

import com.immobilier.logement.config.RabbitMQConfig;
import com.immobilier.logement.dto.NotificationAlerteEvent;
import com.immobilier.logement.entity.Alerte;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.repository.AlerteRepository;
import org.springframework.amqp.core.AmqpTemplate; // Utilise ton outil de message configuré
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AlerteService {

    private final AlerteRepository alerteRepository;
    private final AmqpTemplate amqpTemplate;

    // Spring va injecter automatiquement ton dépôt et ton template RabbitMQ ici
    public AlerteService(AlerteRepository alerteRepository, AmqpTemplate amqpTemplate) {
        this.alerteRepository = alerteRepository;
        this.amqpTemplate = amqpTemplate;
    }

    // Permet d'enregistrer l'alerte d'un utilisateur en BDD
    public Alerte creerAlerte(Alerte alerte) {
        return alerteRepository.save(alerte);
    }

    public void verifierEtDeclencherAlertes(Logement nouveauLogement) {

        // Plus besoin de conversion ! On utilise directement le prix puisqu'il est déjà au bon format.
        // 1. On cherche les alertes qui matchent en BDD
        List<Alerte> alertesTrouvees = alerteRepository.trouverAlertesCorrespondantes(
                nouveauLogement.getVille(),
                nouveauLogement.getPrix(), // <-- ON PASSE DIRECTEMENT LE PRIX ICI
                nouveauLogement.getTypeLogement(),
                nouveauLogement.getTypeTransaction()
        );

        // 2. Pour chaque alerte trouvée, on envoie un message JSON dans RabbitMQ
        for (Alerte alerte : alertesTrouvees) {

            // On prépare le contenu du message
            NotificationAlerteEvent event = NotificationAlerteEvent.builder()
                    .utilisateurId(alerte.getUtilisateurId())
                    .logementId(nouveauLogement.getId())
                    .titreLogement(nouveauLogement.getTitre())
                    .ville(nouveauLogement.getVille())
                    // Si ton DTO "NotificationAlerteEvent" ou "Logement" utilise Double pour le prix dans le builder,
                    // et que tu as besoin d'un double ici, utilise : nouveauLogement.getPrix().doubleValue()
                    .prix(BigDecimal.valueOf(nouveauLogement.getPrix() != null ? nouveauLogement.getPrix().doubleValue() : null))
                    .build();

            // 3. On l'envoie sur TON exchange (logement.exchange) avec TA clé (logement.evenement.cree)
            amqpTemplate.convertAndSend(
                    RabbitMQConfig.LOGEMENT_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_LOGEMENT_CREE,
                    event
            );

            System.out.println("[RabbitMQ] Message envoyé pour l'utilisateur ID: " + alerte.getUtilisateurId());
        }
    }
}