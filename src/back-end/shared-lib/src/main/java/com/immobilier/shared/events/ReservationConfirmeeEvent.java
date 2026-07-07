package com.immobilier.shared.events;
import lombok.*;
import java.time.Instant;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReservationConfirmeeEvent {
    public static final String TOPIC = "reservation.confirmee";
    private String reservationId;
    private String clientId;
    private String proprietaireId;
    private String logementId;
    private Instant occurredAt;
}
