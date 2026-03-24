# Rapport de projet : Location de voitures avec RabbitMQ

## 1. Introduction
Ce projet est une démonstration de plateforme de location de voitures construite autour d’un principe simple : lorsqu’un utilisateur demande une réservation, le système doit vérifier s’il dispose des fonds nécessaires avant de valider la location.  
L’intérêt principal du projet est pédagogique : il met en avant une **communication asynchrone** entre deux services grâce à **RabbitMQ**, tout en conservant une expérience utilisateur claire via une interface web.

Le projet est séparé en plusieurs parties :
1. une interface web “Car Rent” (pour les clients et un espace admin),
2. deux services backend (un service “voitures/réservations” et un service “banque/crédit”),
3. une interface web “Bank” séparée pour simuler la création et la gestion de comptes bancaires.

Deux applications web distinctes :
1. **Car Rent** : `frontend` + `car-service` (interface admin/client et gestion voitures/réservations).
2. **Bank** : `bank-frontend` + `bank-service` (interface bancaire et gestion des comptes/solde).

Concrètement, chaque application web a son propre frontend et son propre backend. Elles ne partagent pas les pages ni les sessions côté navigateur : la coordination se fait uniquement côté backend pendant une réservation, via RabbitMQ (la banque répond et le service voitures met à jour le statut).

## 2. Objectifs du projet
Les objectifs principaux sont :
1. **Permettre une réservation de voiture** par un client.
2. **Vérifier la capacité financière** du client avant d’approuver la réservation.
3. Montrer un cas d’usage réaliste de **messagerie** : le backend “voitures” sollicite le backend “banque”, puis attend une réponse sans bloquer l’interface.
4. Présenter un système fonctionnel **front + back**, avec un parcours utilisateur complet et visible.

Le projet a aussi un objectif secondaire : illustrer l’organisation d’une application en plusieurs modules (frontends indépendants, services indépendants), ce qui simplifie l’évolution du projet.

## 3. Description fonctionnelle globale

### 3.1 Les rôles côté interface
Le projet ne vise pas une sécurité “production” (pas de JWT complet, pas de gestion complexe des rôles). L’objectif est de fournir un comportement réaliste de démonstration :
1. **Admin (Car Rent)** : il gère les voitures (création, affichage).
2. **Client (Car Rent)** : il consulte les voitures, sélectionne une voiture, indique une durée, et demande une réservation.
3. **Client (Bank)** : il crée un compte bancaire et règle son solde afin de permettre (ou empêcher) la validation des réservations.

### 3.2 Principes de validation d’une réservation
Quand le client tente de réserver :
1. Le système calcule le **montant total** à payer (prix de la voiture par jour multiplié par la durée).
2. Une demande de vérification est envoyée au module banque.
3. La banque détermine si le solde du client est suffisant.
4. Le résultat est renvoyé au service voitures :
   - si le solde est suffisant : réservation validée (statut “approved”),
   - sinon : réservation refusée (statut “refused”).

Un statut “en attente” peut être visible le temps que la réponse arrive, ce qui illustre l’asynchronisme.

## 4. Architecture (vue d’ensemble)

### 4.1 Interface Car Rent (web)
Le frontend Car Rent fournit :
1. une page de connexion (login),
2. un espace admin,
3. un espace client pour réserver.

L’interface est conçue pour être lisible et “web-app” : navigation claire, sections distinctes, affichage de listes (voitures / réservations) sous forme de tableaux, et indicateurs de statut.

### 4.2 Service “Car Service” (backend voitures/réservations)
Ce service gère :
1. la liste des voitures,
2. la création de réservation,
3. le calcul du montant total,
4. l’envoi de la demande de crédit (via RabbitMQ),
5. la réception de la réponse (via RabbitMQ) et la mise à jour du statut de la réservation.

L’idée est que ce service ne “décide pas seul” : il délègue la vérification à la banque.

### 4.3 Service “Bank Service” (backend banque/crédit)
Ce service simule :
1. les comptes bancaires (création, consultation, mise à jour),
2. la vérification de solde lors d’une demande de crédit,
3. le débit du compte si la réservation est approuvée,
4. le renvoi du résultat (true/false) au service voitures.

Ainsi, le service banque joue le rôle de “système externe” dans l’histoire : il valide ou refuse selon les règles de solde.

### 4.4 Interface Bank (web, séparée)
L’interface Bank est indépendante de Car Rent. Elle sert à :
1. créer un compte bancaire,
2. ajuster le solde,
3. consulter l’état du compte.

Cette séparation permet de mieux comprendre la collaboration entre services, car la banque n’est pas intégrée dans l’interface Car Rent.

## 5. Workflow utilisateur (scénario complet)

### 5.1 Étapes côté démonstration
1. **Sur l’interface Bank** : le client crée son compte et met un solde.
2. **Sur l’interface Car Rent (admin)** : l’admin crée une ou plusieurs voitures.
3. **Sur l’interface Car Rent (client)** : le client sélectionne une voiture, choisit le nombre de jours et soumet la réservation.
4. Le service “voitures” envoie une demande à la banque :
   - si solde >= montant total : la banque débite puis renvoie une réponse “approuvée”,
   - sinon : la réservation est refusée.
5. Le client voit le statut de sa réservation passer (en pratique, une mise à jour automatique est prévue côté interface).

### 5.2 Exemple de logique financière
Si le montant total calculé est **3500** et que le compte du client contient **4500**, la banque renvoie **true**, ce qui permet ensuite de valider la réservation et de réduire le solde de **3500**.

## 6. Ce que le projet démontre (pédagogie)
Ce projet met en évidence plusieurs notions importantes :
1. **Découplage** : deux services distincts qui travaillent ensemble sans être dans le même code monolithique.
2. **Asynchronisme avec RabbitMQ** : le service voitures “demande” la vérification et attend la réponse via la messagerie.
3. **Traçabilité du résultat** : la réservation évolue d’un statut “en attente” vers un statut final “approved/refused”.
4. **Expérience utilisateur** : la mécanique backend est visible côté interface (par affichage des statuts et mise à jour de la disponibilité des voitures).

## 7. RabbitMQ en bref (échanges, files et clés de routage)
RabbitMQ est utilisé comme une “boîte aux lettres” entre le service **voitures** et le service **banque**:

1. un **exchange** reçoit un message et le route vers une file selon une **routing key**,
2. la **file** (queue) stocke temporairement les messages jusqu’à ce qu’un service les consomme,
3. ainsi, le service voitures peut demander une vérification de crédit sans attendre en direct : il reçoit ensuite la réponse et met à jour le statut de la réservation.

Dans ce projet, l’échange s’appelle `credit.exchange`, et les files servent à séparer :
1. les **demandes** de vérification,
2. les **réponses** (acceptée/refusée).

## 8. Conclusion
Ce projet présente une application de location de voitures où une réservation ne devient valide qu’après vérification financière.
La particularité principale est l’utilisation de **RabbitMQ** pour coordonner deux services : le service “voitures” sollicite le service “banque”, et la réponse détermine le statut final de la réservation.
Ce projet démontre concrètement comment deux systèmes indépendants peuvent collaborer sans dépendance directe, grâce à une communication asynchrone.

