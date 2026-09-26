# Eco'Driver — reprise de chantier

État au commit `bac13e3`. À lire avec `CLAUDE.md` (règles non négociables) et
`README.md` (installation).

## Accès

| | |
|---|---|
| Dépôt | `skyywtf-maker/ecodriver` (GitHub, **public**) |
| Local | `C:\Users\nohar\Documents\NH\AchMedia\SAAS\EcoDriverVTC\ecodriver` |
| Production | https://eco-driver.vercel.app |
| Projet Vercel | `ecodriver`, compte `skyywtf-5728` (CLI déjà authentifiée sur ce poste) |
| Base | Neon, Francfort, créée via l'intégration Vercel |
| Espace chauffeur | `/chauffeur/connexion` — `vtcstrasbourg.ecodriver@gmail.com` |

Le déploiement est automatique à chaque `git push` sur `main`.

## Client

Chauffeur VTC indépendant à Strasbourg, client d'AchMedia. Le site est passé
d'un booking mono-véhicule à un service multi-véhicules et multi-prestations,
étendu aux aéroports allemands.

**Décisions du client à respecter :**

- **Aucune personnalisation autour du chauffeur.** Pas de prénom, pas de photo,
  pas de biographie, pas de numéro EVTC en public. Les preuves de confiance
  sont présentées comme des chiffres de la marque (`TrustSection`).
- **Le véhicule est une Toyota Corolla Touring et une Mercedes Classe E**, pas
  une Tesla. Aucun argumentaire électrique : c'était une erreur factuelle
  corrigée, ne pas la réintroduire.
- Identité visuelle figée : verre dépoli, fond `#0A0B0D`, accent `#0A84FF`,
  Poppins / Montserrat / Playfair italique pour un mot d'accent. Ne pas
  introduire d'autre palette, typo ou système de composants.

## Stack

Next.js 15.5.25 (App Router) · TypeScript · Tailwind · Prisma + Postgres Neon ·
Stripe Payment Element · MapLibre + fond Carto Dark Matter · Brevo (email + SMS).

### Géocodage et itinéraires

`src/lib/geo/` choisit son fournisseur selon `MAPBOX_TOKEN` :

