package com.immobilier.auth.entity;

import com.immobilier.shared.exceptions.GatewayException;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.Instant;

@Entity
@Table(name = "auth_users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthUser {
    @Id @UuidGenerator
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private boolean actif = true;

    private Instant createdAt;

    @PrePersist
    void prePersist() { this.createdAt = Instant.now(); }
}
