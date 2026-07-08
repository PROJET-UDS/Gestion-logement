package com.immobilier.user.security;

import com.immobilier.shared.dto.JwtClaims;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

@Service
public class JwtService {
    private final SecretKey key;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public JwtClaims validateAndExtract(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();

        if (!"access".equals(claims.get("type", String.class))) {
            throw new JwtException("Token d'acces attendu");
        }

        return JwtClaims.builder()
                .userId(claims.getSubject())
                .email(claims.get("email", String.class))
                .role(claims.get("role", String.class))
                .build();
    }

    public boolean isValid(String token) {
        try {
            validateAndExtract(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
