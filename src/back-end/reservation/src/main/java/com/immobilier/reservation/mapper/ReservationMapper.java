package com.immobilier.reservation.mapper;


import com.immobilier.reservation.dto.ReservationResponseDTO;
import com.immobilier.reservation.entity.Reservation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper MapStruct : convertit automatiquement Reservation (entité) en ReservationResponseDTO.
 * logementTitre et clientNom sont ignorés ici (ils seront remplis plus tard via les
 * microservices logement/user, à l'ajout de Feign lors de la fusion).
 */
@Mapper(componentModel = "spring")
public interface ReservationMapper {

    @Mapping(target = "logementTitre", ignore = true)
    @Mapping(target = "clientNom", ignore = true)
    ReservationResponseDTO toResponseDTO(Reservation reservation);
}

