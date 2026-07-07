package com.immobilier.shared.events;
import lombok.*;
import java.time.Instant;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserRoleChangedEvent {
    public static final String TOPIC = "user.role_changed";
    private String userId;
    private String ancienRole;
    private String nouveauRole;
    private Instant occurredAt;
}
