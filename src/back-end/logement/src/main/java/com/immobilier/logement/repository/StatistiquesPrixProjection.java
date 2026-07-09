package com.immobilier.logement.repository;

public interface StatistiquesPrixProjection {
    String getVille();
    String getTypeLogement();
    Long getTotalLogements();
    Double getPrixMoyen();
    Double getPrixMin();
    Double getPrixMax();
}