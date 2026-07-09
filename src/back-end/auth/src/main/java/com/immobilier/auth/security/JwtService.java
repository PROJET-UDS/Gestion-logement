package com.immobilier.auth.security;

import com.immobilier.shared.dto.JwtClaims;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    private final SecretKey key;
    private final long accessExpMs;
    private final long refreshExpMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration-ms:900000}") long accessExpMs,
            @Value("${jwt.refresh-expiration-ms:604800000}") long refreshExpMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpMs  = accessExpMs;
        this.refreshExpMs = refreshExpMs;
    }

    public String generateAccessToken(String userId, String email, String role) {
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpMs))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .claim("type", "refresh")
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpMs))
                .signWith(key)
                .compact();
    }

    public JwtClaims validateAndExtractAccessToken(String token) {
        return validateAndExtract(token, "access");
    }

    public JwtClaims validateAndExtractRefreshToken(String token) {
        return validateAndExtract(token, "refresh");
    }

    private JwtClaims validateAndExtract(String token, String expectedType) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        String tokenType = claims.get("type", String.class);
        if (!expectedType.equals(tokenType)) {
            throw new JwtException("Type de token invalide");
        }
        return JwtClaims.builder()
                .userId(claims.getSubject())
                .email(claims.get("email", String.class))
                .role(claims.get("role", String.class))
                .build();
    }

    public boolean isValid(String token) {
        try { validateAndExtractAccessToken(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }

    public boolean isAccessTokenValid(String token) {
        try { validateAndExtractAccessToken(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }

    public boolean isRefreshTokenValid(String token) {
        try { validateAndExtractRefreshToken(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
}
