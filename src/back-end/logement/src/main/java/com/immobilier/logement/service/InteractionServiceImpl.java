package com.immobilier.logement.service;

import com.immobilier.logement.entity.Avis;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.entity.Signalement;
import com.immobilier.logement.enums.MotifSignalement;
import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.exception.ResourceNotFoundException;
import com.immobilier.logement.repository.AvisRepository;
import com.immobilier.logement.repository.LogementRepository;
import com.immobilier.logement.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionServiceImpl implements InteractionService {

    private final AvisRepository avisRepository;
    private final SignalementRepository signalementRepository;
    private final LogementRepository logementRepository;
    private final RabbitTemplate rabbitTemplate;

    // Nom de l'échange RabbitMQ pour les alertes de modération
    private static final String EXCHANGE_MODERATION = "moderation.exchange";
    private static final String ROUTING_KEY_FRAUDE = "moderation.fraude.alert";

    @Override
    @Transactional
    public Avis ajouterAvis(Long logementId, Long utilisateurId, String nomUtilisateur, Integer note, String commentaire) {
        if (note < 1 || note > 5) {
            throw new IllegalArgumentException("La note doit être comprise entre 1 et 5.");
        }

        Logement logement = logementRepository.findById(logementId)
                .orElseThrow(() -> new ResourceNotFoundException("Logement non trouvé avec l'id : " + logementId));

        Avis avis = Avis.builder()
                .logement(logement)
                .utilisateurId(utilisateurId)
                .nomUtilisateur(nomUtilisateur)
                .note(note)
                .commentaire(commentaire)
                .build();

        Avis avisSauvegarde = avisRepository.save(avis);

        // RECALCUL AUTOMATIQUE DE LA NOTE MOYENNE
        Double nouvelleMoyenne = avisRepository.findAverageNoteByLogementId(logementId);
        logement.setNoteMoyenne(nouvelleMoyenne != null ? nouvelleMoyenne : 0.0);
        logementRepository.save(logement);

        log.info("Nouvelle note moyenne pour le logement {} : {}", logementId, logement.getNoteMoyenne());
        return avisSauvegarde;
    }

    @Override
    public Page<Avis> obtenirAvisParLogement(Long logementId, Pageable pageable) {
        return avisRepository.findByLogementIdOrderByDateCreationDesc(logementId, pageable);
    }

    @Override
    @Transactional
    public Signalement signalerLogement(Long logementId, Long utilisateurId, MotifSignalement motif, String description) {
        Logement logement = logementRepository.findById(logementId)
                .orElseThrow(() -> new ResourceNotFoundException("Logement non trouvé avec l'id : " + logementId));

        Signalement signalement = Signalement.builder()
                .logement(logement)
                .utilisateurId(utilisateurId)
                .motif(motif)
                .description(description)
                .build();

        Signalement signalementSauvegarde = signalementRepository.save(signalement);

        // MODÉRATION AUTOMATIQUE : Vérifier le nombre total de plaintes
        long totalSignalements = signalementRepository.countByLogementId(logementId);
        log.warn("Le logement id {} a été signalé {} fois.", logementId, totalSignalements);

        if (totalSignalements > 3 && logement.getStatutAnnonce() != StatutAnnonce.SUSPENDU) {
            // 1. On suspend immédiatement le logement pour protéger les étudiants
            logement.setStatutAnnonce(StatutAnnonce.SUSPENDU);
            logementRepository.save(logement);
            log.error("Logement {} automatiquement SUSPENDU pour accumulation de fraudes.", logementId);

            // 2. On envoie une alerte asynchrone dans RabbitMQ pour l'équipe admin / service notification
            String messageAlerte = String.format(
                    "{\"logementId\": %d, \"totalSignalements\": %d, \"motifDernier\": \"%s\", \"statut\": \"SUSPENDU\"}",
                    logementId, totalSignalements, motif.name()
            );

            try {
                rabbitTemplate.convertAndSend(EXCHANGE_MODERATION, ROUTING_KEY_FRAUDE, messageAlerte);
                log.info("Message d'alerte fraude envoyé à RabbitMQ pour le logement {}", logementId);
            } catch (Exception e) {
                log.error("Échec de l'envoi du message de modération dans RabbitMQ", e);
            }
        }

        return signalementSauvegarde;
    }
}