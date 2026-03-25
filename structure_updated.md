# Projet de Location de Voitures avec RabbitMQ

## Vue d'ensemble
Ce projet est compose de 3 parties :
- frontend (React) pour Car Rent
- car-service (Spring Boot)
- bank-service (Spring Boot)
- bank-frontend (React) pour la banque

Objectif : permettre a un utilisateur de louer une voiture.
Le `car-service` envoie une demande de verification de credit au `bank-service` via RabbitMQ.

---

## Roles (simulation UI)

Il n'y a pas de vrai systeme de securite (pas de JWT).

Dans l'app Car Rent, les roles sont simules via un ecran de login frontend :
- utilisateur `admin` / mot de passe `admin`
- utilisateur `client` / mot de passe `client`

### Admin
- gerer les voitures (CRUD)
- voir toutes les reservations

### Client
- voir les voitures
- louer une voiture
- voir le resultat de ses reservations

---

## Note importante sur la securite

Ce projet est un projet de demonstration avec des donnees simulees.
La securite n'est pas un objectif ici.
Le login sert uniquement a differencier les ecrans Admin et Client dans l'interface.

L'interface bancaire est separee et independante de l'application Car Rent.
Elle utilise un login simule `client/client`.

---

## Structure

car-renting-rabbitmq-project/
├── frontend/
├── car-service/
├── bank-service/
└── bank-frontend/

---

## Technologies
- React + Vite + Axios + React Router (front Car Rent et front Bank)
- Spring Boot
- PostgreSQL
- RabbitMQ
- Lombok

---

## Entites

### Car
- id
- brand
- model
- pricePerDay
- available

### Booking
- id
- userId
- carId
- days
- totalPrice
- status (`PENDING`, `APPROVED`, `REFUSED`)

### BankAccount
- id
- userId
- ownerName
- balance

---

## RabbitMQ

Exchange :
- `credit.exchange`

Queues :
- `credit.check.request.queue`
- `credit.check.response.queue`

Routing keys :
- `credit.check.request`
- `credit.check.response`

---

## Workflow

1. Le client cree un compte bancaire.
2. L'admin cree une voiture.
3. Le client envoie une demande de reservation.
4. `car-service` calcule `totalPrice`.
5. `car-service` envoie `CreditCheckRequest`.
6. `bank-service` verifie le solde.
7. `bank-service` envoie `CreditCheckResponse`.
8. `car-service` met a jour le statut de la reservation.
9. Le frontend Car Rent affiche le resultat.

---

## Endpoints REST

### car-service
- `POST /api/cars` (admin)
- `GET /api/cars` (admin/client)
- `GET /api/cars/{id}`
- `PUT /api/cars/{id}` (admin)
- `DELETE /api/cars/{id}` (admin)

- `POST /api/bookings` (client)
- `GET /api/bookings`
- `GET /api/bookings/{id}`

### bank-service
- `POST /api/accounts`
- `GET /api/accounts`
- `GET /api/accounts/{id}`
- `GET /api/accounts/user/{userId}`
- `PUT /api/accounts/{id}`
- `DELETE /api/accounts/{id}`

---

## Pages Frontend

### Commun
- `LoginPage` (choix Admin/Client simule via identifiants)

### Admin
- `AdminDashboard`
- `AdminCarsPage`
- `AdminBookingsPage`

### Client
- `ClientDashboard`
- `ClientCarsPage`
- `ClientBookingsPage`

### App Banque (separee)
- `BankLoginPage` (client/client)
- `BankDashboard`

---

## Composants Frontend
- `Navbar`
- `CarForm` (admin)
- `CarList`
- `BookingForm` (client)
- `BookingList`
- `AdminCarTable`
- `ClientCarGrid`

---

