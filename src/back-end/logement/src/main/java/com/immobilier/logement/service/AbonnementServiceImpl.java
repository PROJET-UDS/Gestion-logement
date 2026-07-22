package com.immobilier.logement.service;

import com.immobilier.logement.dto.AbonnementResponseDTO;
import com.immobilier.logement.dto.VedetteRequestDTO;
import com.immobilier.logement.dto.VedetteResponseDTO;
import com.immobilier.logement.entity.Abonnement;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.entity.LogementEnVedette;
import com.immobilier.logement.enums.StatutAbonnement;
import com.immobilier.logement.enums.StatutVedette;
import com.immobilier.logement.enums.TypeAbonnement;
import com.immobilier.logement.enums.TypeVedette;
import com.immobilier.logement.exception.ResourceNotFoundException;
import com.immobilier.logement.repository.AbonnementRepository;
import com.immobilier.logement.repository.LogementEnVedetteRepository;
import com.immobilier.logement.repository.LogementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AbonnementServiceImpl implements AbonnementService {

    private final AbonnementRepository abonnementRepository;
    private final LogementEnVedetteRepository vedetteRepository;
    private final LogementRepository logementRepository;

    private static final int GRATUIT_PUBLICATIONS = 4;
    private static final int MAX_VEDETTE_PAR_MOIS = 4;

    @Override
    @Transactional(readOnly = true)
    public AbonnementResponseDTO getAbonnementActif(String proprietaireId) {
        return abonnementRepository
                .findTopByProprietaireIdAndStatutOrderByDateFinDesc(proprietaireId, StatutAbonnement.ACTIF)
                .map(this::toResponseDTO)
                .orElse(getGratuitResponse(proprietaireId));
    }

    @Override
    @Transactional
    public AbonnementResponseDTO souscrire(String proprietaireId, TypeAbonnement type, String paymentRef, Double montant) {
        Abonnement existant = abonnementRepository
                .findTopByProprietaireIdAndStatutOrderByDateFinDesc(proprietaireId, StatutAbonnement.ACTIF)
                .orElse(null);

        if (existant != null && existant.getTypeAbonnement() != TypeAbonnement.GRATUIT) {
            existant.setStatut(StatutAbonnement.ANNULE);
            abonnementRepository.save(existant);
        }

        int publicationsIncluses = getPublicationsIncluses(type);
        int moisDuree = getDureeEnMois(type);
        LocalDateTime maintenant = LocalDateTime.now();

        Abonnement abonnement = Abonnement.builder()
                .proprietaireId(proprietaireId)
                .typeAbonnement(type)
                .publicationsIncluses(publicationsIncluses)
                .publicationsUtilisees(0)
                .dateDebut(maintenant)
                .dateFin(maintenant.plusMonths(moisDuree))
                .statut(StatutAbonnement.ACTIF)
                .montantPaye(montant)
                .paymentRef(paymentRef)
                .build();

        Abonnement saved = abonnementRepository.save(abonnement);
        log.info("Abonnement {} souscrit par {} - {} FCFA", type, proprietaireId, montant);
        return toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean peutPublier(String proprietaireId) {
        Abonnement abonnement = abonnementRepository
                .findTopByProprietaireIdAndStatutOrderByDateFinDesc(proprietaireId, StatutAbonnement.ACTIF)
                .orElse(null);

        if (abonnement == null) {
            long nbLogements = logementRepository.countByProprietaireIdAndSupprimeFalseOrSupprimeIsNull(proprietaireId);
            return nbLogements < GRATUIT_PUBLICATIONS;
        }

        if (abonnement.getTypeAbonnement() == TypeAbonnement.MENSUEL_ILLIMITE
                || abonnement.getTypeAbonnement() == TypeAbonnement.ANNUEL_ILLIMITE) {
            return true;
        }

        return abonnement.getPublicationsUtilisees() < abonnement.getPublicationsIncluses();
    }

    @Override
    @Transactional
    public void incrementerPublications(String proprietaireId) {
        abonnementRepository
                .findTopByProprietaireIdAndStatutOrderByDateFinDesc(proprietaireId, StatutAbonnement.ACTIF)
                .ifPresent(abonnement -> {
                    if (abonnement.getTypeAbonnement() != TypeAbonnement.GRATUIT) {
                        abonnement.setPublicationsUtilisees(abonnement.getPublicationsUtilisees() + 1);
                        abonnementRepository.save(abonnement);
                    }
                });
    }

    @Override
    @Transactional
    public VedetteResponseDTO passerEnVedette(String proprietaireId, VedetteRequestDTO request) {
        Logement logement = logementRepository.findById(request.getLogementId())
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable"));

        if (!logement.getProprietaireId().equals(proprietaireId)) {
            throw new IllegalStateException("Vous ne pouvez mettre en vedette que vos propres logements");
        }

        long nbVedettes = compterLogementsEnVedetteCeMois(proprietaireId);
        if (nbVedettes >= MAX_VEDETTE_PAR_MOIS) {
            throw new IllegalStateException("Vous ne pouvez pas mettre plus de " + MAX_VEDETTE_PAR_MOIS + " logements en vedette le meme mois");
        }

        LogementEnVedette existant = vedetteRepository
                .findByLogementIdAndStatut(request.getLogementId(), StatutVedette.ACTIF)
                .orElse(null);
        if (existant != null) {
            throw new IllegalStateException("Ce logement est deja en vedette");
        }

        LocalDateTime maintenant = LocalDateTime.now();
        int moisDuree = request.getTypeVedette() == TypeVedette.ANNUEL ? 12 : 1;

        LogementEnVedette vedette = LogementEnVedette.builder()
                .logementId(request.getLogementId())
                .proprietaireId(proprietaireId)
                .typeVedette(request.getTypeVedette())
                .dateDebut(maintenant)
                .dateFin(maintenant.plusMonths(moisDuree))
                .statut(StatutVedette.ACTIF)
                .montantPaye(request.getMontantPaye())
                .paymentRef(request.getPaymentRef())
                .build();

        vedetteRepository.save(vedette);

        logement.setEnVedette(true);
        logement.setDateVedetteDebut(maintenant);
        logement.setDateVedetteFin(maintenant.plusMonths(moisDuree));
        logementRepository.save(logement);

        log.info("Logement {} passe en vedette par {} - {}", request.getLogementId(), proprietaireId, request.getTypeVedette());
        return toVedetteResponse(vedette, logement.getTitre());
    }

    @Override
    @Transactional
    public void retirerDeVedette(String proprietaireId, Long logementId) {
        LogementEnVedette vedette = vedetteRepository
                .findByLogementIdAndStatut(logementId, StatutVedette.ACTIF)
                .orElseThrow(() -> new ResourceNotFoundException("Ce logement n'est pas en vedette"));

        if (!vedette.getProprietaireId().equals(proprietaireId)) {
            throw new IllegalStateException("Action non autorisee");
        }

        vedette.setStatut(StatutVedette.EXPIRE);
        vedetteRepository.save(vedette);

        logementRepository.findById(logementId).ifPresent(logement -> {
            logement.setEnVedette(false);
            logement.setDateVedetteDebut(null);
            logement.setDateVedetteFin(null);
            logementRepository.save(logement);
        });

        log.info("Logement {} retire de la vedette par {}", logementId, proprietaireId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VedetteResponseDTO> mesLogementsEnVedette(String proprietaireId) {
        return vedetteRepository.findByProprietaireIdAndStatutOrderByDateFinDesc(proprietaireId, StatutVedette.ACTIF)
                .stream()
                .map(v -> {
                    String titre = logementRepository.findById(v.getLogementId())
                            .map(Logement::getTitre).orElse("Inconnu");
                    return toVedetteResponse(v, titre);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long compterLogementsEnVedetteCeMois(String proprietaireId) {
        YearMonth moisActuel = YearMonth.now();
        LocalDateTime debutMois = moisActuel.atDay(1).atStartOfDay();
        LocalDateTime finMois = moisActuel.atEndOfMonth().atTime(23, 59, 59);
        return vedetteRepository.countByProprietaireIdAndStatutAndDateDebutBetween(
                proprietaireId, StatutVedette.ACTIF, debutMois, finMois);
    }

    private AbonnementResponseDTO getGratuitResponse(String proprietaireId) {
        long nbLogements = logementRepository.countByProprietaireIdAndSupprimeFalseOrSupprimeIsNull(proprietaireId);
        return AbonnementResponseDTO.builder()
                .proprietaireId(proprietaireId)
                .typeAbonnement(TypeAbonnement.GRATUIT)
                .publicationsIncluses(GRATUIT_PUBLICATIONS)
                .publicationsUtilisees((int) nbLogements)
                .publicationsRestantes(Math.max(0, GRATUIT_PUBLICATIONS - (int) nbLogements))
                .peutPublier(nbLogements < GRATUIT_PUBLICATIONS)
                .statut(StatutAbonnement.ACTIF)
                .build();
    }

    private int getPublicationsIncluses(TypeAbonnement type) {
        return switch (type) {
            case GRATUIT -> GRATUIT_PUBLICATIONS;
            case MENSUEL_10_PUBS, ANNUEL_10_PUBS -> 10;
            case MENSUEL_ILLIMITE, ANNUEL_ILLIMITE -> -1;
        };
    }

    private int getDureeEnMois(TypeAbonnement type) {
        return switch (type) {
            case GRATUIT -> 1;
            case MENSUEL_10_PUBS, MENSUEL_ILLIMITE -> 1;
            case ANNUEL_10_PUBS, ANNUEL_ILLIMITE -> 12;
        };
    }

    private AbonnementResponseDTO toResponseDTO(Abonnement a) {
        int incluses = a.getPublicationsIncluses();
        boolean illimite = incluses == -1;
        return AbonnementResponseDTO.builder()
                .id(a.getId())
                .proprietaireId(a.getProprietaireId())
                .typeAbonnement(a.getTypeAbonnement())
                .publicationsIncluses(incluses)
                .publicationsUtilisees(a.getPublicationsUtilisees())
                .publicationsRestantes(illimite ? -1 : Math.max(0, incluses - a.getPublicationsUtilisees()))
                .dateDebut(a.getDateDebut())
                .dateFin(a.getDateFin())
                .statut(a.getStatut())
                .montantPaye(a.getMontantPaye())
                .peutPublier(illimite || a.getPublicationsUtilisees() < incluses)
                .build();
    }

    private VedetteResponseDTO toVedetteResponse(LogementEnVedette v, String titre) {
        return VedetteResponseDTO.builder()
                .id(v.getId())
                .logementId(v.getLogementId())
                .titreLogement(titre)
                .proprietaireId(v.getProprietaireId())
                .typeVedette(v.getTypeVedette())
                .dateDebut(v.getDateDebut())
                .dateFin(v.getDateFin())
                .statut(v.getStatut())
                .montantPaye(v.getMontantPaye())
                .build();
    }
}
