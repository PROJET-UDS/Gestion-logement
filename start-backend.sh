#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/src/back-end"
export JWT_SECRET="${JWT_SECRET:-cle_secrete_pour_le_jwt_2024_avec_256_bits_minimum}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[ATTENTION]${NC} $1"; }
err()  { echo -e "${RED}[ERREUR]${NC} $1"; }

# Utiliser Java 21 si disponible (le projet nécessite Java 21, pas Java 25+)
if [ -d "$HOME/.sdkman/candidates/java/21.0.11-tem" ]; then
  export JAVA_HOME="$HOME/.sdkman/candidates/java/21.0.11-tem"
  export PATH="$JAVA_HOME/bin:$PATH"
  log "Java 21 détecté (via sdkman)"
fi

cleanup() {
  log "Arrêt des services en arrière-plan..."
  kill $DISCOVER_PID $AUTH_PID $USER_PID $LOGEMENT_PID $RESERVATION_PID $PAIEMENT_PID $MESSAGERIE_PID $GATEWAY_PID 2>/dev/null
  wait 2>/dev/null
  log "Tous les services arrêtés."
}
trap cleanup EXIT INT TERM

log "============================================="
log "  GESTION LOGEMENT - DÉMARRAGE BACKEND"
log "============================================="

# ─── 1. Infrastructure (PostgreSQL + RabbitMQ) ───
log "Démarrage de PostgreSQL et RabbitMQ (Docker)..."
cd "$ROOT_DIR"
docker compose up -d postgres rabbitmq mailhog

log "Attente de PostgreSQL (port hôte 5433)..."
until docker exec postgres pg_isready -U immobilier -q 2>/dev/null; do sleep 2; done
log "PostgreSQL prêt."

log "Création des bases de données si nécessaire..."
docker exec -i postgres psql -U immobilier -d postgres <<'SQL' 2>/dev/null
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
SQL
log "Bases de données prêtes."

# ─── 2. Compilation ───
log "Compilation de tous les services..."
cd "$BACKEND_DIR"
mvn clean install -DskipTests -q
log "Compilation terminée."

# ─── 3. Discovery (Eureka) ───
log "Démarrage du service de découverte (Eureka) sur le port 8761..."
cd "$BACKEND_DIR/discover"
mvn spring-boot:run -DskipTests > /tmp/discover.log 2>&1 &
DISCOVER_PID=$!
log "  discover PID: $DISCOVER_PID"

log "Attente de Eureka..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8761/actuator/health > /dev/null 2>&1; then
    log "Eureka prêt !"
    break
  fi
  if [ $i -eq 30 ]; then
    warn "Eureka ne répond pas après 60s, vérifie /tmp/discover.log"
  fi
  sleep 2
done

# ─── 4. Variables d'environnement communes ───
ENV_COMMON="DB_USERNAME=immobilier DB_PASSWORD=secret \
  RABBITMQ_HOST=localhost RABBITMQ_PORT=5672 \
  RABBITMQ_USERNAME=immobilier RABBITMQ_PASSWORD=secret \
  EUREKA_URL=http://localhost:8761/eureka/ JWT_SECRET=$JWT_SECRET"

ENV_AUTH="DB_URL=jdbc:postgresql://localhost:5433/auth_db $ENV_COMMON"
ENV_USER="DB_URL=jdbc:postgresql://localhost:5433/user_db $ENV_COMMON"
ENV_LOGEMENT="DB_URL=jdbc:postgresql://localhost:5433/logement_db $ENV_COMMON"
ENV_RESERVATION="DB_URL=jdbc:postgresql://localhost:5433/reservation_db $ENV_COMMON"
ENV_PAIEMENT="DB_URL=jdbc:postgresql://localhost:5433/payment_db $ENV_COMMON"
ENV_MESSAGERIE="DB_URL=jdbc:postgresql://localhost:5433/messagerie_db $ENV_COMMON"
ENV_GATEWAY="EUREKA_URL=http://localhost:8761/eureka/"

# ─── 5. Démarrage des services ───
log "Démarrage des services métier..."

start_svc() {
  name=$1 port=$2 env=$3
  cd "$BACKEND_DIR/$name"
  eval "env $env mvn spring-boot:run -DskipTests > /tmp/$name.log 2>&1 &"
  pid=$!
  upname=$(echo "$name" | tr 'a-z' 'A-Z')
  eval "${upname}_PID=$pid"
  log "  $name lancé (port $port, PID $pid)"
}

start_svc auth     8081 "$ENV_AUTH"
sleep 5
start_svc user     8082 "$ENV_USER"
start_svc logement 8083 "$ENV_LOGEMENT"
start_svc reservation 8084 "$ENV_RESERVATION"
start_svc paiement 8085 "$ENV_PAIEMENT"
start_svc messagerie 8086 "$ENV_MESSAGERIE"
sleep 3
start_svc gateway  8089 "$ENV_GATEWAY"

sleep 3

# ─── 6. Vérification ───
log "============================================="
log "  VÉRIFICATION DES SERVICES"
log "============================================="

check_svc() {
  display=$1 svc=$2 url=$3
  log "  Attente de $display..."
  for i in $(seq 1 60); do
    if curl -sf "$url" > /dev/null 2>&1; then
      log "  ✅ $display répond ($url)"
      return 0
    fi
    sleep 2
  done
  warn "  ⚠️  $display pas encore prêt après 2min — consulte /tmp/$svc.log"
}

check_svc "Eureka"     "discover"     "http://localhost:8761/actuator/health"
check_svc "Auth"       "auth"         "http://localhost:8081/actuator/health"
check_svc "User"       "user"         "http://localhost:8082/actuator/health"
check_svc "Logement"   "logement"     "http://localhost:8083/actuator/health"
check_svc "Réservation" "reservation" "http://localhost:8084/actuator/health"
check_svc "Paiement"  "paiement"    "http://localhost:8085/actuator/health"
check_svc "Messagerie" "messagerie"   "http://localhost:8086/actuator/health"
check_svc "Gateway"    "gateway"      "http://localhost:8089/actuator/health"

log ""
log "============================================="
log "  RÉCAPITULATIF"
log "============================================="
log ""
log "  PostgreSQL : localhost:5433 (port hôte)"
log "  RabbitMQ   : localhost:15672 (admin: immobilier/secret)"
log "  Eureka     : http://localhost:8761"
log "  Gateway    : http://localhost:8089"
log ""
log "  Surveillance : tail -f /tmp/<service>.log"
log "  Arrêt       : Ctrl+C"
log "============================================="

wait
