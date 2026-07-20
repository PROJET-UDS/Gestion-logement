package com.immobilier.messagerie.repository;

import com.immobilier.messagerie.entity.EmailHistory;
import com.immobilier.messagerie.entity.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailHistoryRepository extends JpaRepository<EmailHistory, Long> {

    Optional<EmailHistory> findByEventId(String eventId);

    boolean existsByEventId(String eventId);

    List<EmailHistory> findByRecipient(String recipient);

    List<EmailHistory> findByStatus(EmailStatus status);
}
