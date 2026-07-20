package com.immobilier.paiement.service;

import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

@Service
public class CardValidationService {

    public enum PaymentSimulationResult {
        SUCCESS,
        DECLINED,
        INSUFFICIENT_FUNDS,
        INVALID_CARD
    }

    /**
     * Validates a card number using the Luhn algorithm.
     */
    public boolean validateLuhn(String cardNumber) {
        if (cardNumber == null || cardNumber.isBlank()) {
            return false;
        }

        String digits = cardNumber.replaceAll("\\s+", "");
        if (!digits.matches("\\d+") || digits.length() < 13 || digits.length() > 19) {
            return false;
        }

        int sum = 0;
        boolean alternate = false;

        for (int i = digits.length() - 1; i >= 0; i--) {
            int n = Character.getNumericValue(digits.charAt(i));
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n -= 9;
                }
            }
            sum += n;
            alternate = !alternate;
        }

        return sum % 10 == 0;
    }

    /**
     * Validates expiry date in MM/YY format. Must be in the future.
     */
    public boolean validateExpiry(String expiry) {
        if (expiry == null || !expiry.matches("\\d{2}/\\d{2}")) {
            return false;
        }

        try {
            String[] parts = expiry.split("/");
            int month = Integer.parseInt(parts[0]);
            int year = 2000 + Integer.parseInt(parts[1]);

            if (month < 1 || month > 12) {
                return false;
            }

            YearMonth expiryDate = YearMonth.of(year, month);
            YearMonth now = YearMonth.now();

            return expiryDate.isAfter(now) || expiryDate.equals(now);
        } catch (NumberFormatException | DateTimeParseException e) {
            return false;
        }
    }

    /**
     * Validates CVV - must be exactly 3 digits.
     */
    public boolean validateCvv(String cvv) {
        return cvv != null && cvv.matches("\\d{3}");
    }

    /**
     * Detects the card brand based on the card number prefix.
     */
    public String detectBrand(String cardNumber) {
        if (cardNumber == null || cardNumber.isBlank()) {
            return "UNKNOWN";
        }

        String digits = cardNumber.replaceAll("\\s+", "");

        if (digits.startsWith("4")) {
            return "VISA";
        } else if (digits.startsWith("5") && digits.length() >= 2) {
            char second = digits.charAt(1);
            if (second >= '1' && second <= '5') {
                return "MASTERCARD";
            }
        } else if (digits.startsWith("34") || digits.startsWith("37")) {
            return "AMEX";
        } else if (digits.startsWith("6011") || digits.startsWith("65")) {
            return "DISCOVER";
        }

        return "UNKNOWN";
    }

    /**
     * Simulates a payment based on the card number.
     * Uses test card numbers for predictable results.
     */
    public PaymentSimulationResult simulatePayment(String cardNumber) {
        if (cardNumber == null) {
            return PaymentSimulationResult.INVALID_CARD;
        }

        String digits = cardNumber.replaceAll("\\s+", "");

        if (!validateLuhn(digits)) {
            return PaymentSimulationResult.INVALID_CARD;
        }

        return switch (digits) {
            case "4242424242424242" -> PaymentSimulationResult.SUCCESS;
            case "4000000000000002" -> PaymentSimulationResult.DECLINED;
            case "4000000000009995" -> PaymentSimulationResult.INSUFFICIENT_FUNDS;
            default -> PaymentSimulationResult.SUCCESS;
        };
    }
}
