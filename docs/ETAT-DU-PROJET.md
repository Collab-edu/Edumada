# Edumada — État du projet

*Mis à jour le 16 octobre 2026 (phases 1 à 5)*

Edumada est une plateforme pour trouver un établissement et une offre éducative à Madagascar, **de la crèche à l'université**. Ce document fait le point sur ce qui existe aujourd'hui dans le frontend.

> **Statut :** le site est branché sur l'**API Laravel** (`backend/`) : catalogue, recherche, comptes, espaces étudiant / établissement / administration et formules payantes. Sans API configurée (ou si elle ne répond pas), il retombe sur les fichiers de `public/data/`. Toutes les données sont des **exemples inventés** et devront être remplacées par de vraies informations avant la mise en ligne.

---

## 1. Stack technique

| Élément | Choix |
|---|---|
| Framework | Next.js 15 (App Router), export statique (`output: 'export'`) |
| Langage | TypeScript, React 19 |
| Style | Tailwind CSS v4 |
| Icônes | Iconify (jeu `tabler`) |
| Données | Fichiers JSON dans `public/data/` |
| Dépôt | https://github.com/Mahefa-Int/Edumada-frontend (branche `main`) |

**Principes retenus :**
- **Mobile first :** chaque page est conçue et testée d'abord sur un écran de 375 px.
- **Données séparées de l'affichage :** passer plus tard à une API ne demandera de modifier que la couche de données.
- **Catégories pilotées par les données :** ce qui s'affiche pour une crèche ou une université est décrit dans les données, pas codé en dur.

---

## 2. Pages

| Page | Adresse | Nombre |
|---|---|---|
| Accueil | `/` | 1 |
| Recherche | `/recherche` | 1 |
| Fiche établissement | `/etablissements/[id]` | 17 |
| Fiche offre (formation, niveau, accueil) | `/formations/[id]` | 42 |
| Connexion | `/signin` | 1 |
| Inscription | `/signup` | 1 |
| Page introuvable | toute adresse inexistante | 1 |

Les fiches établissement et offre sont **générées en pages HTML statiques** au moment du build, ce qui est bon pour le référencement.

### 2.1 Accueil
1. **Hero** avec titre, description, encadré de note et **barre de recherche** : catégorie, domaine, ville, type public/privé.
2. Logos partenaires (carrousel).
3. **Explorer par type d'établissement** : 5 cartes de catégories.
4. **Explorer les formations par domaine** : 8 domaines et un panneau « Explorateur ».
5. Bandeau « Inscrivez-vous ! ».
6. **Les formations à découvrir** : carrousel automatique de 12 offres.
7. **Découvrez les établissements** : carrousel automatique.
8. **Trouvez votre formation en trois étapes.**
9. Encart « Vous êtes un établissement de formation ? ».
10. Newsletter.

### 2.2 Recherche (`/recherche`)
- **Barre principale :** mot-clé, catégorie d'établissement, domaine, ville, public/privé. Sur mobile, seul le mot-clé reste en haut et les autres filtres passent dans le panneau.
- **Filtres avancés, par ordre de priorité :**
  - toujours visibles : budget, âge de l'enfant, durée, modalité, diplôme préparé, inscriptions ;
  - derrière « Plus de filtres » : établissement, langue, conditions d'admission (niveau, série du BAC), hébergement, bourses.
- **Affichage :** pastilles des filtres actifs, tri (frais, durée), résultats sur 2 colonnes, message quand rien ne correspond, panneau coulissant sur mobile.
- **Arrivée depuis l'accueil :** les choix de la barre du Hero sont transmis dans l'URL, par exemple `?categorie=Petite%20enfance&ville=Antananarivo`.

