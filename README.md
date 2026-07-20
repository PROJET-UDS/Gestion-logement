# Gestion Logement

## Architecture

- **Backend** : Microservices Spring Boot 3.4.1 / Java 21 (Maven multi-modules)
- **Frontend** : React 18 (Material Dashboard 2)
- **Infrastructure** : PostgreSQL 16, RabbitMQ, Eureka (service discovery)

### Services

| Service    | Port | Rôle |
|------------|------|------|
| discover   | 8761 | Service de découverte (Eureka) |
| gateway    | 8089 | API Gateway (Spring Cloud Gateway) |
| auth       | 8081 | Authentification et gestion des comptes |
| user       | 8082 | Gestion des utilisateurs et demandes |
| logement   | 8083 | Gestion des logements |
| reservation | 8084 | Gestion des réservations |
| payment   | 8085 | Gestion des payments, abonnements |
| messagerie | 8086 | Messagerie interne |

---

## Lancer le projet

### Prérequis

- Docker & Docker Compose
- Java 21 (via sdkman : `sdk install java 21.0.11-tem`)
- Maven 3.8+
- Node.js 18+

### Backend

```bash
# Tout-en-un (infra Docker + compilation + démarrage)
sh start-backend.sh
```

Le script :
1. Démarre PostgreSQL (port hôte **5433**) et RabbitMQ
2. Crée les bases de données (`auth_db`, `user_db`, `logement_db`, `reservation_db`, `payment_db`, `messagerie_db`)
3. Compile et installe tous les modules Maven
4. Démarre Eureka (discover) en premier
5. Démarre les services métier dans l'ordre (auth → user, logement, reservation, payment, messagerie → gateway)
6. Vérifie que chaque service répond

### Frontend

```bash
cd src/front-end
npm install
npm start
```

---

## Comptes de test

### Compte administrateur (cree automatiquement au demarrage)

| Champ        | Valeur                          |
|--------------|---------------------------------|
| Email        | `admin@gestion-logement.local`  |
| Mot de passe | `Admin@12345`                   |
| Role         | ADMIN                           |

> Ce compte est cree automatiquement au premier demarrage du service auth. Si les variables d'environnement `DEFAULT_ADMIN_EMAIL` et `DEFAULT_ADMIN_PASSWORD` sont definies, elles remplacent les valeurs par defaut.

### Comptes a creer via l'API (inscription)

Pour tester les differents roles, inscrivez-vous via `POST /api/v1/auth/register` :

```json
{
  "email": "client@test.com",
  "password": "Client@12345",
  "nom": "Dupont",
  "prenom": "Jean",
  "role": "CLIENT"
}
```

```json
{
  "email": "proprietaire@test.com",
  "password": "Proprio@12345",
  "nom": "Kamga",
  "prenom": "Paul",
  "role": "PROPRIETAIRE"
}
```

### Cartes bancaires de test (paiement simule)

| Numero             | Resultat          |
|--------------------|-------------------|
| `4242 4242 4242 4242` | Paiement accepte   |
| `4000 0000 0000 0002` | Carte refusee      |
| `4000 0000 0000 9995` | Fonds insuffisants |

- **Expiration** : toute date future (ex: `12/30`)
- **CVV** : tout code a 3 chiffres (ex: `123`)

### Acces infrastructure

| Service    | URL                        | Identifiants            |
|------------|----------------------------|-------------------------|
| RabbitMQ   | http://localhost:15672      | `immobilier` / `secret` |
| PostgreSQL | `localhost:5433`           | `immobilier` / `secret` |
| MailHog    | http://localhost:8025       | aucun                   |
| Eureka     | http://localhost:8761       | aucun                   |

---

## Arrêter les services

### Backend (services Java + Docker)

Ctrl+C dans le terminal où tourne `start-backend.sh` arrête proprement les services Java.

Si les processus Java sont orphelins :

```bash
pkill -f "com.immobilier"
```

Pour arrêter PostgreSQL et RabbitMQ :

```bash
docker compose down
```

### Frontend

Ctrl+C dans le terminal où tourne `npm start`.

---

## Consulter les logs

### Logs des services Java

Chaque service écrit ses logs dans `/tmp/<service>.log` :

```bash
tail -f /tmp/discover.log    # Eureka
tail -f /tmp/auth.log        # Authentification
tail -f /tmp/user.log        # Utilisateurs
tail -f /tmp/logement.log    # Logements
tail -f /tmp/reservation.log # Réservations
tail -f /tmp/payment.log    # payments
tail -f /tmp/messagerie.log  # Messagerie
tail -f /tmp/gateway.log     # Gateway
```

### Logs Docker

```bash
docker logs postgres
docker logs rabbitmq
```

---

## Vérifier l'état des services

```bash
# Via Eureka (dashboard web)
curl http://localhost:8761

# Via les health endpoints
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
# ... (même pattern pour les autres ports)

# Ou voir la liste des ports qui écoutent
ss -tlnp | grep -E '808[1-6]|8761|8089'
```
