# Contexte projet pour Claude Code : Eco Driver

Client d'AchMedia : un chauffeur VTC indépendant, un seul véhicule, zone Grand Est. Lire README.md pour l'installation.

## Règles non négociables

- **Le prix est toujours recalculé côté serveur** (`src/lib/quote.ts` > `buildQuote`) au moment de créer le PaymentIntent. Ne jamais faire confiance à un montant envoyé par le navigateur.
- **Tarifs uniquement dans `src/config/pricing.ts`**. Aucune valeur de prix codée en dur ailleurs.
- Les heures sont interprétées en **Europe/Paris** (`src/lib/time.ts`), jamais dans le fuseau du serveur (Vercel tourne en UTC).
- Transitions de statut **idempotentes** via `updateMany` avec le statut attendu dans le `where` (`src/lib/bookings.ts`). Le webhook Stripe et la page de confirmation peuvent tous deux appeler `markPaid`.
- Toute page et toute server action du chauffeur appelle `requireDriver()` (le middleware ne suffit pas).
- Le compte Stripe est celui du chauffeur : AchMedia ne touche pas aux fonds.
- Hors périmètre MVP : comptes clients, multi-chauffeurs, modification d'une réservation payée, avis dynamiques, GPS temps réel, app mobile, acompte.

## Design (validé par le client)

Direction « Apple / verre dépoli » sur carte sombre plein écran.
- Couleurs : fond `#0A0B0D`, texte blanc, texte secondaire `rgba(235,235,245,0.6)`, un seul accent bleu `#0A84FF` (itinéraire, focus, marqueur d'arrivée). Pas de beige ni de doré.
- Verre : classes `.glass` / `.glass-soft` dans `globals.css` (blur 36px, saturate 180 %, bordure blanche 14 %).
- Typo : Poppins 700/800 pour les titres, Montserrat pour le texte et l'interface, Playfair Display italique pour un seul mot d'accent par titre (classe `.serif-accent`). Pas d'autre police.
- Boutons principaux blancs à texte noir (`.btn-primary`), rayons 16 à 32 px, champs `.field`.
- La première chose visible sur l'accueil est la carte avec la réservation. Peu de texte.

## Écarts assumés par rapport au cahier des charges initial

- L'étape 1 (trajet + prix) est directement sur l'accueil, par choix du client. `/reserver` enchaîne coordonnées puis paiement.
- La réservation n'est créée en base qu'au clic sur « Payer » (Payment Element en mode différé), avec le statut `PENDING_PAYMENT`, puis passe en `PENDING_DRIVER` quand Stripe confirme.

## Reste à faire (v1)

- [ ] Remplacer les placeholders entre crochets (téléphone, email, modèle du véhicule, avis, mentions légales, CGV).
- [ ] Valider les tarifs réels avec le chauffeur dans `src/config/pricing.ts`.
- [x] Section véhicule : modèle 3D interactif (`src/components/vehicle/`), fiche
      technique à côté. Le GLB est compressé par `npm run model` (22,7 Mo → 2,25 Mo)
      et n'est téléchargé qu'à l'approche de la section.
- [ ] **Vérifier la licence du modèle 3D** (`public/vehicule/tesla-model-3.glb`,
      origine Sketchfab) : usage commercial autorisé ? attribution exigée ?
      Aucun champ `copyright` dans le fichier. À trancher avant la mise en ligne.
- [ ] **Corriger la fiche technique** (`SITE.vehicle.techSpecs`) : les valeurs
      actuelles sont celles d'une Model 3 Propulsion du catalogue actuel, le modèle
      3D est une 2018. Demander l'année et la version réelles à Nicolas.
- [ ] Vidéo hero éventuelle, et photo du chauffeur.
- [x] Tâche planifiée (Vercel Cron) pour supprimer les réservations `PENDING_PAYMENT` de plus de 24 h (`vercel.json` + `/api/cron/purge-reservations`, secret `CRON_SECRET`).
- [ ] Tester le parcours complet en mode test Stripe, sur mobile iOS et Android.
- [x] Favicon, image Open Graph, balises SEO locales. Pages dédiées : `/vtc-strasbourg`,
      `/vtc-aeroport-entzheim`, `/vtc-gare-strasbourg` et le gabarit `/vtc/[ville]`
      (contenu dans `src/config/landing.ts`, gabarit dans `src/components/seo/`).
      Textes à faire valider par le chauffeur, et sans aucun prix chiffré.
- [ ] v2 : rappels J-1 / H-2, conditions d'annulation client.
