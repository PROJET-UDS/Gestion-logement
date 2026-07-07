package com.immobilier.auth.exception;


public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String email) {
        super("Un compte existe dÃ©jÃ  avec l'email : " + email);
    }
}