## Points importants
- Projet de demo avec donnees simulees
- Pas de securite reelle (pas de JWT, pas de controle d'acces backend)
- Garder un code simple et lisible
- Se concentrer sur la communication RabbitMQ
- Base de donnees PostgreSQL :
  - une base `carrent_db` (les deux services utilisent la même base, mais avec des tables séparées : `cars`, `bookings`, `bank_accounts`, `car_auth_users`, `bank_auth_users`, etc.)

---
## Annexe technique detaillee (coherence code -> APIs -> RabbitMQ)

Cette section sert a expliquer le code de facon “de bout en bout”, en montrant :
1. Qui fait quoi (Entities, Repositories, Services, Controllers)
2. Quels endpoints sont appeles (API REST)
3. Comment RabbitMQ fait la coordination asynchrone (exchange, routing keys, queues)
4. Pourquoi le frontend doit faire un polling (statut PENDING -> APPROVED/REFUSED)

### 1. Backend car-service (module “voitures / reservations”)

Le module `car-service` porte 4 responsabilites techniques principales :
1. Persistences des voitures (table `cars`)
2. Persistences des reservations (table `bookings`)
3. Authentification demo (table `car_auth_users`)
4. Orchestration asynchrone : creation d’une reservation PENDING puis traitement de la reponse credit en listener RabbitMQ

#### 1.1 Entities (model donnees -> tables PostgreSQL)

1. `Car` (table : `cars`)
   - Champs importants :
     - id
     - type, brand, model
     - rentalPricePerDay, carPrice, pricePerDay (le code utilise un seul prix effectif)
     - purchaseDate, maxPassengers, maxSpeed
     - airConditioner, automaticTransmission
     - available (bool : si la voiture peut etre reservee)
   - Le mapping JPA (annotations `@Entity` + `@Table`) sert a creer/mettre a jour la table.

2. `Booking` (table : `bookings`)
   - Champs importants :
     - id
     - userId (identifie le client, deterministe via login/register)
     - carId
     - days
     - totalPrice
     - status (enum `PENDING`, `APPROVED`, `REFUSED`)
   - Le statut est stocke en base comme un texte grace a `@Enumerated(EnumType.STRING)`. Concretement, le frontend recoit “PENDING/APPROVED/REFUSED” (et pas des nombres).

3. `AuthUser` (table : `car_auth_users`)
   - Champs importants :
     - username (cle primaire)
     - password (stockage en clair pour demo uniquement)
   - Sert uniquement a verifier login/register pour l’interface Car Rent.

#### 1.2 Repositories (Acces BD)

Le module utilise des repositories Spring Data :
1. `CarRepository extends JpaRepository<Car, Long>`
2. `BookingRepository extends JpaRepository<Booking, Long>`
3. `AuthUserRepository extends JpaRepository<AuthUser, String>`

Pourquoi c’est utile :
- Au lieu d’ecrire des requetes SQL, le code utilise `save`, `findAll`, `findById`, `deleteById`, etc.

#### 1.3 Services (logique metier)

1. `CarService`
   - `create(Car car)` :
     - normalise les champs de prix :
       - si `pricePerDay` et absent, le service recupere la valeur depuis `rentalPricePerDay` (ou inversement)
     - force `available = true` (une voiture creee est disponible)
     - sauvegarde via `carRepository.save(car)`
   - `update(id, updated)` :
     - charge la voiture existante
     - remplace les champs
     - sauvegarde
   - `setAvailability(id, available)` :
     - pour 1 voiture (utile quand la reservation est APPROVED)
   - `setAllAvailability(available)` :
     - passe toutes les voitures a available=true (utilise par le bouton “Rendre toutes disponibles”)
   - Ces methodes expliquent la coherence : le frontend “disponibilite” modifie directement l’entree persistante que le client lit ensuite via `GET /api/cars`.

2. `BookingService`
   - `create(CreateBookingRequest request)` :
     - verifie :
       - `carService.findById(request.carId)` existe
       - et `car.isAvailable()` est vrai
     - calcule le prix total :
       - `unitPrice` = prix effectif (pricePerDay ou rentalPricePerDay)
       - `total = unitPrice * days`
     - cree une `Booking` avec `status = PENDING`
     - sauvegarde avec `bookingRepository.save(...)`
     - puis envoie un message RabbitMQ :
       - `CreditCheckRequest(bookingId, userId, total)`
   - `handleCreditResponse(CreditCheckResponse response)` :
     - retrouve la reservation via `bookingRepository.findById(response.bookingId)`
     - met a jour :
       - si `response.approved` => status = APPROVED, et rend la voiture indisponible (`carService.setAvailability(carId, false)`)
       - sinon => status = REFUSED
     - sauvegarde

3. AuthService (login/register)
   - `register(username, password)` :
     - normalise username (minuscules, trim)
     - verifie si username existe deja via `authUserRepository.existsById`
     - sauvegarde un `AuthUser(username, password)`
     - retourne un `userId` deterministe via `UserIdGenerator`
   - `login(username, password)` :
     - retrouve le user en base
     - compare password (demo)
     - retourne le meme `userId` deterministe

#### 1.4 Controllers (REST APIs)

1. `CarController` (/api/cars)
   - `POST /api/cars` : admin cree une voiture
   - `GET /api/cars` : admin ou client lisent la liste
   - `GET /api/cars/{id}`, `PUT /api/cars/{id}`, `DELETE /api/cars/{id}`
   - Ajout “admin disponibilite” :
     - `POST /api/cars/availability/available` : rend toutes les voitures dispo
     - `POST /api/cars/{id}/availability/available` : rend 1 voiture dispo

2. `BookingController` (/api/bookings)
   - `POST /api/bookings` : client cree une reservation (initialement PENDING)
   - `GET /api/bookings` : affiche toutes les reservations (admin pour demo)
   - `GET /api/bookings/{id}` : utile pour debug

3. `AuthController` (/api/auth)
   - `POST /api/auth/register` : cree un compte
   - `POST /api/auth/login` : verifie identifiants

Note importante :
- Les controllers contiennent aussi les annotations CORS. Si CORS n’est pas coherent, tu vois “Network Error” sur le frontend.

---
### 2. Backend bank-service (module “banque / credit”)

Le module `bank-service` a une logique similaire, mais avec d’autres entites :
1. Persistences des comptes bancaires (table `bank_accounts`)
2. Auth demo (table `bank_auth_users`)
3. Traitement du credit en listener RabbitMQ : debit si possible, reponse envoyee ensuite

#### 2.1 Entities
1. `BankAccount` (table `bank_accounts`)
   - id
   - userId
   - ownerName
   - balance

2. `AuthUser` (table `bank_auth_users`)
   - username + password pour demo

#### 2.2 Repositories
1. `BankAccountRepository extends JpaRepository<BankAccount, Long>`
   - ajoute `findByUserId(Long userId)` pour retrouver le compte du client

2. `AuthUserRepository extends JpaRepository<AuthUser, String>`

#### 2.3 Services
1. `BankAccountService`
   - `debit(userId, amount)` :
     - retrouve le compte via `findByUserId`
     - si balance insuffisante (ou compte introuvable) => return false
     - sinon soustrait et sauvegarde

2. `AuthService` login/register :
   - identique a car-service : sauvegarde AuthUser et retourne `userId` deterministe

#### 2.4 Listener RabbitMQ (Credit)
1. `CreditCheckListener`
   - `@RabbitListener(queues = RabbitConfig.CREDIT_CHECK_REQUEST_QUEUE)`
   - quand un message `CreditCheckRequest` arrive :
     - appelle `bankAccountService.debit(request.userId, request.amount)`
     - construit `CreditCheckResponse(bookingId, approved, reason)`
     - envoie reponse via `RabbitTemplate.convertAndSend(exchange, routingKey, response)`

---
### 3. Frontend (Car Rent + Bank)

#### 3.1 Couche API (Axios)
Chaque frontend a un fichier `services/api.js` :
1. `frontend/src/services/api.js` :
   - baseURL = `http://localhost:8081/api`
2. `bank-frontend/src/services/api.js` :
   - baseURL = `http://localhost:8082/api`

Donc toutes les requetes du frontend sont “prefixees” par ces URLs.

#### 3.2 Login Car Rent
`frontend/src/pages/LoginPage.jsx`
1. Mode Admin (demo) :
   - l’admin reste “hardcoded” :
     - admin/admin
   - le frontend ne fait pas d’appel register/login, il place direct `carrent_role=admin` et navigue.
2. Mode Client :
   - register : `POST /api/auth/register` (car-service)
   - login : `POST /api/auth/login` (car-service)
   - puis `localStorage` :
     - `carrent_username`
     - `carrent_userId` (recupere dans `res.data.userId`)
   - navigue vers `/client`

#### 3.3 Client : reservation et polling
`frontend/src/pages/ClientDashboard.jsx`
1. Affichage des voitures :
   - `GET /api/cars`
2. Creation reservation :
   - `POST /api/bookings` avec :
     - userId
     - carId
     - days
3. Pourquoi le polling ?
   - la creation renvoie une booking avec `status = PENDING`
   - la reponse credit arrive “plus tard” via RabbitMQ
   - donc le frontend fait une boucle jusqu’a 10 secondes :
     - `GET /api/bookings`
     - trouve la bookingId creee
     - stop si `status != "PENDING"`
4. Une fois le statut final recu :
   - le frontend rafraichit aussi les voitures pour mettre a jour `available`.

#### 3.4 Admin : CRUD voitures + boutons de reset disponibilite
`frontend/src/pages/AdminDashboard.jsx`
1. CRUD voiture :
   - `POST /api/cars`
   - `GET /api/cars`
2. Reset “toutes disponibles” :
   - `POST /api/cars/availability/available`
3. Reset “une voiture” :
   - `POST /api/cars/{id}/availability/available`

---
### 4. RabbitMQ : explanation pas a pas (coherence avec le code)

RabbitMQ sert de “tampon” et d’intermediaire asynchrone entre services.

#### 4.1 Configuration dans le code
Dans `car-service/src/main/java/.../config/RabbitConfig.java` :
1. Exchange :
   - `EXCHANGE = "credit.exchange"`
2. Queue request (nom) :
   - `CREDIT_CHECK_REQUEST_QUEUE = "credit.check.request.queue"`
   - (la queue request est utilisee cote bank-service, mais le nom est partage)
3. Queue response :
   - `CREDIT_CHECK_RESPONSE_QUEUE = "credit.check.response.queue"`
4. Routing keys :
   - `CREDIT_CHECK_REQUEST_KEY = "credit.check.request"`
   - `CREDIT_CHECK_RESPONSE_KEY = "credit.check.response"`
5. Il cree un `DirectExchange` (type direct) :
   - un message est route vers une queue qui est bind avec la meme routing key.
6. Il utilise un `Jackson2JsonMessageConverter` :
   - les DTO (`CreditCheckRequest`, `CreditCheckResponse`) sont serialises en JSON
   - et inversement lors de la reception

Bank config fait pareil, mais :
- declare la queue request + le listener qui consomme request
- declare la queue response + binder

#### 4.2 Flux “reservation -> credit -> statut”

1. Le client appelle `POST /api/bookings`
   - controller -> bookingService.create(request)
2. car-service valide et cree la reservation en base :
   - status = PENDING
3. car-service envoie un message RabbitMQ :
   - `rabbitTemplate.convertAndSend(EXCHANGE, CREDIT_CHECK_REQUEST_KEY, checkRequest)`
   - checkRequest = { bookingId, userId, amount }
4. Exchange `credit.exchange` (type direct) recoit le message :
   - il regarde la routing key = `credit.check.request`
   - il route vers toutes les queues bindées avec cette routing key
5. bank-service consomme le message :
   - `@RabbitListener(queues = credit.check.request.queue)`
6. bank-service calcule le credit :
   - debit(userId, amount)
   - construit une `CreditCheckResponse` :
     - bookingId (pour correlation)
     - approved (true/false)
     - reason (texte explicatif)
7. bank-service renvoie la reponse :
   - `convertAndSend(EXCHANGE, CREDIT_CHECK_RESPONSE_KEY, response)`
   - routing key = `credit.check.response`
8. car-service consomme la reponse :
   - `@RabbitListener(queues = credit.check.response.queue)`
   - listener -> bookingService.handleCreditResponse(response)
9. bookingService met a jour la reservation en base :
   - status = APPROVED ou REFUSED
   - et pour APPROVED, la voiture passe a `available=false`
10. Le frontend recupere ensuite le status en polling :
   - `GET /api/bookings`

#### 4.3 Pourquoi on a deux queues (request vs response) ?
Pour eviter que :
- une reponse credit arrive dans le meme flux que les demandes
- le service n’ait pas de moyen clair de “corréler” la reponse a un booking

Ici la correlation se fait avec `bookingId` dans les DTO.

---
### 5. Exemple de payloads (JSON) pour comprendre les appels

#### 5.1 Create booking (REST)
Requete :
POST /api/bookings
Body :
{
  "userId": 123,
  "carId": 1,
  "days": 3
}
Reponse immediate :
{
  "id": 10,
  "userId": 123,
  "carId": 1,
  "days": 3,
  "totalPrice": 150,
  "status": "PENDING"
}

#### 5.2 Message RabbitMQ request
Exchange = credit.exchange
RoutingKey = credit.check.request
Body (serialise JSON par Jackson) :
{
  "bookingId": 10,
  "userId": 123,
  "amount": 150
}

#### 5.3 Message RabbitMQ response
Exchange = credit.exchange
RoutingKey = credit.check.response
Body :
{
  "bookingId": 10,
  "approved": true,
  "reason": "Approved"
}

---
### 6. Points de coherence a retenir (pour expliquer a l’oral)

1. Les endpoints REST servent a declencher une action (creation booking, creation compte, CRUD voiture).
2. RabbitMQ sert a faire le calcul “credit” sans bloquer l’UI.
3. La base PostgreSQL sert de source de verite :
   - booking et status sont persistés
   - donc le polling frontend peut relire l’etat mis a jour.
4. Les bouton “disponibilite” de l’admin modifient la meme colonne `available` que le client lit ensuite.
5. Le statut visible au client est coherent car :
   - le backend stocke le status dans `bookings`
   - le frontend affiche `APPROVED/REFUSED/PENDING` tels quels.

