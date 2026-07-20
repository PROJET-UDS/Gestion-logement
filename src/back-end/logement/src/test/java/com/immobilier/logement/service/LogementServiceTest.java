package com.immobilier.logement.service;

import com.immobilier.logement.config.RabbitMQConfig;
import com.immobilier.logement.dto.LogementRequestDTO;
import com.immobilier.logement.dto.LogementResponseDTO;
import com.immobilier.logement.entity.Logement;
import com.immobilier.logement.enums.StatutAnnonce;
import com.immobilier.logement.mapper.LogementMapper;
import com.immobilier.logement.rabbitmq.LogementEvent;
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
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogementServiceTest {

    @Mock
    private LogementRepository logementRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private LogementMapper logementMapper;

    // ====================================================================
    // AJOUTS INDISPENSABLES : Mocks pour les deux nouveaux services
    // ====================================================================
    @Mock
    private AlerteService alerteService;

    @Mock
    private FavoriHistoriqueService favoriHistoriqueService;

    @Mock
    private ValidationHistoryRepository validationHistoryRepository;

    @InjectMocks
    private LogementServiceImpl logementService;

    private LogementRequestDTO requestDTO;
    private Logement logement;
    private LogementResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new LogementRequestDTO();
        requestDTO.setTitre("Studio moderne");
        requestDTO.setPrix(new BigDecimal("150000"));
        requestDTO.setProprietaireId("191ef4b1-7b18-495f-869b-50d14a26023d");
        requestDTO.setMedias(new ArrayList<>());

        logement = Logement.builder()
                .id(1L)
                .titre("Studio moderne")
                .prix(new BigDecimal("150000"))
                .proprietaireId("191ef4b1-7b18-495f-869b-50d14a26023d")
                .statutAnnonce(StatutAnnonce.EN_ATTENTE)
                .build();

        responseDTO = new LogementResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setTitre("Studio moderne");
        responseDTO.setStatutAnnonce(StatutAnnonce.EN_ATTENTE);
    }

    @Test
    void testCreerLogement_Succes() {
        // Given
        when(logementMapper.toEntity(any(LogementRequestDTO.class))).thenReturn(logement);
        when(logementRepository.save(any(Logement.class))).thenReturn(logement);
        when(logementMapper.toResponseDTO(any(Logement.class))).thenReturn(responseDTO);

        // When
        LogementResponseDTO resultat = logementService.creerLogement(requestDTO);

        // Then
        assertNotNull(resultat);
        assertEquals("Studio moderne", resultat.getTitre());

        // Vérification de la persistance en BDD
        verify(logementRepository, times(1)).save(any(Logement.class));

        // VERIFICATION DE L'AJOUT : L'analyse d'alerte s'est bien exécutée une fois
        verify(alerteService, times(1)).verifierEtDeclencherAlertes(any(Logement.class));

        // Vérification de l'envoi du message dans RabbitMQ
        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConfig.LOGEMENT_EXCHANGE),
                eq(RabbitMQConfig.ROUTING_KEY_LOGEMENT_CREE),
                any(LogementEvent.class)
        );
    }
}