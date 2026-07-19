package com.immobilier.auth.service;

import com.immobilier.auth.entity.PasswordResetToken;
import com.immobilier.auth.exception.AuthException;
import com.immobilier.auth.repository.AuthUserRepository;
import com.immobilier.auth.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final int CODE_LENGTH = 6;
    private static final int CODE_EXPIRY_MINUTES = 3;
    private static final int MAX_REGENERATIONS = 5;
    private static final int RATE_LIMIT_HOURS = 10;

    private final PasswordResetTokenRepository tokenRepository;
    private final AuthUserRepository authUserRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void envoyerCode(String email) {
        if (!authUserRepository.existsByEmail(email)) {
            log.warn("Tentative de reset pour email inexistant : {}", email);
            return;
        }

        verifierRateLimit(email);

        String code = genererCode();
        Instant now = Instant.now();
        Instant expiresAt = now.plus(CODE_EXPIRY_MINUTES, ChronoUnit.MINUTES);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .code(code)
                .createdAt(now)
                .expiresAt(expiresAt)
                .used(false)
                .attempt(1)
                .build();

        tokenRepository.save(token);
        emailService.envoyerCodeRecuperation(email, code);
        log.info("Code de recuperation envoye a {}", email);
    }

    @Transactional
    public void renvoyerCode(String email) {
        if (!authUserRepository.existsByEmail(email)) {
            log.warn("Tentative de resend pour email inexistant : {}", email);
            return;
        }

        verifierRateLimit(email);

        String code = genererCode();
        Instant now = Instant.now();
        Instant expiresAt = now.plus(CODE_EXPIRY_MINUTES, ChronoUnit.MINUTES);

        int previousAttempt = tokenRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .map(PasswordResetToken::getAttempt)
                .orElse(0);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .code(code)
                .createdAt(now)
                .expiresAt(expiresAt)
                .used(false)
                .attempt(previousAttempt + 1)
                .build();

        tokenRepository.save(token);
        emailService.envoyerCodeRecuperation(email, code);
        log.info("Nouveau code envoye a {} (tentative {})", email, token.getAttempt());
    }

    @Transactional
    public void reinitialiserMotDePasse(String email, String code, String nouveauMotDePasse) {
        PasswordResetToken token = tokenRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new AuthException("Aucun code actif trouve pour cet email"));

        if (token.isUsed()) {
            throw new AuthException("Ce code a deja ete utilise");
        }

        if (Instant.now().isAfter(token.getExpiresAt())) {
            throw new AuthException("Le code a expire. Demandez un nouveau code.");
        }

        if (!token.getCode().equals(code)) {
            throw new AuthException("Code incorrect");
        }

        token.setUsed(true);
        tokenRepository.save(token);

        authUserRepository.findByEmail(email).ifPresent(user -> {
            user.setPasswordHash(passwordEncoder.encode(nouveauMotDePasse));
            authUserRepository.save(user);
            log.info("Mot de passe reinitialise pour {}", email);
        });
    }

    private void verifierRateLimit(String email) {
        Instant windowStart = Instant.now().minus(RATE_LIMIT_HOURS, ChronoUnit.HOURS);
        long count = tokenRepository.countByEmailSince(email, windowStart);

        if (count >= MAX_REGENERATIONS + 1) {
            throw new AuthException(
                "Nombre maximum de demandes atteint. Reessayez dans "
                + RATE_LIMIT_HOURS + " heures."
            );
        }
    }

    private String genererCode() {
        SecureRandom random = new SecureRandom();
        int bound = (int) Math.pow(10, CODE_LENGTH);
        int codeInt = random.nextInt(bound);
        return String.format("%0" + CODE_LENGTH + "d", codeInt);
    }
}
