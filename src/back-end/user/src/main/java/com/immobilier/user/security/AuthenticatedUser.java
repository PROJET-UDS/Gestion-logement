package com.immobilier.user.security;

public record AuthenticatedUser(String userId, String email, String role) {
}
