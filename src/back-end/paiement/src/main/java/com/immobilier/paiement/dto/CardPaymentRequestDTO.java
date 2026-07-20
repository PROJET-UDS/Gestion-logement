package com.immobilier.paiement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardPaymentRequestDTO {

    @NotNull(message = "La reservation est obligatoire")
    private Long reservationId;

    @NotNull(message = "L'utilisateur est obligatoire")
    private String userId;

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit etre positif")
    private Double amount;

    @NotBlank(message = "Le nom du titulaire est obligatoire")
    private String cardholderName;

    @NotBlank(message = "Le numero de carte est obligatoire")
    private String cardNumber;

    @NotBlank(message = "La date d'expiration est obligatoire")
    private String expiryDate;

    @NotBlank(message = "Le CVV est obligatoire")
    private String cvv;

    @NotBlank(message = "La cle d'idempotence est obligatoire")
    private String idempotencyKey;
}
