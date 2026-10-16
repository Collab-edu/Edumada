# Edumada — Back-office

Application de gestion séparée du site public, pour :

- **les établissements** : tableau de bord, fiche, offres, demandes et candidatures, statistiques, campagnes, formule et factures ;
- **l'équipe Edumada (administrateurs)** : indicateurs de la plateforme, validation et vérification des fiches, modération, utilisateurs, catalogue, facturation, journal d'audit. Un administrateur peut aussi « gérer » n'importe quelle fiche.

Les étudiants n'utilisent pas le back-office : leur espace (favoris, demandes, candidatures) reste sur le site.

## Stack

- React 19 + Vite, routage par `#` (hébergeable sur n'importe quel serveur statique)
- [CoreUI Free React Admin Template](https://github.com/coreui/coreui-free-react-admin-template) (licence MIT) : barre latérale, en-tête, tuiles, graphiques Chart.js
- Même API que le site : [`backend/`](../backend/README.md)

## Démarrer

```bash
npm install
cp .env.example .env.local   # VITE_API_URL et VITE_SITE_URL
npm run dev                  # http://localhost:5173
npm run build                # build/ (fichiers statiques)
npm run lint
```

L'API doit autoriser l'origine du back-office : `FRONTEND_URLS` dans `backend/.env` (http://localhost:5173 en local). `BACKOFFICE_URL` y sert aux liens des e-mails envoyés aux établissements.

## Organisation

```
src/
  App.jsx            Connexion, puis pages protégées (établissement ou administrateur)
  _nav.jsx           Menu latéral selon le type de compte
  routes.js          Pages, rôles autorisés, pages qui portent sur l'établissement géré
  context/           Session, établissement géré, notifications
  lib/               Client de l'API, formats (Ar, dates), useApi
  components/        Mise en page CoreUI et composants communs (ui.jsx)
  views/
    dashboard/       Tableau de bord (établissement ou administration) et graphiques
    establishment/   Fiche, offres, demandes, statistiques, campagnes, formule, factures
    admin/           Établissements, modération, utilisateurs, catalogue, facturation, journal
    account/         Mon compte
```

## Établissement géré

Un compte établissement peut gérer plusieurs fiches : le sélecteur de l'en-tête permet de passer de l'une à l'autre. Un administrateur choisit une fiche avec « Gérer » dans la liste des établissements. Un lien `#/demandes?e=<fiche>` (e-mails) ouvre directement la bonne fiche.
