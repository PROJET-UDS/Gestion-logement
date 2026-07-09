package com.immobilier.logement.security;

public record AuthenticatedUser(String userId, String email, String role) {
}
