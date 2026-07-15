package com.immobilier.logement.service;

import com.immobilier.logement.config.RabbitMQConfig;
import com.immobilier.logement.dto.LogementRequestDTO;
import com.immobilier.logement.dto.LogementResponseDTO;
import com.immobilier.logement.dto.PrixInsightDTO;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.entity.MediaLogement;
import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.enums.TypeLogement;
import com.immobilier.logement.enums.TypeTransaction;
import com.immobilier.logement.exception.ResourceNotFoundException;
import com.immobilier.logement.mapper.LogementMapper;
import com.immobilier.logement.rabbitmq.LogementEvent;
import com.immobilier.logement.repository.LogementRepository;
import com.immobilier.logement.repository.StatistiquesPrixProjection;
import com.immobilier.logement.specification.LogementSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LogementServiceImpl implements LogementService {

    private final LogementRepository logementRepository;
    private final RabbitTemplate rabbitTemplate;
    private final LogementMapper logementMapper;
    private final AlerteService alerteService;
    private final FavoriHistoriqueService favoriHistoriqueService;

    @Override
    @Transactional
    public LogementResponseDTO creerLogement(LogementRequestDTO requestDTO) {
        Logement logement = logementMapper.toEntity(requestDTO);
        logement.setStatutAnnonce(StatutAnnonce.VALIDE);

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
        return logementRepository.findByStatutAnnonce(StatutAnnonce.VALIDE).stream()
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
}
