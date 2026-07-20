package com.immobilier.logement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private LocalDateTime subscribedAt;

    @Builder.Default
    private boolean active = true;

    @PrePersist
    protected void onCreate() {
        this.subscribedAt = LocalDateTime.now();
    }
}
