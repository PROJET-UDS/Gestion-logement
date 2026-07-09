package com.immobilier.reservation.security;

public record AuthenticatedUser(String userId, String email, String role) {
}
