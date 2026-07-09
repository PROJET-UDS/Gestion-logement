package com.immobilier.paiement.exception;

public class PaymentNotFoundException extends RuntimeException {

    public PaymentNotFoundException(Long id) {
        super("Paiement introuvable avec l'id : " + id);
    }

    public PaymentNotFoundException(String message) {
        super(message);
    }
}