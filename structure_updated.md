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
- React + Vite + Axios + Bootstrap
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
- Bases de donnees separees :
  - `car_service_db`
  - `bank_service_db`
