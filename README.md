# Eco Driver

Site de réservation pour un chauffeur privé indépendant (Grand Est) : vitrine, réservation avec prix immédiat et paiement en ligne, suivi client, espace chauffeur.

**Stack** : Next.js 15 (App Router) · TypeScript · Tailwind · Prisma + Postgres · Stripe (Payment Element) · Mapbox (autocomplétion, itinéraire, carte) · Resend (emails) · Twilio (SMS, optionnel) · Vercel.

## Démarrage local

```bash
npm install
cp .env.example .env        # puis remplir les valeurs (voir plus bas)
npm run db:push             # crée les tables dans la base
npm run dev                 # http://localhost:3000
```

Pour recevoir les webhooks Stripe en local :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copier le whsec_... affiché dans STRIPE_WEBHOOK_SECRET
```

Carte de test Stripe : `4242 4242 4242 4242`, date future, CVC quelconque.

## Services à configurer

| Service | Où | Variables |
|---|---|---|
| Postgres | Neon (neon.tech) ou Vercel Postgres, gratuit au départ | `DATABASE_URL` |
| Stripe | **Compte du chauffeur**, Développeurs > Clés API | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Webhook Stripe | Développeurs > Webhooks > endpoint `https://<domaine>/api/stripe/webhook`, événement `payment_intent.succeeded` | `STRIPE_WEBHOOK_SECRET` |
| Mapbox | account.mapbox.com > Access tokens (restreindre le jeton public au domaine) | `MAPBOX_TOKEN`, `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Resend | resend.com, vérifier le domaine d'envoi | `RESEND_API_KEY`, `EMAIL_FROM`, `DRIVER_NOTIFICATION_EMAIL` |
| Twilio (optionnel) | twilio.com | `TWILIO_*`, `DRIVER_PHONE_E164` |
| Espace chauffeur | `npm run hash-password -- "motdepasse"` | `DRIVER_EMAIL`, `DRIVER_PASSWORD_HASH_B64`, `AUTH_SECRET` |

Sans jeton Mapbox, la carte affiche un fond statique et l'autocomplétion ne répond pas. Sans Resend, les emails sont simplement journalisés dans la console.

## Déploiement Vercel

1. Pousser le repo sur GitHub, l'importer dans Vercel.
2. Renseigner toutes les variables de `.env.example` dans Vercel (Production et Preview).
3. Lancer une fois `npx prisma db push` avec la `DATABASE_URL` de production.
4. Créer le webhook Stripe pointant vers le domaine de production.

## Où modifier quoi

- **Tarifs** (prise en charge, prix au km, majoration, plancher) : `src/config/pricing.ts`, et nulle part ailleurs.
- **Règles** (délai 90 min, passagers, bagages, région) : `src/config/pricing.ts` > `BOOKING_RULES`.
- **Textes, téléphone, villes, véhicule, avis** : `src/config/site.ts`.
- **Pages légales** : `src/app/mentions-legales`, `cgv`, `confidentialite` (textes à compléter).

## Parcours

- `/` : carte plein écran + carte de réservation (étape 1 : trajet, prix en direct).
- `/reserver` : étapes 2 (coordonnées) et 3 (paiement). Reprend l'étape 1 si aucun trajet n'est en cours.
- `/reserver/confirmation` : retour Stripe, numéro de référence, lien de suivi.
- `/suivi/[id]` : statut de la réservation.
- `/chauffeur/connexion`, `/chauffeur/tableau-de-bord`, `/chauffeur/course/[id]` : espace privé.

Statuts : `PENDING_PAYMENT` → `PENDING_DRIVER` → `CONFIRMED` → `COMPLETED`, ou `REFUSED` / `CANCELLED` (remboursement Stripe intégral automatique).
