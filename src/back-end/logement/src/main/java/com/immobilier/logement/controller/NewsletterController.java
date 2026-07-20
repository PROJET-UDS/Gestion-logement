package com.immobilier.logement.controller;

import com.immobilier.logement.dto.NewsletterRequestDTO;
import com.immobilier.logement.dto.NewsletterSendDTO;
import com.immobilier.logement.entity.NewsletterSubscription;
import com.immobilier.logement.service.NewsletterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterService newsletterService;

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@Valid @RequestBody NewsletterRequestDTO request) {
        newsletterService.subscribe(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Inscription a la newsletter reussie"));
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@Valid @RequestBody NewsletterRequestDTO request) {
        newsletterService.unsubscribe(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Desabonnement de la newsletter reussi"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> isSubscribed(@RequestParam String email) {
        boolean subscribed = newsletterService.isSubscribed(email);
        return ResponseEntity.ok(Map.of("subscribed", subscribed));
    }

    @GetMapping("/subscribers")
    public ResponseEntity<List<NewsletterSubscription>> getAllSubscribers() {
        return ResponseEntity.ok(newsletterService.getAllActiveSubscribers());
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendToSubscribers(@Valid @RequestBody NewsletterSendDTO request) {
        newsletterService.sendNotificationToSubscribers(request.getSubject(), request.getContent());
        return ResponseEntity.ok(Map.of("message", "Notification envoyee aux abonnes"));
    }
}
