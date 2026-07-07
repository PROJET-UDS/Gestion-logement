package com.immobilier.shared.events;
import lombok.*;
import java.time.Instant;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AbonnementActiveEvent {
    public static final String TOPIC = "abonnement.active";
    private String proprietaireId;
    private String plan;
    private Instant dateExpiration;
    private Instant occurredAt;
}
