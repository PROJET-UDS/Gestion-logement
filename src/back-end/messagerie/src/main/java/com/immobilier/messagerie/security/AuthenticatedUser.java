package com.immobilier.messagerie.security;

public record AuthenticatedUser(String userId, String email, String role) {
}
