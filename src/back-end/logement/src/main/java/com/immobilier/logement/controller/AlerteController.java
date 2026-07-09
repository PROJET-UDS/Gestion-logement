package com.immobilier.logement.controller;

import com.immobilier.logement.entity.Alerte;
import com.immobilier.logement.service.AlerteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/alertes")
public class AlerteController {

    private final AlerteService alerteService;

    public AlerteController(AlerteService alerteService) {
        this.alerteService = alerteService;
    }

    @PostMapping
    public ResponseEntity<Alerte> enregistrerAlerte(@RequestBody Alerte alerte) {
        Alerte nouvelleAlerte = alerteService.creerAlerte(alerte);
        return ResponseEntity.ok(nouvelleAlerte);
    }
}