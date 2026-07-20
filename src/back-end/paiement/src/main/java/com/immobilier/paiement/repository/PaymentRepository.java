package com.immobilier.paiement.repository;

import com.immobilier.paiement.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByReservationId(Long reservationId);

    List<Payment> findByUserId(String userId);

    Optional<Payment> findByTransactionRef(String transactionRef);

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
}