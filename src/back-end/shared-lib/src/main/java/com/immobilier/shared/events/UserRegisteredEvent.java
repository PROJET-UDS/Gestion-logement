package com.immobilier.shared.events;
import lombok.*;
import java.time.Instant;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserRegisteredEvent {
    public static final String TOPIC = "user.registered";
    private String userId;
    private String email;
    private String role;
    private Instant occurredAt;
}