### 2.3 Fiche établissement (`/etablissements/[id]`)
- **Couverture :** logo, nom, sous-catégorie, public/privé, ville, « Fiche vérifiée ».
- **Boutons :** Appeler, Site web.
- **Contenu, dans l'ordre :**
  - À propos ;
  - **Offres**, avec un titre selon la catégorie : « Formations proposées », « Niveaux scolaires », « Accueil proposé »… Chaque offre est une carte dépliable ;
  - **Conditions d'admission :** démarche en 4 étapes, tableau des prérequis (colonnes selon la catégorie), pièces à fournir ;
  - Photos et infrastructures ;
  - **Avis**, en carrousel (« Témoignages d'étudiants », « Avis des parents »…) ;
  - FAQ de 3 questions générées automatiquement à partir des données.
- **Colonne latérale :** carte OpenStreetMap, puis informations pratiques (type, adresse, téléphone, e-mail, site, réseaux sociaux, accréditation, statut de vérification).
- **SEO :** balisage `FAQPage` pour Google.

### 2.4 Fiche offre (`/formations/[id]`)
Les sections suivent l'ordre recommandé par le cahier des charges :
1. **En-tête :**
   - établissement, logo et statut des inscriptions ;
   - informations clés : diplôme, âge ou durée, frais avec leur période ;
   - boutons Postuler (si la candidature en ligne est activée), Contacter, Favoris, Site web, Partager ;
   - date de dernière vérification.
2. **Présentation :** objectifs, compétences.
3. **Programme :** matières, programme par année ou par niveau, spécialisations, méthodes d'enseignement et évaluation. *Masqué si la catégorie n'a pas de programme.*
4. **Admission :** niveau, séries du BAC ou âge, sélection, prérequis, documents.
5. **Frais et financement :** distinction **Confirmés / Estimés**, et **« Non communiqué »** plutôt qu'un montant inventé.
6. **Organisation :** durée, rentrée, inscriptions, horaires, modalité, langues, campus, rythme, calendrier.
7. **Débouchés.** *Masqués pour les crèches et les écoles.*
8. **L'établissement :** photos, carte, coordonnées, autres offres, accréditation (affichée **uniquement si elle est vérifiée**).
9. **Comment postuler ?** en 5 étapes.
10. **Informations complémentaires :** brochure, date de vérification, FAQ.
11. **Offres similaires**, de la même catégorie.

**Navigation :**
- Sur ordinateur, une barre d'onglets collée en haut suit la section en cours et un résumé « En bref » occupe la colonne de droite.
- Sur mobile, une **barre d'action collée en bas** reste visible (Favori, Contacter, Postuler).

---

## 3. Modèle de données

Le modèle sépare trois notions : **Type d'établissement**, **Établissement** et **Offres éducatives**.

### 3.1 Les 5 catégories (`CategoryData`)

| Catégorie | Sous-catégories | Diplômes | Programme | Âge des enfants | Débouchés |
|---|---|:-:|:-:|:-:|:-:|
| Université et enseignement supérieur | Université, école supérieure, institut supérieur, grande école | ✓ | ✓ | – | ✓ |
| Crèche et petite enfance | Crèche, garderie, préscolaire, maternelle | – | – | ✓ | – |
| Formation professionnelle | Centre de formation pro, centre d'apprentissage, école technique, centre informatique, centre de langues | ✓ | ✓ | – | ✓ |
| Primaire et secondaire | École primaire, collège, lycée, établissement privé ou public | ✓ | ✓ | ✓ | – |
| Autres établissements | Établissement spécialisé, centre éducatif, organisme de formation | – | ✓ | ✓ | – |

Ces réglages (`fields`) décident des sections affichées sur les fiches.

### 3.2 Fichiers de données

| Fichier | Contenu | Chargé par |
|---|---|---|
| `public/data/data.json` | Menus, catégories, filtres, domaines, établissements, offres, avis, footer | Le navigateur, **une seule fois**, via `src/data/site-data.ts`, et le build |
| `public/data/formation-details.json` | Contenu détaillé de chaque offre (programme, frais détaillés, débouchés…) | **Seulement au build**, via `src/data/server.ts`, pour garder l'accueil léger |

**Volume actuel :**
- 5 catégories ;
- 17 établissements : 11 du supérieur, 3 de formation professionnelle, 1 crèche, 1 groupe scolaire, 1 centre spécialisé ;
- 42 offres et 38 avis.

### 3.3 Principaux types
- `SchoolType`, dans `features/etablissements/types.ts` :
  - catégorie et sous-catégorie, public/privé ;
  - coordonnées, réseaux sociaux, infrastructures ;
  - pièces à fournir, accréditation et `accreditationVerified`, statut de vérification.
- `FormationType`, dans `features/formations/types.ts`, une offre éducative :
  - `kind` (formation, niveau ou accueil), catégorie, diplôme facultatif ;
  - durée, tranche d'âge, frais et `feesPeriod` (par an ou par mois) ;
  - inscriptions, admission, modalité, langues.
- `FormationDetailType` : le contenu détaillé, avec un statut des frais (Confirmés, Estimés ou Non communiqués) et la date de dernière vérification.

---

## 4. Organisation du code

```
src/
  app/                    Routes uniquement (pages, layout, 404)
  features/
    categories/           Types et section « Explorer par type d'établissement »
    recherche/            Hero, barre de filtres, page /recherche, logique de filtrage (filters.ts)
    domaines/             Section domaines
    formations/           Cartes, carrousel, fiche offre (detail/), formats (frais, âge, dates), FAQ
    etablissements/       Cartes, carrousel, fiche établissement, admission, avis, FAQ
    auth/                 Connexion / inscription (non branchées)
    marketing/            Logos, bandeaux, étapes, newsletter
  components/
    ui/                   Composants génériques : auto-scroll, card, section-header, dot-pattern…
    layout/               Header, Footer, bouton « retour en haut »
  data/                   Accès aux données (site-data.ts côté navigateur, server.ts au build)
  lib/                    Utilitaires (cn, base-path, aos)
public/data/              Données JSON
docs/                     Documentation (ce fichier)
```

---

## 5. Charte graphique

| Rôle | Couleur | Classe Tailwind |
|---|---|---|
| Rouge principal : boutons, appels à l'action | `#FF3B52` | `primary` |
| Bleu sarcelle : titres, navigation, icônes | `#0F4C5C` | `secondary` |
| Vert doux : badges, indicateurs positifs | `#A7C4BC` | `success` |
| Rose clair : fonds décoratifs | `#FFE5E8` | `cream` |
| Blanc cassé : fond principal | `#F6F8FA` | `offwhite` |
| Gris ardoise : texte | `#334155` | `ink` |

- **Typographie :** Inter. Les `h2` font 26 px, les paragraphes 16 px, et le titre du Hero 30 px sur mobile et 45 px sur ordinateur.
- **Composants partagés :** carte avec effet de survol, en-tête de section, carrousel automatique (`AutoScroll`, avec pause au survol et répétition des listes courtes), accordéon de FAQ.
- **Mobile :** zones tactiles d'au moins 40 px, pas de défilement horizontal, barre d'action collée en bas sur la fiche offre.

---

## 6. Ce qui reste fictif ou à faire

### À remplacer avant la mise en ligne
- **Toutes les données sont des exemples :** établissements, offres, frais, dates, adresses, téléphones, sites (`.example`) et réseaux sociaux.
- **Avis et témoignages inventés :** les publier tels quels serait trompeur.
- **Note « 4.6 — 25 000 avis Google »** dans le Hero : fictive.
- **Logos Google, Microsoft, Airbnb, etc.** dans « Ils nous font confiance » : à remplacer par de vrais partenaires ou à retirer.
- **Accréditations et statuts de vérification :** exemples à vérifier réellement.

### Fait depuis (phases 1 à 5)
- **Backend Laravel** et base MySQL : voir [`backend/README.md`](../backend/README.md).
- **Données de l'API** sur tout le site, avec repli sur `public/data/` si elle est indisponible. Les fiches restent des pages statiques (SEO), mises à jour dans le navigateur ; une fiche publiée après le build s'ouvre via `/formations/voir/?id=…` (redirection automatique depuis la 404).
- **Comptes :** connexion, inscription (étudiant ou établissement), « Mon espace » dans l'en-tête.
- **Étudiant :** favoris, demande d'information, candidature en ligne avec documents, suivi des statuts, avis, profil et suppression du compte.
- **Établissement (`/espace/etablissement`) :** fiche, offres (formulaire adapté à la catégorie), demandes, statistiques, campagnes, formule et factures, création ou revendication d'une fiche, demande de vérification.
- **Administration (`/espace/admin`) :** indicateurs du pilote, validation et vérification des fiches, modération, utilisateurs, catalogue, facturation, journal d'audit.
- **Formules :** page `/tarifs`, limites par formule, paiement Mobile Money confirmé par un administrateur, rappels et expiration automatiques.
- **Pages légales** `/conditions` et `/confidentialite` (à faire valider par un juriste).

### Encore à faire
- Newsletter (non branchée).
- Brochures PDF hébergées (aujourd'hui : un lien).
- E-mails réels (SMTP) et vérification de l'adresse e-mail à l'inscription.
- Paiement Mobile Money automatique (API MVola / Orange Money) une fois les prix validés.
- Hébergement : le site statique et l'API Laravel doivent être déployés ensemble (GitHub Pages ne suffit plus pour l'API).

### Pistes suivantes
1. **Tableau de bord d'administration :** gérer catégories, sous-catégories, établissements et offres. Demande un backend et une base de données.
2. **Page « Tous les établissements »** : le menu « Établissements » pointe pour l'instant vers l'accueil.
3. **Pages légales :** conditions d'utilisation, mentions légales, confidentialité.
4. **Partage d'une recherche filtrée :** recopier les filtres dans l'URL.
5. **Outil d'orientation :** questionnaire du panneau « Explorateur ».
6. **Effacer l'archive du template** de l'historique Git (premier commit).

---

## 7. Commandes utiles

```bash
npm install          # installer les dépendances
npm run dev          # serveur de développement : http://localhost:3000
                     # (copier .env.example en .env.local pour utiliser l'API)
npm run build        # build de production (export statique dans out/)
npm run lint         # vérification ESLint
npm run deploy       # publication de out/ sur GitHub Pages
```

> **Bon à savoir :** après un changement dans les données (ajout d'un établissement ou d'une offre), **redémarrer `npm run dev`**. Le serveur de développement garde en cache la liste des pages à générer.

---

## 8. Historique

**24 commits sur `main`.** Les 2 derniers ne sont pas encore envoyés sur GitHub :
- `0158eb0` : corrections mobile first ;
- `345a91d` : catégories d'établissements et offres éducatives.

Grandes étapes :
1. Reprise du template et adaptation à la charte Edumada.
2. Réorganisation du code par fonctionnalité et passage en français.
3. Page de recherche avec filtres avancés.
4. Fiches établissement puis fiches formation.
5. Audit et corrections mobile first.
6. Généralisation aux 5 catégories d'établissements.
