package com.immobilier.logement.repository;

import com.immobilier.logement.entity.ValidationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValidationHistoryRepository extends JpaRepository<ValidationHistory, Long> {
    List<ValidationHistory> findByLogementIdOrderByDateDecisionDesc(Long logementId);
}
