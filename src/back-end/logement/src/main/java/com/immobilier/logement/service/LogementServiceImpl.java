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
        // 1. Conversion du DTO reçu en entité Logement
        Logement logement = logementMapper.toEntity(requestDTO);

        // 2. Gestion des médias associés (photos, vues 360°)
        if (requestDTO.getMedias() != null) {
            List<MediaLogement> medias = requestDTO.getMedias().stream()
                    .map(dto -> MediaLogement.builder()
                            .fileUrl(dto.getFileUrl())
                            .is360View(dto.is360View())
                            .logement(logement)
                            .build())
                    .collect(Collectors.toList());
            logement.setMedias(medias);
        }

        // 3. Sauvegarde définitive du logement en Base de Données
        Logement sauvegarde = logementRepository.save(logement);

        // ====================================================================
        // AJOUT : Vérification et déclenchement des alertes utilisateurs
        // ====================================================================
        try {
            alerteService.verifierEtDeclencherAlertes(sauvegarde);
        } catch (Exception e) {
            System.err.println("[ERREUR ALERTE] Impossible de vérifier les alertes : " + e.getMessage());
        }

        // 4. Publication de ton événement RabbitMQ existant
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

        // 5. Retour du résultat converti en DTO de réponse
        return logementMapper.toResponseDTO(sauvegarde);
    }

    // Version classique : appelée par les routes anonymes ou de recherche générale
    @Override
    @Transactional(readOnly = true)
    public LogementResponseDTO obtenirLogementParId(Long id) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));
        return logementMapper.toResponseDTO(logement);
    }

    // Version surchargée CORRIGÉE : à appeler si un utilisateur connecté visite le logement
    @Override
    @Transactional
    public LogementResponseDTO obtenirLogementParId(Long id, Long utilisateurIdConnecte) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'id : " + id));

        // Enregistrement automatique dans l'historique de consultation si l'ID utilisateur est fourni
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
        // 1. On appelle notre classe de spécification pour créer le filtre dynamique
        Specification<Logement> spec = LogementSpecification.filterLogements(ville, prixMax, typeLogement, typeTransaction);

        // 2. On exécute la requête en BDD avec la spécification
        List<Logement> logements = logementRepository.findAll(spec);

        // 3. On convertit la liste d'entités en liste de DTOs
        return logements.stream()
                .map(logementMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<LogementResponseDTO> obtenirLogementsProches(Double lat, Double lon, Double rayon) {
        // 1. Si l'utilisateur ne précise pas de rayon, valeur par défaut : 5 kilomètres
        Double rayonRecherche = (rayon != null) ? rayon : 5.0;

        // 2. On appelle le repository avec la formule de Haversine intégrée
        List<Logement> logementsProches = logementRepository.trouverLogementsProches(lat, lon, rayonRecherche);

        // 3. On transforme le résultat en DTO
        return logementsProches.stream()
                .map(logementMapper::toResponseDTO)
                .toList();
    }

    @Override
    public PrixInsightDTO obtenirInsightsPrix(String ville, TypeLogement typeLogement, Double prixPropose) {

        // 1. On va chercher les statistiques calculées par PostgreSQL pour cette zone
        Optional<StatistiquesPrixProjection> depecheStats = logementRepository.obtenirStatistiquesZone(ville, typeLogement.name());

        // Si aucun logement similaire n'existe encore dans cette ville, on renvoie des stats vides
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

        // 2. Génération d'un conseil intelligent basé sur les chiffres du marché
        String conseil = "Votre prix est parfaitement aligné avec la moyenne du marché local.";
        if (prixPropose != null) {
            if (prixPropose > moyen * 1.2) { // Plus de 20% au-dessus de la moyenne
                conseil = "Attention, votre prix est nettement supérieur à la moyenne de la zone (" + String.format("%.0f", moyen) + " FCFA). Vous risquez de mettre du temps à louer/vendre.";
            } else if (prixPropose < moyen * 0.8) { // Plus de 20% en dessous
                conseil = "Excellent ! Votre prix est très compétitif par rapport au marché local. Votre bien sera rapidement sélectionné.";
            }
        }

        // 3. Construction et retour du DTO complet
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
}