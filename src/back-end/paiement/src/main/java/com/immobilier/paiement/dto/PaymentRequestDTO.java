package com.immobilier.paiement.dto;

import com.immobilier.paiement.entity.PaymentProvider;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    @NotNull(message = "La réservation est obligatoire")
    private Long reservationId;

    @NotNull(message = "L'utilisateur est obligatoire")
    private Long userId;

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit être positif")
    private Double amount;

    @NotNull(message = "Le moyen de paiement est obligatoire")
    private PaymentProvider provider;

    @NotNull(message = "Le numéro de téléphone est obligatoire")
    private String phoneNumber;
}