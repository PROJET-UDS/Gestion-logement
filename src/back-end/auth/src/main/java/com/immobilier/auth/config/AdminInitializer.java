package com.immobilier.auth.config;

import com.immobilier.auth.entity.AuthUser;
import com.immobilier.auth.repository.AuthUserRepository;
import com.immobilier.shared.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${DEFAULT_ADMIN_EMAIL:admin@gestion-logement.local}")
    private String adminEmail;

    @Value("${DEFAULT_ADMIN_PASSWORD:Admin@12345}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (authUserRepository.existsByEmail(adminEmail)) {
            log.info("Compte admin par defaut deja existant ({}), aucune action requise.", adminEmail);
            return;
        }

        AuthUser admin = AuthUser.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(UserRole.ADMIN)
                .actif(true)
                .mustChangePassword(true)
                .build();

        authUserRepository.save(admin);
        log.info("Compte admin par defaut cree avec succes : {}", adminEmail);
    }
}
