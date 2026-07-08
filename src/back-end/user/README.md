# Microservice User

Ce microservice gere les profils applicatifs des utilisateurs de la plateforme Gestion Logement. Il complete le microservice `auth`, qui reste responsable de l'inscription, de la connexion, des mots de passe et de la generation des tokens JWT.

## Role du microservice

Le service `user` stocke et expose les informations de profil utiles au reste de l'application :

- identifiant utilisateur partage avec `auth`
- email
- nom complet
- telephone
- role utilisateur
- statut actif
- dates de creation et de mise a jour

La table principale est `user_profiles`.

## Fonctionnalites implementees

### Gestion des profils

Le service fournit une API REST sous `/users` :

| Methode | Endpoint | Description | Acces |
| --- | --- | --- | --- |
| `GET` | `/users/me` | Recupere le profil de l'utilisateur connecte | utilisateur authentifie |
| `PUT` | `/users/me` | Met a jour le nom complet et le telephone de l'utilisateur connecte | utilisateur authentifie |
| `GET` | `/users/{userId}` | Recupere un profil par id | proprietaire du profil ou admin |
| `GET` | `/users` | Liste tous les profils | admin uniquement |
| `GET` | `/users/health` | Verifie que le service est demarre | public |

Si un utilisateur authentifie appelle `/users/me` avant que l'evenement RabbitMQ d'inscription ne soit consomme, le profil minimal est cree automatiquement a partir des claims du token JWT.

### Synchronisation avec le microservice Auth

Le microservice ecoute les evenements publies par `auth` sur RabbitMQ :

- `auth.user.registered` : creation ou mise a jour du profil utilisateur apres inscription
- `auth.user.role.changed` : synchronisation du role utilisateur apres changement de role

Les evenements utilises viennent de `shared-lib` :

- `UserRegisteredEvent`
- `UserRoleChangedEvent`

La configuration RabbitMQ declare :

- exchange : `auth.exchange`
- queue inscription : `auth.user.registered`
- queue changement de role : `auth.user.role.changed`

### Securite JWT

Le service protege tous les endpoints sauf :

- `/users/health`
- `/actuator/health`

Les requetes protegees doivent contenir un header :

```http
Authorization: Bearer <access_token>
```

Le JWT est valide avec la meme cle secrete que le microservice `auth` via la variable `JWT_SECRET`.

Le service accepte uniquement les tokens de type `access`. Les refresh tokens sont refuses car ils ne contiennent pas les informations necessaires au profil (`email`, `role`).

### Gestion des erreurs

Un gestionnaire global d'exceptions renvoie des reponses JSON standardisees avec :

- `timestamp`
- `status`
- `code`
- `message`
- `errors` pour les erreurs de validation

Codes principaux :

- `USER_NOT_FOUND`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `INTERNAL_ERROR`

## Structure du code

```text
src/main/java/com/immobilier/user
|-- config       # Configuration RabbitMQ
|-- controller   # Endpoints REST
|-- dto          # Objets de requete et de reponse
|-- entity       # Entite JPA UserProfile
|-- exception    # Exceptions et handler global
|-- mapper       # Mapping entity -> DTO avec MapStruct
|-- rabbitmq     # Listeners des evenements auth
|-- repository   # Acces JPA aux profils
|-- security     # Filtre JWT et configuration Spring Security
`-- service      # Logique metier
```

## Modele de donnees

Entite : `UserProfile`

| Champ | Description |
| --- | --- |
| `id` | Identifiant utilisateur venant de `auth` |
| `email` | Email unique de l'utilisateur |
| `nomComplet` | Nom complet renseigne dans le profil |
| `telephone` | Numero de telephone |
| `role` | Role parmi `VISITEUR`, `CLIENT`, `PROPRIETAIRE`, `ADMIN` |
| `actif` | Indique si le profil est actif |
| `createdAt` | Date de creation |
| `updatedAt` | Date de derniere mise a jour |

## Configuration

Le service ecoute par defaut sur le port `8082`.

Variables attendues :

| Variable | Description |
| --- | --- |
| `DB_URL` | URL JDBC de la base PostgreSQL `user_db` |
| `DB_USERNAME` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Cle secrete utilisee pour valider les tokens JWT |
| `RABBITMQ_HOST` | Hote RabbitMQ |
| `RABBITMQ_PORT` | Port RabbitMQ |
| `RABBITMQ_USERNAME` | Utilisateur RabbitMQ |
| `RABBITMQ_PASSWORD` | Mot de passe RabbitMQ |
| `EUREKA_URL` | URL du serveur Eureka |

Extrait Docker Compose :

```yaml
user:
  ports:
    - "8082:8082"
  environment:
    DB_URL: jdbc:postgresql://postgres:5432/user_db
    DB_USERNAME: immobilier
    DB_PASSWORD: secret
    JWT_SECRET: ${JWT_SECRET}
    RABBITMQ_HOST: rabbitmq
    RABBITMQ_PORT: 5672
    RABBITMQ_USERNAME: immobilier
    RABBITMQ_PASSWORD: secret
    EUREKA_URL: http://discover:8761/eureka/
```

## Tests

Le test de contexte Spring utilise H2 en memoire pour ne pas dependre d'une instance PostgreSQL locale.

Commande de verification :

```powershell
mvn -U -pl shared-lib,user test
```

Resultat attendu :

```text
BUILD SUCCESS
```

## Notes importantes

- Le microservice `auth` reste la source de verite pour l'authentification.
- Le microservice `user` est la source de verite pour les informations de profil.
- Les profils sont synchronises par evenements RabbitMQ.
- L'endpoint `/users/me` peut recreer un profil minimal si l'evenement d'inscription n'a pas encore ete consomme.
- Le build Maven du projet parent est aligne sur Java 21, coherent avec les Dockerfiles des microservices.
