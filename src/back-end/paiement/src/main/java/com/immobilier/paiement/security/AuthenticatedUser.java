package com.immobilier.paiement.security;

public record AuthenticatedUser(String userId, String email, String role) {
}
