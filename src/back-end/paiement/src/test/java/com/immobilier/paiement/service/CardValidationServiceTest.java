package com.immobilier.paiement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CardValidationServiceTest {

    private CardValidationService cardValidationService;

    @BeforeEach
    void setUp() {
        cardValidationService = new CardValidationService();
    }

    @Test
    void validateLuhn_validVisa_returnsTrue() {
        assertTrue(cardValidationService.validateLuhn("4242424242424242"));
    }

    @Test
    void validateLuhn_validDeclinedCard_returnsTrue() {
        assertTrue(cardValidationService.validateLuhn("4000000000000002"));
    }

    @Test
    void validateLuhn_validInsufficientFunds_returnsTrue() {
        assertTrue(cardValidationService.validateLuhn("4000000000009995"));
    }

    @Test
    void validateLuhn_invalidNumber_returnsFalse() {
        assertFalse(cardValidationService.validateLuhn("1234567890123456"));
    }

    @Test
    void validateLuhn_nullInput_returnsFalse() {
        assertFalse(cardValidationService.validateLuhn(null));
    }

    @Test
    void validateLuhn_emptyInput_returnsFalse() {
        assertFalse(cardValidationService.validateLuhn(""));
    }

    @Test
    void validateLuhn_tooShort_returnsFalse() {
        assertFalse(cardValidationService.validateLuhn("123"));
    }

    @Test
    void validateLuhn_withSpaces_returnsTrue() {
        assertTrue(cardValidationService.validateLuhn("4242 4242 4242 4242"));
    }

    @Test
    void validateExpiry_validFuture_returnsTrue() {
        assertTrue(cardValidationService.validateExpiry("12/30"));
    }

    @Test
    void validateExpiry_pastDate_returnsFalse() {
        assertFalse(cardValidationService.validateExpiry("01/20"));
    }

    @Test
    void validateExpiry_invalidFormat_returnsFalse() {
        assertFalse(cardValidationService.validateExpiry("2030-12"));
    }

    @Test
    void validateExpiry_invalidMonth_returnsFalse() {
        assertFalse(cardValidationService.validateExpiry("13/30"));
    }

    @Test
    void validateExpiry_null_returnsFalse() {
        assertFalse(cardValidationService.validateExpiry(null));
    }

    @Test
    void validateCvv_valid_returnsTrue() {
        assertTrue(cardValidationService.validateCvv("123"));
    }

    @Test
    void validateCvv_tooShort_returnsFalse() {
        assertFalse(cardValidationService.validateCvv("12"));
    }

    @Test
    void validateCvv_tooLong_returnsFalse() {
        assertFalse(cardValidationService.validateCvv("1234"));
    }

    @Test
    void validateCvv_null_returnsFalse() {
        assertFalse(cardValidationService.validateCvv(null));
    }

    @Test
    void validateCvv_nonDigits_returnsFalse() {
        assertFalse(cardValidationService.validateCvv("abc"));
    }

    @Test
    void detectBrand_visa() {
        assertEquals("VISA", cardValidationService.detectBrand("4242424242424242"));
    }

    @Test
    void detectBrand_mastercard() {
        assertEquals("MASTERCARD", cardValidationService.detectBrand("5105105105105100"));
    }

    @Test
    void detectBrand_amex() {
        assertEquals("AMEX", cardValidationService.detectBrand("378282246310005"));
    }

    @Test
    void detectBrand_discover() {
        assertEquals("DISCOVER", cardValidationService.detectBrand("6011111111111117"));
    }

    @Test
    void detectBrand_unknown() {
        assertEquals("UNKNOWN", cardValidationService.detectBrand("9999999999999999"));
    }

    @Test
    void simulatePayment_successCard_returnsSuccess() {
        assertEquals(
                CardValidationService.PaymentSimulationResult.SUCCESS,
                cardValidationService.simulatePayment("4242424242424242")
        );
    }

    @Test
    void simulatePayment_declinedCard_returnsDeclined() {
        assertEquals(
                CardValidationService.PaymentSimulationResult.DECLINED,
                cardValidationService.simulatePayment("4000000000000002")
        );
    }

    @Test
    void simulatePayment_insufficientFundsCard_returnsInsufficientFunds() {
        assertEquals(
                CardValidationService.PaymentSimulationResult.INSUFFICIENT_FUNDS,
                cardValidationService.simulatePayment("4000000000009995")
        );
    }

    @Test
    void simulatePayment_invalidLuhn_returnsInvalidCard() {
        assertEquals(
                CardValidationService.PaymentSimulationResult.INVALID_CARD,
                cardValidationService.simulatePayment("1234567890123456")
        );
    }

    @Test
    void simulatePayment_otherValidCard_returnsSuccess() {
        assertEquals(
                CardValidationService.PaymentSimulationResult.SUCCESS,
                cardValidationService.simulatePayment("5105105105105100")
        );
    }
}
