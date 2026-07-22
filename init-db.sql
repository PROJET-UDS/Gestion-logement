-- Connexion en tant que postgres
-- psql -U postgres -h 127.0.0.1

-- ============================================
-- CREATION DE L'UTILISATEUR
-- ============================================
CREATE USER immobilier WITH PASSWORD 'secret';

-- ============================================
-- CREATION DES BASES DE DONNEES
-- ============================================
CREATE DATABASE auth_db OWNER immobilier;
CREATE DATABASE user_db OWNER immobilier;
CREATE DATABASE logement_db OWNER immobilier;
CREATE DATABASE reservation_db OWNER immobilier;
CREATE DATABASE payment_db OWNER immobilier;
CREATE DATABASE messagerie_db OWNER immobilier;

-- ============================================
-- PRIVILEGES
-- ============================================
GRANT ALL PRIVILEGES ON DATABASE auth_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE user_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE logement_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE reservation_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE messagerie_db TO immobilier;

-- ============================================
-- TABLES ABONNEMENT & VEDETTE (logement_db)
-- ============================================
\c logement_db;

CREATE TABLE IF NOT EXISTS t_abonnements (
    id BIGSERIAL PRIMARY KEY,
    proprietaire_id VARCHAR(255) NOT NULL,
    type_abonnement VARCHAR(50) NOT NULL,
    publications_incluses INT NOT NULL,
    publications_utilisees INT NOT NULL DEFAULT 0,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'ACTIF',
    montant_paye DOUBLE PRECISION,
    payment_ref VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abonnement_proprietaire ON t_abonnements(proprietaire_id);
CREATE INDEX IF NOT EXISTS idx_abonnement_statut ON t_abonnements(statut);

CREATE TABLE IF NOT EXISTS t_logements_en_vedette (
    id BIGSERIAL PRIMARY KEY,
    logement_id BIGINT NOT NULL,
    proprietaire_id VARCHAR(255) NOT NULL,
    type_vedette VARCHAR(50) NOT NULL,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'ACTIF',
    montant_paye DOUBLE PRECISION,
    payment_ref VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_vedette_logement FOREIGN KEY (logement_id) REFERENCES t_logements(id)
);

CREATE INDEX IF NOT EXISTS idx_vedette_logement ON t_logements_en_vedette(logement_id);
CREATE INDEX IF NOT EXISTS idx_vedette_proprietaire ON t_logements_en_vedette(proprietaire_id);

ALTER TABLE t_logements ADD COLUMN IF NOT EXISTS en_vedette BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE t_logements ADD COLUMN IF NOT EXISTS date_vedette_debut TIMESTAMP;
ALTER TABLE t_logements ADD COLUMN IF NOT EXISTS date_vedette_fin TIMESTAMP;