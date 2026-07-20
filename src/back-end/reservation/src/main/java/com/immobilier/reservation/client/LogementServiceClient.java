package com.immobilier.reservation.client;

import com.immobilier.reservation.dto.LogementInfoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "logement", path = "/api/v1/logements")
public interface LogementServiceClient {

    @GetMapping("/{id}")
    LogementInfoDTO getLogementById(@PathVariable("id") Long id);

    @PatchMapping("/{id}/statut")
    void changerStatut(@PathVariable("id") Long id,
                       @RequestParam String statut);
}
