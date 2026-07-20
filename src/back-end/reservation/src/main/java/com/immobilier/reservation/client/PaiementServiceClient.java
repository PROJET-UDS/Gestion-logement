package com.immobilier.reservation.client;

import com.immobilier.reservation.dto.PaiementRequestDTO;
import com.immobilier.reservation.dto.PaiementResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment", path = "/api/payments")
public interface PaiementServiceClient {

    @PostMapping("/from-reservation")
    PaiementResponseDTO creerPaiementDepuisReservation(@RequestBody PaiementRequestDTO request);
}
