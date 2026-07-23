package com.immobilier.auth.config;

import com.immobilier.auth.entity.AuthUser;
import com.immobilier.auth.rabbitmq.AuthEventPublisher;
import com.immobilier.auth.repository.AuthUserRepository;
import com.immobilier.shared.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthEventPublisher authEventPublisher;

    @Value("${DEFAULT_ADMIN_EMAIL:admin@gestion-logement.local}")
    private String adminEmail;

    @Value("${DEFAULT_ADMIN_PASSWORD:Admin@12345}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        AuthUser admin = authUserRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> {
                    AuthUser createdAdmin = AuthUser.builder()
                            .email(normalizedEmail)
                            .passwordHash(passwordEncoder.encode(adminPassword))
                            .role(UserRole.ADMIN)
                            .actif(true)
                            .mustChangePassword(true)
                            .build();

                    AuthUser savedAdmin = authUserRepository.saveAndFlush(createdAdmin);
                    log.info("Compte admin par defaut cree avec succes : {}", normalizedEmail);
                    return savedAdmin;
                });

        if (admin.getRole() != UserRole.ADMIN) {
            log.warn(
                    "Le compte configure comme administrateur existe avec le role {}, role conserve.",
                    admin.getRole()
            );
        } else {
            log.info("Compte admin par defaut initialise : {}", normalizedEmail);
        }

        // L'evenement est republie a chaque demarrage afin de reparer aussi
        // les anciennes installations ou le profil admin manquait dans user_db.
        authEventPublisher.publishUserRegistered(
                admin.getId(),
                admin.getEmail(),
                "Administrateur",
                admin.getRole().name()
        );
    }
}
