package com.immobilier.messagerie.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "email_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id")
    private String eventId;

    @Column(name = "correlation_id")
    private String correlationId;

    @Column(nullable = false)
    private String recipient;

    @Column(name = "email_type")
    private String emailType;

    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EmailStatus status = EmailStatus.EN_ATTENTE;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(nullable = false)
    @Builder.Default
    private int attempts = 0;

    @Column(name = "error_message", length = 2000)
    private String errorMessage;
}
