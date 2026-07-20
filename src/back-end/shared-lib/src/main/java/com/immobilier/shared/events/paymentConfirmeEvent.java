package com.immobilier.shared.events;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class paymentConfirmeEvent {
    public static final String TOPIC = "payment.confirme";
    private String transactionId;
    private String reservationId;
    private BigDecimal montant;
    private Instant occurredAt;
}
