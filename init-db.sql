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
CREATE DATABASE paiement_db OWNER immobilier;
CREATE DATABASE messagerie_db OWNER immobilier;

-- ============================================
-- PRIVILEGES
-- ============================================
GRANT ALL PRIVILEGES ON DATABASE auth_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE user_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE logement_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE reservation_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE paiement_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE messagerie_db TO immobilier;