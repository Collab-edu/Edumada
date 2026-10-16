# Edumada — Back-office

Application de gestion séparée du site public, pour :

- **les établissements** : tableau de bord, fiche, offres, demandes et candidatures, statistiques, campagnes, formule et factures ;
- **l'équipe Edumada (administrateurs)** : indicateurs de la plateforme, validation et vérification des fiches, modération, utilisateurs, catalogue, facturation, journal d'audit. Un administrateur peut aussi « gérer » n'importe quelle fiche.

Les étudiants n'utilisent pas le back-office : leur espace (favoris, demandes, candidatures) reste sur le site.

## Stack

- Next.js 15 (App Router) + TypeScript, export statique (`output: 'export'`, hébergeable sur n'importe quel serveur statique)
- Composants [CoreUI](https://coreui.io/react/) (licence MIT) : barre latérale, en-tête, tuiles, graphiques Chart.js
- Thème aux couleurs d'Edumada (`src/app/globals.scss`) : barre latérale sarcelle, bandeau coloré en tête de page, tuiles en dégradé, mode sombre
- Même API que le site : [`backend/`](../backend/README.md)

## Démarrer

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL et NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:5173
npm run build                # out/ (fichiers statiques)
npm run lint
```

L'API doit autoriser l'origine du back-office : `FRONTEND_URLS` dans `backend/.env` (http://localhost:5173 en local). `BACKOFFICE_URL` y sert aux liens des e-mails envoyés aux établissements.

## Organisation

```
src/
  app/
    connexion/       Écran de connexion
    (app)/           Pages protégées (établissement ou administrateur) : layout.tsx = barre latérale,
                     en-tête et contrôle d'accès ; un dossier par page (page.tsx → src/views/…)
    globals.scss     Thème CoreUI aux couleurs d'Edumada
  nav.tsx            Menu latéral selon le type de compte
  routes.ts          Titre, description, icône, rôles autorisés de chaque page
  context/           Session, établissement géré, notifications, état de la barre latérale
  lib/               Client de l'API, types de l'API, formats (Ar, dates), useApi
  components/        Mise en page CoreUI, bandeau de page et composants communs (ui.tsx)
  views/
    dashboard/       Tableau de bord (établissement ou administration) et graphiques
    establishment/   Fiche, offres, demandes, statistiques, campagnes, formule, factures
    admin/           Établissements, modération, utilisateurs, catalogue, facturation, journal
    account/         Mon compte
```

## Établissement géré

Un compte établissement peut gérer plusieurs fiches : le sélecteur de l'en-tête permet de passer de l'une à l'autre. Un administrateur choisit une fiche avec « Gérer » dans la liste des établissements. Un lien `/demandes/?e=<fiche>` (e-mails) ouvre directement la bonne fiche.

Les pages qui portent sur un élément précis prennent un paramètre d'URL (export statique) : `/offres/modifier/?id=…`, `/demandes/?id=…`, `/facture/?id=…`, `/revendiquer/?fiche=…`.
