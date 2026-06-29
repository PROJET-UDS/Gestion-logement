
## Structure du Projet


```text
Gestion immobilier/
├── gateway/
│   └── src/main/java/com/immobilier/gateway/
│       └── GatewayApplication.java
├── config-server/
│   └── src/main/java/com/immobilier/configserver/
│       └── ConfigServerApplication.java
├── discover/
│   └── src/main/java/com/immobilier/discovery/
│       └── DiscoverApplication.java
├── auth/
│   └── src/main/java/com/immobilier/auth/
├── user/
│   └── src/main/java/com/immobilier/user/
├── logement/
│   └── src/main/java/com/immobilier/logement/
├── reservation/
│   └── src/main/java/com/immobilier/reservation/
├── paiement/
│   └── src/main/java/com/immobilier/paiement/
├── messagerie/
│   └── src/main/java/com/immobilier/messagerie/
└── shared-lib/
    └── src/main/java/com/immobilier/shared/
```

## Structure de la Bibliothèque Partagée (shared-lib)


```text
shared-lib/src/main/java/com/immobilier/shared/
├── constants/
│   └── package-info.java
├── dto/
│   └── JwtClaims.java
├── enums/
│   ├── PlanAbonnement.java
│   ├── StatutPaiement.java
│   ├── StatutReservation.java
│   ├── TypeTransaction.java
│   └── UserRole.java
├── events/
│   ├── AbonnementActiveEvent.java
│   ├── PaiementConfirmeEvent.java
│   ├── ReservationConfirmeeEvent.java
│   ├── UserRegisteredEvent.java
│   └── UserRoleChangedEvent.java
├── exceptions/
│   └── GatewayException.java
└── utils/
    └── package-info.java
```

## Microservice Structure

```text
name/src/main/java/com/immobilier/<context>/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── mapper/
├── config/
├── security/
├── exception/
├── rabbitmq/
└── <Name>Application.java
```

Current contexts:

```text
auth          -> com.immobilier.auth
user          -> com.immobilier.user
logement      -> com.immobilier.logement
reservation   -> com.immobilier.reservation
paiement      -> com.immobilier.paiement
messagerie    -> com.immobilier.messagerie
```

Infrastructure modules use:

```text
api-gateway     -> com.immobilier.gateway
config-server   -> com.immobilier.configserver
discover   -> com.immobilier.discovery
```

## Exception System


```text
*/src/main/java/com/immobilier/<context>/exception/GlobalExceptionHandler.java
```

Rules:

- `shared-lib` exposes only framework-agnostic exceptions.
- HTTP mapping is handled by each service through its own `@RestControllerAdvice`.
- Local exception classes no longer use `@ResponseStatus`.
- Validation errors remain handled at service boundary level.

## Spring Cloud Boundaries

- Eureka discovery remains in `discover`.
- Config Server remains in `config-server`.
- The Gateway remains its own application module.
- rabbitmq publishers and consumers remain local to the owning microservice.
- Feign clients remain local to the consuming service, for example `user/src/main/java/com/immobilier/user/client/UserServiceClient.java`.
- DTOs are service-local unless they represent a real cross-service contract.

## Deleted Files

The following duplicated or invalid shared files were removed:

```text
shared-lib/src/main/java/com/immobilier/shared/exceptions/GlobalExceptionHandler.java
logement/src/main/java/com/immobilier/logement/logementApplication.java
messagerie/src/main/java/com/immobilier/messagerie/messagerieApplication.java
notification/src/main/java/com/immobilier/
paiement/src/main/java/com/immobilier/paiement/paiementApplication.java
reservation/src/main/java/com/immobilier/reservation/reservationApplication.java
```

## Move Summary

Package roots were migrated as follows:

```text
com.immobilier.gateway          -> com.immobilier.gateway
com.immobilier.discover        -> com.immobilier.discovery
com.immobilier.auth         -> com.immobilier.auth
com.immobilier.user         -> com.immobilier.user
com.immobilier.logement     -> com.immobilier.logement
com.immobilier.reservation  -> com.immobilier.reservation
com.immobilier.paiement     -> com.immobilier.paiement
com.immobilier.messagerie   -> com.immobilier.messagerie

```

Layer packages were migrated as follows:

```text
controllers  -> controller
services     -> service
repositories -> repository
entities     -> entity
dtos         -> dto
mappers      -> mapper
exceptions   -> exception
```

Additional moves:

```text
*/config/SecurityConfig.java                  -> */security/SecurityConfig.java
shared/security/JwtClaims.java                -> shared/dto/JwtClaims.java
logement/spec/LogementSpecification.java -> logement/repository/specification/LogementSpecification.java
paiement/provider/*                   -> paiement/service/provider/*
```

## Migration Steps

1. Keep Maven module names unchanged to avoid breaking Docker, artifact names, and parent POM module declarations.
2. Rename Java packages to bounded-context names.
3. Move source files to directories matching their package declarations.
4. Remove duplicate lowercase `*Application` classes.
5. Remove Spring MVC exception handling from `shared-lib`.
6. Keep one `GlobalExceptionHandler` per microservice.
7. Move security configuration into each service's `security` package.
8. Normalize Java files to UTF-8 without BOM.
9. Validate with:

```bash
mvn clean install -DskipTests
```

## Verification

The full Maven reactor build succeeds with Java 21 and Spring Boot 3.3 / Spring Cloud 2023:

```text
BUILD SUCCESS
Modules built: parent, shared-lib, config-server, discover, gateway,
auth, user, logement, reservation,
paiement, messagerie.
```

Tests were skipped as requested by the build command, so this validates compilation and packaging, not runtime integration behavior.
