-- L'image PostgreSQL cree deja le role "immobilier" a partir de
-- POSTGRES_USER. Le recreer ici interromprait tout le script d'initialisation.

-- ============================================
-- CREATION DES BASES DE DONNEES
-- ============================================
SELECT 'CREATE DATABASE auth_db OWNER immobilier'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec
SELECT 'CREATE DATABASE user_db OWNER immobilier'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'user_db')\gexec
SELECT 'CREATE DATABASE logement_db OWNER immobilier'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'logement_db')\gexec
SELECT 'CREATE DATABASE reservation_db OWNER immobilier'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'reservation_db')\gexec
SELECT 'CREATE DATABASE payment_db OWNER immobilier'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payment_db')\gexec
SELECT 'CREATE DATABASE messagerie_db OWNER immobilier'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'messagerie_db')\gexec

-- ============================================
-- PRIVILEGES
-- ============================================
GRANT ALL PRIVILEGES ON DATABASE auth_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE user_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE logement_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE reservation_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO immobilier;
GRANT ALL PRIVILEGES ON DATABASE messagerie_db TO immobilier;
