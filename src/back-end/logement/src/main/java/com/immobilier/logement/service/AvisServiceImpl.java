package com.immobilier.logement.service;

import com.immobilier.logement.config.RabbitMQConfig;
import com.immobilier.logement.dto.AvisRequestDTO;
import com.immobilier.logement.dto.AvisResponseDTO;
import com.immobilier.logement.entity.Avis;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.exception.ResourceNotFoundException;
import com.immobilier.logement.repository.AvisRepository;
import com.immobilier.logement.repository.LogementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvisServiceImpl implements AvisService {

    private final AvisRepository avisRepository;
    private final LogementRepository logementRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public AvisResponseDTO creerAvis(AvisRequestDTO dto, String utilisateurId, String nomUtilisateur) {
        Logement logement = logementRepository.findById(dto.getLogementId())
                .orElseThrow(() -> new ResourceNotFoundException("Logement non trouvé avec l'id : " + dto.getLogementId()));

        Avis avis = Avis.builder()
                .logement(logement)
                .utilisateurId(utilisateurId)
                .nomUtilisateur(nomUtilisateur)
                .note(dto.getNote())
                .commentaire(dto.getCommentaire())
                .build();

        Avis saved = avisRepository.save(avis);
        log.info("Avis créé avec succès pour le logement {} par l'utilisateur {}", dto.getLogementId(), utilisateurId);

        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.LOGEMENT_EXCHANGE,
                    "avis.cree",
                    Map.of(
                            "avisId", saved.getId(),
                            "logementId", logement.getId(),
                            "utilisateurId", utilisateurId,
                            "note", saved.getNote()
                    )
            );
        } catch (Exception e) {
            log.warn("Impossible de publier l'événement avis.cree : {}", e.getMessage());
        }

        return toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AvisResponseDTO> obtenirAvisParLogement(Long logementId, int page, int taille) {
        Pageable pageable = PageRequest.of(page, taille);
        Page<Avis> avisPage = avisRepository.findByLogementIdOrderByDateCreationDesc(logementId, pageable);
        return avisPage.map(this::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Double obtenirNoteMoyenne(Long logementId) {
        return avisRepository.findAverageNoteByLogementId(logementId);
    }

    @Override
    @Transactional
    public void supprimerAvis(Long id, String utilisateurId, String userRole) {
        Avis avis = avisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé avec l'id : " + id));

        if (!"ADMIN".equalsIgnoreCase(userRole) && !avis.getUtilisateurId().equals(utilisateurId)) {
            throw new SecurityException("Vous n'avez pas le droit de supprimer cet avis");
        }

        avisRepository.delete(avis);
        log.info("Avis {} supprimé par l'utilisateur {}", id, utilisateurId);
    }

    private AvisResponseDTO toResponseDTO(Avis avis) {
        return AvisResponseDTO.builder()
                .id(avis.getId())
                .logementId(avis.getLogement().getId())
                .utilisateurId(avis.getUtilisateurId())
                .nomUtilisateur(avis.getNomUtilisateur())
                .note(avis.getNote())
                .commentaire(avis.getCommentaire())
                .dateCreation(avis.getDateCreation())
                .build();
    }
}