- **avec la clé** → Mapbox (géocodage + Directions) ;
- **sans** → Base Adresse Nationale (adresses françaises) + Photon
  (points d'intérêt OpenStreetMap) + OSRM (itinéraires).

`src/lib/geo/curated.ts` place les lieux de `src/config/places.ts` en tête des
résultats **quel que soit le fournisseur** : aucun géocodeur ne classe
« gare de strasbourg » comme un client l'entend. Aucune coordonnée n'est écrite
à la main, chaque lieu pointe vers une adresse que le géocodeur résout.

⚠️ **OSRM tourne sur un serveur de démonstration**, déconseillé en production.
Renseigner `MAPBOX_TOKEN` bascule tout le module.

## Configuration centralisée

| Fichier | Contenu |
|---|---|
| `src/config/pricing.ts` | **Les trois véhicules et leurs grilles.** Aucun prix ailleurs. |
| `src/config/site.ts` | Logo, coordonnées, villes, note Uber, chiffres de confiance |
| `src/config/services.ts` | Les cinq prestations et les points d'intérêt |
| `src/config/places.ts` | Lieux courants (gares, aéroports) résolus par le géocodeur |
| `src/config/landing.ts` | Contenu des pages de référencement local |

### Tarifs

Dictés par le chauffeur le 25 septembre 2026, dans `src/config/pricing.ts` :

- **Classique citadine** : 15 € jusqu'à 5 km, puis 2 €/km. Catégorie créée
  sans modèle arrêté — ni marque ni visuel 3D tant que le chauffeur n'a pas
  choisi le véhicule.
- **Berline confort** (Toyota Corolla) : 15 € jusqu'à 5 km, puis 2,30 €/km.
- **Voiture touring** : ⚠️ toujours sur l'ancienne grille (15 € jusqu'à 5 km,
  2 €/km jusqu'à 15 km, puis 2,30 €/km). À trancher avec le chauffeur.
- **Van / XL** (Mercedes Classe V) : 60 €/h, deux heures minimum, 25 km
  compris ; au-delà, 2,50 €/km s'ajoutent au prix horaire.
- Majoration ×1,25 la nuit (22 h – 6 h) et le week-end, toutes catégories.

## Routes

**Public** — `/`, `/reserver`, `/reserver/confirmation`, `/suivi/[id]`,
`/mentions-legales`, `/cgv`, `/confidentialite`.

**Prestations** — `/services/[service]` : `transferts-aeroport`,
`strasbourg-institutions`, `route-des-vins`, `evenementiel`, `professionnels`.

**Référencement local** — `/vtc-strasbourg`, `/vtc-aeroport-entzheim`,
`/vtc-gare-strasbourg`, `/vtc/[ville]` (12 villes), `/transfert/[lieu]`
(9 lieux). Sitemap et pied de page se remplissent automatiquement depuis
`allLandings()`.

**Chauffeur** — `/chauffeur/connexion`, `/mot-de-passe-oublie[/token]`,
`/tableau-de-bord`, `/course/[id]`, `/parametres`.

**API** — `/api/quote`, `/api/geocode`, `/api/bookings`, `/api/devis`,
`/api/stripe/webhook`, `/api/cron/purge-reservations`.

## Sécurité en place

- Mot de passe chauffeur en bcrypt, fiche en base (`Driver`), variables
  d'environnement en secours tant qu'aucune fiche n'existe.
- Session 2 h glissante, cookie `httpOnly` + `secure` + `sameSite=strict`,
  renouvelée par le middleware à chaque page.
- `requireDriver()` sur **chaque** page et action chauffeur : le middleware ne
  suffit pas.
- Limitation par IP : 5 connexions / 15 min, 5 réservations / 10 min, 5 devis /
  15 min, 60 devis de prix / min, 120 géocodages / min. **En mémoire**, donc non
  partagée entre instances serverless — suffisant contre un script, pas contre
  un attaquant déterminé. Un magasin partagé (Upstash, Vercel KV) reste à faire.
- Réinitialisation de mot de passe : jeton à usage unique, une heure, **seule
  son empreinte est stockée**, consommation et changement dans une transaction.
- Aucune donnée bancaire côté serveur, uniquement `stripePaymentIntentId`.

## Pièges rencontrés, à ne pas réintroduire

1. **`next dev` et `next build` écrivent dans `.next`.** Vérifier un build
   pendant que le serveur tourne lui efface ses fichiers et la page s'affiche
   sans CSS. Utiliser `NEXT_DIST_DIR=.next-verify npm run build`.
2. **MapLibre doit rester en v5.** La v6 n'émet pas son worker sous webpack :
   aucune tuile n'est demandée, la carte reste noire, sans erreur.
3. **Le CSS de MapLibre s'importe dans `layout.tsx`, avant `globals.css`.** Il
   déclare `.maplibregl-map { position: relative }` et écrase sinon
   `absolute inset-0` : le conteneur tombe à zéro pixel de haut.
4. **`backdrop-filter` crée une racine de fond.** Un élément en verre dépoli
   imbriqué dans un autre ne floute que son parent, pas la page. Le menu mobile
   et la liste de suggestions ont dû passer en fond opaque.
5. **`??` ne se déclenche pas sur une chaîne vide.** Une variable d'environnement
   définie mais vide passait au travers et `new URL("")` cassait tout le build
   Vercel.
6. **`Box3.setFromObject` mesure en espace monde.** Mesurer un objet déjà monté
   dans un groupe mis à l'échelle revient à mesurer son propre redimensionnement.
   Mesurer sur un clone détaché, avec `precise`.
7. **Ne pas rédiger de fichier volumineux par heredoc bash** : les backticks des
   gabarits TypeScript cassent le parseur. Utiliser l'outil d'écriture.

## Ce qui reste à faire

### Bloquant

- **`BREVO_API_KEY` sur Vercel.** Sans elle, les emails et SMS sont seulement
  journalisés : ni notification de course, ni demande de devis ne partent.

### Demandé, pas encore fait

- **Google Maps** (Maps JavaScript API + Distance Matrix) en remplacement de
  MapLibre et OSRM, avec clé restreinte par domaine et **plafond de facturation
  fixé dès l'activation**. Le client a demandé de garder ça pour la fin.
- Visuels des véhicules (`public/vehicules/*.jpg`) et des points d'intérêt
  tourisme (`public/tourisme/*.jpg`) : les chemins existent, les fichiers non.
- Webhook Stripe de production à créer sur le compte du chauffeur :
  `https://eco-driver.vercel.app/api/stripe/webhook`, événement
  `payment_intent.succeeded`, puis `STRIPE_WEBHOOK_SECRET` et redéploiement.

### Contenu à compléter

Placeholders entre crochets dans `src/config/site.ts` et les pages légales :
email de contact, raison sociale, SIRET, adresse, **numéro EVTC** (mentions
légales uniquement, jamais en page publique). Tarifs à faire valider.

## Méthode de travail attendue

- Petits commits clairs, **messages en français**.
- Expliquer avant toute modification importante de structure.
- Signaler chaque placeholder entre crochets restant.
- Ne rien inventer de vérifiable sur l'entreprise : pas de fausse note, pas
  d'avis fabriqué, pas de caractéristique que le véhicule n'a pas. La note
  4,99 / 5 sur 500 courses vient du profil Uber réel et est datée dans le code.
- Vérifier dans le navigateur, pas seulement au build.
