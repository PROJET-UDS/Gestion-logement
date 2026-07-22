package com.immobilier.logement.mapper;

import com.immobilier.logement.dto.LogementRequestDTO;
import com.immobilier.logement.dto.LogementResponseDTO;
import com.immobilier.logement.dto.LogementUpdateDTO;
import com.immobilier.logement.dto.MediaDTO;
import com.immobilier.logement.entity.Logement;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class LogementMapper {

    public Logement toEntity(LogementRequestDTO dto) {
        if (dto == null) return null;

        return Logement.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .prix(dto.getPrix())
                .adresse(dto.getAdresse())
                .ville(dto.getVille())
                .quartier(dto.getQuartier())
                .typeLogement(dto.getTypeLogement())
                .typeTransaction(dto.getTypeTransaction())
                .proprietaireId(dto.getProprietaireId())
                .charges(dto.getCharges())
                .nbPieces(dto.getNbPieces())
                .superficie(dto.getSuperficie())
                .equipements(dto.getEquipements())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();
    }

    public void updateEntity(Logement entity, LogementUpdateDTO dto) {
        if (entity == null || dto == null) return;

        entity.setTitre(dto.getTitre());
        entity.setDescription(dto.getDescription());
        entity.setPrix(dto.getPrix());
        entity.setAdresse(dto.getAdresse());
        entity.setVille(dto.getVille());
        entity.setQuartier(dto.getQuartier());
        entity.setTypeLogement(dto.getTypeLogement());
        entity.setTypeTransaction(dto.getTypeTransaction());
        entity.setCharges(dto.getCharges());
        entity.setNbPieces(dto.getNbPieces());
        entity.setSuperficie(dto.getSuperficie());
        entity.setEquipements(dto.getEquipements());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
    }

    public LogementResponseDTO toResponseDTO(Logement entity) {
        if (entity == null) return null;

        LogementResponseDTO dto = new LogementResponseDTO();
        dto.setId(entity.getId());
        dto.setTitre(entity.getTitre());
        dto.setDescription(entity.getDescription());
        dto.setPrix(entity.getPrix());
        dto.setAdresse(entity.getAdresse());
        dto.setVille(entity.getVille());
        dto.setQuartier(entity.getQuartier());
        dto.setTypeLogement(entity.getTypeLogement());
        dto.setTypeTransaction(entity.getTypeTransaction());
        dto.setStatutAnnonce(entity.getStatutAnnonce());
        dto.setStatutLogement(entity.getStatutLogement());
        dto.setProprietaireId(entity.getProprietaireId());
        dto.setCharges(entity.getCharges());
        dto.setNbPieces(entity.getNbPieces());
        dto.setSuperficie(entity.getSuperficie());
        dto.setEquipements(entity.getEquipements());
        dto.setSupprime(entity.getSupprime());
        dto.setDateCreation(entity.getDateCreation());
        dto.setDateModification(entity.getDateModification());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setNoteMoyenne(entity.getNoteMoyenne());
        dto.setEnVedette(Boolean.TRUE.equals(entity.getEnVedette()));
        dto.setDateVedetteDebut(entity.getDateVedetteDebut());
        dto.setDateVedetteFin(entity.getDateVedetteFin());

        if (entity.getMedias() != null) {
            dto.setMedias(entity.getMedias().stream()
                    .map(m -> new MediaDTO(m.getFileUrl(), m.getMediaType(), m.is360View()))
                    .collect(Collectors.toList()));
        } else {
            dto.setMedias(Collections.emptyList());
        }

        return dto;
    }
}
