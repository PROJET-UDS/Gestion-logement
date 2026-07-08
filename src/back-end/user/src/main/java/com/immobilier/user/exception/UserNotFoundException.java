package com.immobilier.user.exception;

public class UserNotFoundException extends UserException {
    public UserNotFoundException(String userId) {
        super("Profil utilisateur introuvable : " + userId);
    }
}
