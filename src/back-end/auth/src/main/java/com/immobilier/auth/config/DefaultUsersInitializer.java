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

import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultUsersInitializer implements ApplicationRunner {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthEventPublisher authEventPublisher;

    @Value("${DEFAULT_USERS_INITIALIZATION_ENABLED:true}")
    private boolean enabled;

    @Value("${DEFAULT_CLIENT_EMAIL:client@gestion-logement.local}")
    private String clientEmail;

    @Value("${DEFAULT_CLIENT_PASSWORD:Client@12345}")
    private String clientPassword;

    @Value("${DEFAULT_PROPRIETAIRE_EMAIL:proprietaire@gestion-logement.local}")
    private String proprietaireEmail;

    @Value("${DEFAULT_PROPRIETAIRE_PASSWORD:Proprietaire@12345}")
    private String proprietairePassword;

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("Initialisation des comptes de demonstration desactivee.");
            return;
        }

        List<DefaultAccount> accounts = List.of(
                new DefaultAccount(
                        clientEmail,
                        clientPassword,
                        "Utilisateur de demonstration",
                        UserRole.CLIENT
                ),
                new DefaultAccount(
                        proprietaireEmail,
                        proprietairePassword,
                        "Proprietaire de demonstration",
                        UserRole.PROPRIETAIRE
                )
        );

        accounts.forEach(this::initialize);
    }

    private void initialize(DefaultAccount account) {
        String email = account.email().trim().toLowerCase(Locale.ROOT);
        AuthUser user = authUserRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    AuthUser createdUser = AuthUser.builder()
                            .email(email)
                            .passwordHash(passwordEncoder.encode(account.password()))
                            .role(account.role())
                            .actif(true)
                            .mustChangePassword(true)
                            .build();

                    AuthUser savedUser = authUserRepository.saveAndFlush(createdUser);
                    log.info(
                            "Compte de demonstration {} cree : {}",
                            account.role(),
                            email
                    );
                    return savedUser;
                });

        if (user.getRole() != account.role()) {
            log.warn(
                    "Le compte {} existe deja avec le role {} au lieu de {}; role existant conserve.",
                    email,
                    user.getRole(),
                    account.role()
            );
        }

        authEventPublisher.publishUserRegistered(
                user.getId(),
                user.getEmail(),
                account.name(),
                user.getRole().name()
        );
    }

    private record DefaultAccount(
            String email,
            String password,
            String name,
            UserRole role
    ) {
    }
}
