package com.immobilier.logement.service;

import com.immobilier.logement.config.RabbitMQConfig;
import com.immobilier.logement.dto.LogementRequestDTO;
import com.immobilier.logement.dto.LogementResponseDTO;
import com.immobilier.logement.dto.PrixInsightDTO;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.entity.MediaLogement;
import com.immobilier.logement.entity.ValidationHistory;
import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import com.immobilier.logement.exception.ResourceNotFoundException;
import com.immobilier.logement.mapper.LogementMapper;
import com.immobilier.logement.rabbitmq.LogementEvent;
import com.immobilier.logement.repository.LogementRepository;
import com.immobilier.logement.repository.StatistiquesPrixProjection;
import com.immobilier.logement.repository.ValidationHistoryRepository;
import com.immobilier.logement.specification.LogementSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogementServiceImpl implements LogementService {

    private final LogementRepository logementRepository;
    private final RabbitTemplate rabbitTemplate;
    private final LogementMapper logementMapper;
    private final AlerteService alerteService;
    private final FavoriHistoriqueService favoriHistoriqueService;
    private final ValidationHistoryRepository validationHistoryRepository;

    @Override
    @Transactional
    public LogementResponseDTO creerLogement(LogementRequestDTO requestDTO) {
        Logement logement = logementMapper.toEntity(requestDTO);
        logement.setStatutAnnonce(StatutAnnonce.EN_ATTENTE_VALIDATION);

        if (requestDTO.getMedias() != null) {
            List<MediaLogement> medias = requestDTO.getMedias().stream()
                    .map(dto -> MediaLogement.builder()
                            .fileUrl(dto.getFileUrl())
                            .mediaType(dto.getMediaType())
                            .is360View(dto.is360View())
                            .logement(logement)
                            .build())
                    .collect(Collectors.toList());
            logement.setMedias(medias);
        }

        Logement sauvegarde = logementRepository.save(logement);

        try {
            alerteService.verifierEtDeclencherAlertes(sauvegarde);
        } catch (Exception e) {
            System.err.println("[ERREUR ALERTE] Impossible de vérifier les alertes : " + e.getMessage());
        }

        try {
            LogementEvent event = new LogementEvent(
                    sauvegarde.getId(),
                    sauvegarde.getTitre(),
                    sauvegarde.getPrix(),
                    sauvegarde.getTypeTransaction(),
                    sauvegarde.getProprietaireId()
            );
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.LOGEMENT_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_LOGEMENT_CREE,
                    event
            );
        } catch (Exception e) {
            log.warn("Echec publication evenement RabbitMQ pour logement {}: {}", sauvegarde.getId(), e.getMessage());
        }

        return logementMapper.toResponseDTO(sauvegarde);
    }

    @Override
    @Transactional(readOnly = true)
    public LogementResponseDTO obtenirLogementParId(Long id) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));
        return logementMapper.toResponseDTO(logement);
    }

    @Override
    @Transactional
    public LogementResponseDTO obtenirLogementParId(Long id, String utilisateurIdConnecte) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (utilisateurIdConnecte != null) {
            favoriHistoriqueService.enregistrerConsultation(utilisateurIdConnecte, id);
        }
        return logementMapper.toResponseDTO(logement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LogementResponseDTO> obtenirTousLesLogementsValides() {
        return logementRepository.findBySupprimeFalseOrSupprimeIsNull().stream()
                .filter(l -> l.getStatutAnnonce() == StatutAnnonce.PUBLIEE
                        || l.getStatutAnnonce() == StatutAnnonce.VALIDE
                        || l.getStatutAnnonce() == StatutAnnonce.VALIDEE)
                .map(logementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LogementResponseDTO changerStatutAnnonce(Long id, StatutAnnonce statut) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));
        logement.setStatutAnnonce(statut);
        return logementMapper.toResponseDTO(logementRepository.save(logement));
    }

    @Override
    public List<LogementResponseDTO> rechercherLogements(String ville, Double prixMax, TypeLogement typeLogement, TypeTransaction typeTransaction) {
        Specification<Logement> spec = LogementSpecification.filterLogements(ville, prixMax, typeLogement, typeTransaction);
        List<Logement> logements = logementRepository.findAll(spec);
        return logements.stream()
                .map(logementMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<LogementResponseDTO> obtenirLogementsProches(Double lat, Double lon, Double rayon) {
        Double rayonRecherche = (rayon != null) ? rayon : 5.0;
        List<Logement> logementsProches = logementRepository.trouverLogementsProches(lat, lon, rayonRecherche);
        return logementsProches.stream()
                .map(logementMapper::toResponseDTO)
                .toList();
    }

    @Override
    public PrixInsightDTO obtenirInsightsPrix(String ville, TypeLogement typeLogement, Double prixPropose) {
        Optional<StatistiquesPrixProjection> depecheStats = logementRepository.obtenirStatistiquesZone(ville, typeLogement.name());

        if (depecheStats.isEmpty()) {
            return PrixInsightDTO.builder()
                    .ville(ville)
                    .typeLogement(typeLogement.name())
                    .totalLogementsSimilaires(0L)
                    .conseilPositionnement("Aucune donnée disponible pour cette zone. Soyez le premier à fixer la tendance !")
                    .build();
        }

        StatistiquesPrixProjection stats = depecheStats.get();
        Double moyen = stats.getPrixMoyen();

        String conseil = "Votre prix est parfaitement aligné avec la moyenne du marché local.";
        if (prixPropose != null) {
            if (prixPropose > moyen * 1.2) {
                conseil = "Attention, votre prix est nettement supérieur à la moyenne de la zone (" + String.format("%.0f", moyen) + " FCFA). Vous risquez de mettre du temps à louer/vendre.";
            } else if (prixPropose < moyen * 0.8) {
                conseil = "Excellent ! Votre prix est très compétitif par rapport au marché local. Votre bien sera rapidement sélectionné.";
            }
        }

        return PrixInsightDTO.builder()
                .ville(stats.getVille())
                .typeLogement(stats.getTypeLogement())
                .totalLogementsSimilaires(stats.getTotalLogements())
                .prixMoyen(moyen)
                .prixMinimum(stats.getPrixMin())
                .prixMaximum(stats.getPrixMax())
                .conseilPositionnement(conseil)
                .build();
    }

    @Override
    public List<LogementResponseDTO> obtenirLogementsParProprietaire(String proprietaireId) {
        return logementRepository.findByProprietaireId(proprietaireId).stream()
                .filter(l -> !Boolean.TRUE.equals(l.getSupprime()))
                .map(logementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LogementResponseDTO soumettreAValidation(Long id, String proprietaireId) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (!logement.getProprietaireId().equals(proprietaireId)) {
            throw new IllegalStateException("Seul le propriétaire peut soumettre son logement à validation");
        }

        if (logement.getStatutAnnonce() != StatutAnnonce.BROUILLON
                && logement.getStatutAnnonce() != StatutAnnonce.REJETEE) {
            throw new IllegalStateException("Le logement doit être en brouillon ou rejeté pour être soumis");
        }

        logement.setStatutAnnonce(StatutAnnonce.EN_ATTENTE_VALIDATION);
        Logement sauvegarde = logementRepository.save(logement);

        LogementEvent event = new LogementEvent(
                sauvegarde.getId(),
                sauvegarde.getTitre(),
                sauvegarde.getPrix(),
                sauvegarde.getTypeTransaction(),
                sauvegarde.getProprietaireId()
        );
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.LOGEMENT_EXCHANGE,
                "logement.soumis",
                event
        );

        log.info("Logement {} soumis à validation par {}", id, proprietaireId);
        return logementMapper.toResponseDTO(sauvegarde);
    }

    @Override
    @Transactional
    public LogementResponseDTO validerLogement(Long id, String adminId) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (logement.getStatutAnnonce() != StatutAnnonce.EN_ATTENTE_VALIDATION) {
            throw new IllegalStateException("Le logement doit être en attente de validation");
        }

        logement.setStatutAnnonce(StatutAnnonce.PUBLIEE);
        Logement sauvegarde = logementRepository.save(logement);

        ValidationHistory history = ValidationHistory.builder()
                .logementId(id)
                .adminId(adminId)
                .decision(StatutAnnonce.PUBLIEE)
                .correlationId(UUID.randomUUID().toString())
                .build();
        validationHistoryRepository.save(history);

        LogementEvent event = new LogementEvent(
                sauvegarde.getId(),
                sauvegarde.getTitre(),
                sauvegarde.getPrix(),
                sauvegarde.getTypeTransaction(),
                sauvegarde.getProprietaireId()
        );
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.LOGEMENT_EXCHANGE,
                "logement.valide",
                event
        );

        log.info("Logement {} validé par admin {}", id, adminId);
        return logementMapper.toResponseDTO(sauvegarde);
    }

    @Override
    @Transactional
    public LogementResponseDTO rejeterLogement(Long id, String adminId, String motif) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (logement.getStatutAnnonce() != StatutAnnonce.EN_ATTENTE_VALIDATION) {
            throw new IllegalStateException("Le logement doit être en attente de validation");
        }

        if (motif == null || motif.isBlank()) {
            throw new IllegalArgumentException("Le motif de rejet est obligatoire");
        }

        logement.setStatutAnnonce(StatutAnnonce.REJETEE);
        Logement sauvegarde = logementRepository.save(logement);

        ValidationHistory history = ValidationHistory.builder()
                .logementId(id)
                .adminId(adminId)
                .decision(StatutAnnonce.REJETEE)
                .motif(motif)
                .correlationId(UUID.randomUUID().toString())
                .build();
        validationHistoryRepository.save(history);

        log.info("Logement {} rejeté par admin {} - motif: {}", id, adminId, motif);
        return logementMapper.toResponseDTO(sauvegarde);
    }

    @Override
    @Transactional
    public LogementResponseDTO archiverLogement(Long id, String proprietaireId) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (!logement.getProprietaireId().equals(proprietaireId)) {
            throw new IllegalStateException("Seul le propriétaire peut archiver son logement");
        }

        logement.setStatutAnnonce(StatutAnnonce.ARCHIVEE);
        Logement sauvegarde = logementRepository.save(logement);

        log.info("Logement {} archivé par {}", id, proprietaireId);
        return logementMapper.toResponseDTO(sauvegarde);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LogementResponseDTO> obtenirLogementsEnAttenteValidation() {
        return logementRepository.findByStatutAnnonce(StatutAnnonce.EN_ATTENTE_VALIDATION).stream()
                .map(logementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LogementResponseDTO> obtenirLogementsPublies() {
        return logementRepository.findByStatutAnnonce(StatutAnnonce.PUBLIEE).stream()
                .filter(l -> !Boolean.TRUE.equals(l.getSupprime()))
                .map(logementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LogementResponseDTO modifierLogement(Long id, LogementRequestDTO requestDTO, String proprietaireId) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (!logement.getProprietaireId().equals(proprietaireId)) {
            throw new IllegalStateException("Seul le propriétaire peut modifier ce logement");
        }

        logement.setTitre(requestDTO.getTitre());
        logement.setDescription(requestDTO.getDescription());
        logement.setPrix(requestDTO.getPrix());
        logement.setAdresse(requestDTO.getAdresse());
        logement.setVille(requestDTO.getVille());
        logement.setQuartier(requestDTO.getQuartier());
        logement.setTypeLogement(requestDTO.getTypeLogement());
        logement.setTypeTransaction(requestDTO.getTypeTransaction());
        logement.setCharges(requestDTO.getCharges());
        logement.setNbPieces(requestDTO.getNbPieces());
        logement.setSuperficie(requestDTO.getSuperficie());
        logement.setEquipements(requestDTO.getEquipements());
        logement.setLatitude(requestDTO.getLatitude());
        logement.setLongitude(requestDTO.getLongitude());

        Logement sauvegarde = logementRepository.save(logement);
        log.info("Logement {} modifié par {}", id, proprietaireId);
        return logementMapper.toResponseDTO(sauvegarde);
    }

    @Override
    @Transactional
    public void supprimerLogement(Long id, String proprietaireId) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        if (!logement.getProprietaireId().equals(proprietaireId)) {
            throw new IllegalStateException("Seul le propriétaire peut supprimer ce logement");
        }

        logement.setSupprime(true);
        logement.setDateSuppression(java.time.LocalDateTime.now());
        logementRepository.save(logement);
        log.info("Logement {} supprimé (soft delete) par {}", id, proprietaireId);
    }
}
