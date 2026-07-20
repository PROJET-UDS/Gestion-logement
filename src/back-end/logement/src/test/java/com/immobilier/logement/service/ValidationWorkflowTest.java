package com.immobilier.logement.service;

import com.immobilier.logement.dto.LogementResponseDTO;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.entity.ValidationHistory;
import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.exception.ResourceNotFoundException;
import com.immobilier.logement.mapper.LogementMapper;
import com.immobilier.logement.repository.LogementRepository;
import com.immobilier.logement.repository.ValidationHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ValidationWorkflowTest {

    @Mock
    private LogementRepository logementRepository;
    @Mock
    private RabbitTemplate rabbitTemplate;
    @Mock
    private LogementMapper logementMapper;
    @Mock
    private AlerteService alerteService;
    @Mock
    private FavoriHistoriqueService favoriHistoriqueService;
    @Mock
    private ValidationHistoryRepository validationHistoryRepository;

    @InjectMocks
    private LogementServiceImpl logementService;

    private Logement logement;
    private LogementResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        logement = Logement.builder()
                .id(1L)
                .titre("Appartement T3")
                .prix(new BigDecimal("250000"))
                .proprietaireId("owner-123")
                .statutAnnonce(StatutAnnonce.BROUILLON)
                .build();

        responseDTO = new LogementResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setTitre("Appartement T3");
    }

    @Test
    void soumettreAValidation_fromBrouillon_success() {
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));
        when(logementRepository.save(any())).thenReturn(logement);
        when(logementMapper.toResponseDTO(any())).thenReturn(responseDTO);

        logementService.soumettreAValidation(1L, "owner-123");

        assertEquals(StatutAnnonce.EN_ATTENTE_VALIDATION, logement.getStatutAnnonce());
        verify(rabbitTemplate).convertAndSend(anyString(), eq("logement.soumis"), any(Object.class));
    }

    @Test
    void soumettreAValidation_wrongOwner_throws() {
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));

        assertThrows(IllegalStateException.class,
                () -> logementService.soumettreAValidation(1L, "other-owner"));
    }

    @Test
    void soumettreAValidation_alreadyPublished_throws() {
        logement.setStatutAnnonce(StatutAnnonce.PUBLIEE);
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));

        assertThrows(IllegalStateException.class,
                () -> logementService.soumettreAValidation(1L, "owner-123"));
    }

    @Test
    void validerLogement_success() {
        logement.setStatutAnnonce(StatutAnnonce.EN_ATTENTE_VALIDATION);
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));
        when(logementRepository.save(any())).thenReturn(logement);
        when(logementMapper.toResponseDTO(any())).thenReturn(responseDTO);

        logementService.validerLogement(1L, "admin-1");

        assertEquals(StatutAnnonce.PUBLIEE, logement.getStatutAnnonce());
        verify(validationHistoryRepository).save(any(ValidationHistory.class));
        verify(rabbitTemplate).convertAndSend(anyString(), eq("logement.valide"), any(Object.class));
    }

    @Test
    void validerLogement_notPending_throws() {
        logement.setStatutAnnonce(StatutAnnonce.BROUILLON);
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));

        assertThrows(IllegalStateException.class,
                () -> logementService.validerLogement(1L, "admin-1"));
    }

    @Test
    void rejeterLogement_success() {
        logement.setStatutAnnonce(StatutAnnonce.EN_ATTENTE_VALIDATION);
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));
        when(logementRepository.save(any())).thenReturn(logement);
        when(logementMapper.toResponseDTO(any())).thenReturn(responseDTO);

        logementService.rejeterLogement(1L, "admin-1", "Photos manquantes");

        assertEquals(StatutAnnonce.REJETEE, logement.getStatutAnnonce());
        verify(validationHistoryRepository).save(any(ValidationHistory.class));
    }

    @Test
    void rejeterLogement_noMotif_throws() {
        logement.setStatutAnnonce(StatutAnnonce.EN_ATTENTE_VALIDATION);
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));

        assertThrows(IllegalArgumentException.class,
                () -> logementService.rejeterLogement(1L, "admin-1", ""));
    }

    @Test
    void rejeterLogement_notPending_throws() {
        logement.setStatutAnnonce(StatutAnnonce.PUBLIEE);
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));

        assertThrows(IllegalStateException.class,
                () -> logementService.rejeterLogement(1L, "admin-1", "raison"));
    }

    @Test
    void archiverLogement_success() {
        logement.setStatutAnnonce(StatutAnnonce.PUBLIEE);
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));
        when(logementRepository.save(any())).thenReturn(logement);
        when(logementMapper.toResponseDTO(any())).thenReturn(responseDTO);

        logementService.archiverLogement(1L, "owner-123");

        assertEquals(StatutAnnonce.ARCHIVEE, logement.getStatutAnnonce());
    }

    @Test
    void archiverLogement_wrongOwner_throws() {
        when(logementRepository.findById(1L)).thenReturn(Optional.of(logement));

        assertThrows(IllegalStateException.class,
                () -> logementService.archiverLogement(1L, "other-owner"));
    }

    @Test
    void soumettreAValidation_notFound_throws() {
        when(logementRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> logementService.soumettreAValidation(99L, "owner-123"));
    }
}
