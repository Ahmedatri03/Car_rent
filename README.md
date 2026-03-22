# Car Renting RabbitMQ Demo

Implementation de base du projet :
- `frontend` (React + Vite) : interface Car Rent uniquement
- `car-service` (Spring Boot)
- `bank-service` (Spring Boot)
- `bank-frontend` (React + Vite) : interface bancaire independante

## Lancer RabbitMQ

```bash
docker compose up -d
```

RabbitMQ UI: http://localhost:15672 (guest / guest)

## Lancer les services backend

Dans un terminal :
```bash
cd car-service
mvn spring-boot:run
```

Dans un autre terminal :
```bash
cd bank-service
mvn spring-boot:run
```

## Lancer l'interface Car Rent

```bash
cd frontend
npm install
npm run dev
```

## Lancer l'interface Bank (independante)

```bash
cd bank-frontend
npm install
npm run dev
```

## Login simule - Car Rent

- `admin` / `admin`
- `client` / `client`

## Login simule - Bank App

- `client` / `client`

## Note

C'est une demo avec des donnees simulees. La securite n'est pas l'objectif.
