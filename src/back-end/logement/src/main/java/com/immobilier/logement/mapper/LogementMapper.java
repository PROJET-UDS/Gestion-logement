package com.immobilier.logement.mapper;

import com.immobilier.logement.dto.LogementRequestDTO;
import com.immobilier.logement.dto.LogementResponseDTO;
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
                .typeLogement(dto.getTypeLogement())
                .typeTransaction(dto.getTypeTransaction())
                .proprietaireId(dto.getProprietaireId())
                .build();
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
        dto.setTypeLogement(entity.getTypeLogement());
        dto.setTypeTransaction(entity.getTypeTransaction());
        dto.setStatutAnnonce(entity.getStatutAnnonce());
        dto.setProprietaireId(entity.getProprietaireId());
        dto.setDateCreation(entity.getDateCreation());

        if (entity.getMedias() != null) {
            dto.setMedias(entity.getMedias().stream()
                    .map(m -> new MediaDTO(m.getFileUrl(), m.is360View()))
                    .collect(Collectors.toList()));
        } else {
            dto.setMedias(Collections.emptyList());
        }

        return dto;
    }
}