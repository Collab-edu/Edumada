# Edumada — État du projet

*Mis à jour le 5 novembre 2026*

Edumada est une plateforme pour trouver un établissement et une offre éducative à Madagascar, **de la crèche à l'université**. Ce document fait le point sur ce qui existe aujourd'hui. Le détail des règles métier est dans [FONCTIONNALITES-ET-ALGORITHMES.md](FONCTIONNALITES-ET-ALGORITHMES.md).

> **Statut :** le projet est **en ligne** : site, back-office et API. Le site lit le catalogue dans l'API et retombe sur les fichiers de `public/data/` si elle ne répond pas. Les données sont encore des **exemples inventés** : voir la [section 6](#6-ce-qui-reste-fictif-ou-à-faire).

---

## 1. Architecture et technique

Un seul dépôt, trois applications :

| Application | Dossier | Technique | Pour qui | En local | En ligne |
|---|---|---|---|---|---|
| Site public | `src/` | Next.js 15, React 19, TypeScript, Tailwind CSS v4 | Visiteurs, étudiants, parents | http://localhost:3000 | https://edumada-front.vercel.app/ |
| Back-office | `backoffice/` | Next.js 15, React 19, TypeScript, CoreUI, SCSS | Établissements, administrateurs | http://localhost:5173 | https://edumada-frfh-phi.vercel.app/ |
| API | `backend/` | Laravel 13, Sanctum, MariaDB | Les deux applications | http://localhost:8000/api/v1 | https://mahefa.alwaysdata.net/api/v1 |

**Dépôt :** https://github.com/Collab-edu/Edumada (branche `main`).

**Principes retenus :**
- **Mobile first :** chaque page est conçue et testée d'abord sur un écran de 375 px.
- **Export statique :** les deux applications Next.js sont en `output: 'export'`, sans rendu serveur. D'où des adresses à paramètres pour le contenu créé après le build (`/formations/voir/?id=`, `/offres/modifier/?id=`).
- **Vocabulaire du site dans l'API :** les réponses suivent les types TypeScript du site et utilisent ses libellés (« Présentiel ») ; la base stocke des codes via des enums PHP.
- **Catégories pilotées par les données :** ce qui s'affiche pour une crèche ou une université est décrit dans les données, pas codé en dur.
- **Règles appliquées par l'API :** les limites des formules ne dépendent pas de l'affichage.

---

## 2. Pages

### Site public (36 adresses)

| Rubrique | Adresses |
|---|---|
| Accueil | `/` |
| Recherche | `/recherche` |
| Listes par public | `/universites`, `/formation-professionnelle`, `/creches`, `/ecoles`, `/petite-enfance` (crèches et écoles réunies), `/etablissements` |
| Fiches | `/etablissements/[id]`, `/etablissements/[id]/[offre]`, `/etablissements/voir`, `/formations/voir` |
| Orientation | `/orientation`, `/orientation/test`, `/domaines` |
| Stages | `/stages`, `/stages/voir` |
| Candidature | `/candidature` |
| Actualités | `/actualites`, `/actualites/voir` |
| Informations | `/a-propos`, `/avantages`, `/tarifs`, `/contact`, `/conditions`, `/confidentialite` |
| Comptes | `/signin`, `/inscription`, `/inscription-etablissement`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`, `/signup` (ancienne adresse redirigée) |
| Espace étudiant | `/espace`, `/espace/etudiant`, `/espace/etudiant/favoris`, `/espace/etudiant/profil` |

### Back-office (26 adresses)

| Rubrique | Adresses |
|---|---|
| Accès | `/connexion`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe` |
| Commun | `/` (redirection), `/dashboard`, `/compte` |
| Établissement | `/fiche`, `/offres` (`/nouvelle`, `/modifier`), `/demandes`, `/statistiques`, `/campagnes`, `/equipe`, `/formule`, `/facture`, `/nouvel-etablissement`, `/revendiquer` |
| Administration | `/admin/etablissements`, `/admin/moderation`, `/admin/utilisateurs`, `/admin/catalogue`, `/admin/stages`, `/admin/actualites`, `/admin/facturation`, `/admin/journal` |

### 2.1 Accueil
1. **Hero en photo :** titre, barre de recherche, puis logos d'établissements qui défilent (bandeau réservé aux établissements Premium).
2. **Explorer par type d'établissement.**
3. **Explorer les formations par domaine.**
4. Bandeau d'inscription.
5. **Offres à découvrir :** carrousel.
6. **Établissements à découvrir :** carrousel.
7. **Comment ça marche ?** Trois étapes illustrées par des **images** de téléphones (`public/images/comment-ca-marche/`).
8. **Témoignages :** deux rangées qui défilent en sens inverse.

La newsletter est dans le pied de page.

### 2.2 Recherche (`/recherche`)
- **Barre principale :** bouton Rechercher ; les résultats s'appliquent au clic.
- **Filtres :** panneau latéral sur ordinateur, panneau coulissant sur mobile, pastilles des filtres actifs, tri.
- **Résultats :** trois colonnes sur grand écran, carte d'offre commune à tout le site, bouton « Voir plus ».
- **État de recherche :** logo animé avec un seul message de chargement, pendant au moins 2 secondes.
- **Lieux :** champ Ville alimenté par tous les lieux de Madagascar, avec « Autour de moi ».
- **Arrivée depuis l'accueil :** les choix sont transmis dans l'URL.

### 2.3 Fiche établissement (`/etablissements/[id]`)
- **Couverture :** logo, nom, sous-catégorie, public/privé, ville, « Fiche vérifiée ».
- **Boutons :** Appeler, Site web.
- **Contenu, dans l'ordre :**
  - À propos ;
  - **Offres**, avec un titre selon la catégorie : « Formations proposées », « Niveaux scolaires », « Accueil proposé »… Les offres s'affichent sur trois colonnes, avec la carte commune du site ;
  - **Conditions d'admission :** démarche en 4 étapes, tableau des prérequis (colonnes selon la catégorie), pièces à fournir ;
  - Photos et infrastructures ;
  - **Avis**, en carrousel (« Témoignages d'étudiants », « Avis des parents »…) ;
  - FAQ de 3 questions générées automatiquement à partir des données.
- **Colonne latérale :** carte OpenStreetMap, puis informations pratiques (type, adresse, téléphone, e-mail, site, réseaux sociaux, accréditation, statut de vérification).
- **SEO :** balisage `FAQPage` pour Google.

La carte est tracée avec Leaflet, avec un itinéraire à pied ou en voiture.

### 2.4 Fiche offre (`/etablissements/[id]/[offre]`)
Les anciennes adresses `/formations/[id]` sont redirigées. Les champs, la fiche et les filtres s'adaptent au type d'offre.

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

### 2.5 Orientation et stages
- **Orientation :** séries du bac (dont les nouvelles séries L, S, OSE à partir de 2027) et **test RIASEC** en 12 questions, dont le résultat renvoie vers les formations du catalogue.
- **Stages :** offres de sociétés publiées par l'administrateur, avec nom et logo. Pour postuler, l'étudiant fournit son téléphone, son CV et sa lettre ; les candidatures arrivent dans le back-office, sans statut.

### 2.6 Comptes et espaces

| Compte | Où | Principales fonctions |
|---|---|---|
| Étudiant ou parent | Site | Favoris, demandes d'information, candidatures avec documents, avis, profil |
| Établissement | Back-office | Fiche, offres, demandes, statistiques, campagnes, équipe, formule et factures, revendication d'une fiche |
| Administrateur | Back-office | Indicateurs, validation et vérification des fiches, modération, utilisateurs, catalogue, stages, actualités, facturation, journal d'audit |

- **Connexion :** e-mail et mot de passe, ou Google. Mot de passe oublié par e-mail.
- **Un compte, un établissement,** avec des membres d'équipe sur sa fiche.
- **Adhésion :** une nouvelle fiche attend la validation d'un administrateur. L'administrateur ne modifie pas les fiches et ne publie pas d'offres : seuls les établissements inscrits le font.
- **Demandes d'information :** échange de messages entre l'étudiant et l'établissement, sans statut. Chaque carte et chaque conversation affichent le nom et le logo de l'établissement. **Pas de temps réel :** il faut actualiser pour voir un nouveau message, et chaque message envoie un e-mail. Les candidatures gardent un suivi par statut.

### 2.7 Formules

Prix relevés dans la base locale, **indicatifs** et modifiables par l'administrateur.

| Formule | Prix | Offres publiées | Galerie, liens, avis, infrastructures |
|---|---|---:|:-:|
| Gratuit | 0 Ar | 1 | – |
| Pro | 100 000 Ar/mois ou 600 000 Ar/an | illimité | ✓ |
| Premium | 175 000 Ar/mois | illimité | ✓ |

Le paiement Mobile Money est **confirmé à la main** par un administrateur. Rappels à J-30, J-7 et J-1, période de grâce et expiration sont traités chaque jour par `subscriptions:process`.

---

## 3. Modèle de données

Le modèle sépare trois notions : **Type d'établissement**, **Établissement** et **Offres éducatives**.

### 3.1 Les 5 catégories

| Catégorie | Sous-catégories | Diplômes | Programme | Âge des enfants | Débouchés |
|---|---|:-:|:-:|:-:|:-:|
| Université et enseignement supérieur | Université, école supérieure, institut supérieur, grande école | ✓ | ✓ | – | ✓ |
| Crèche et petite enfance | Crèche, garderie, préscolaire, maternelle | – | – | ✓ | – |
| Formation professionnelle | Centre de formation pro, centre d'apprentissage, école technique, centre informatique, centre de langues | ✓ | ✓ | – | ✓ |
| Primaire et secondaire | École primaire, collège, lycée, établissement privé ou public | ✓ | ✓ | ✓ | – |
| Autres établissements | Établissement spécialisé, centre éducatif, organisme de formation | – | ✓ | ✓ | – |

Ces réglages (`fields`) décident des sections affichées sur les fiches.

### 3.2 Sources de données

| Source | Contenu | Usage |
|---|---|---|
| MariaDB, via l'API | Tout le contenu vivant : comptes, fiches, offres, demandes, formules, statistiques | Source principale |
| `public/data/data.json` | Menus, catégories, filtres, domaines, établissements, offres, avis, pied de page | Menus et textes du site ; repli si l'API ne répond pas ; données initiales de la base |
| `public/data/formation-details.json` | Contenu détaillé des offres | Repli et données initiales |

**Volume de la base locale :** 22 établissements, 42 offres, 39 avis, 14 comptes, 3 formules, 2 articles, 1 stage. Ces chiffres comprennent des comptes et des fiches de test.

### 3.3 API
- Environ 100 routes sous `/api/v1`, réparties entre public, connecté (`auth:sanctum`) et administrateur (`can:admin`).
- 23 modèles, dont `Establishment`, `Offer`, `Inquiry`, `InquiryMessage`, `Internship`, `Subscription`, `Invoice`, `Review`, `Report`, `AuditLog`.
- 154 tests automatisés, sur SQLite en mémoire.

---

## 4. Organisation du code

```
src/                      Site public
  app/                    Routes (page.tsx générés par scripts/build-locale-routes.mjs)
  routes/                 Contenu des pages
  features/               Un dossier par fonctionnalité : recherche, formations, etablissements,
                          domaines, orientation, stages, candidature, actualites, espace, auth,
                          categories, contact, marketing
  components/             ui/ (composants génériques) et layout/ (en-tête, pied de page)
  data/                   Accès aux données
  i18n/                   Multilingue (désactivé)
  lib/                    api.ts (client de l'API) et utilitaires
backoffice/src/           Back-office
  app/                    Routes
  views/                  Écrans (dashboard, establishment, admin)
  components/, context/, lib/
backend/                  API Laravel
  app/                    Modèles, enums, contrôleurs (Api/V1), policies, notifications, services
  routes/api.php          Routes de l'API
  tests/                  Tests automatisés
public/data/              Données JSON
docs/                     Documentation
```

**Ajouter une page au site :** la créer dans `src/app/(site)/…/page.tsx`, puis lancer `node scripts/build-locale-routes.mjs` : le contenu est déplacé dans `src/routes/`.

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

- **Typographie :** Plus Jakarta Sans pour les titres, Inter pour les textes et les formulaires. Les `h2` font 26 px et les paragraphes 16 px.
- **Back-office :** couleurs Edumada en aplats, sans dégradés.
- **Loaders :** logo animé de Madagascar sur le site et le back-office. À l'ouverture du back-office, un seul loader plein écran reste affiché jusqu'à ce que la page soit prête (10 secondes au maximum).
- **Mobile :** zones tactiles d'au moins 40 px, pas de défilement horizontal, titres centrés (`mobile-center`).

---

## 6. Ce qui reste fictif ou à faire

### À remplacer avant le lancement public
- **Toutes les données sont des exemples :** établissements, offres, frais, dates, adresses, téléphones et réseaux sociaux.
- **Témoignages et avis inventés :** les publier tels quels serait trompeur. Les photos des témoignages de l'accueil viennent aussi d'un site tiers (`cdn.21st.dev`).
- **Images « Comment ça marche ? » :** elles montrent des fiches d'exemple et sont figées. Les refaire avec du contenu définitif.
- **Accréditations et statuts de vérification :** exemples à vérifier réellement.
- **Pages légales :** à faire valider par un juriste.

### Encore à faire
- **Newsletter :** le formulaire du pied de page n'est branché à rien.
- **Vérification de l'adresse e-mail** à l'inscription.
- **Paiement Mobile Money automatique** (MVola, Orange Money) une fois les prix validés.
- **Multilingue :** fr, en et mg sont prêts mais désactivés (`I18N_ENABLED = false`). À l'activation : passer l'interrupteur à `true`, relancer `node scripts/build-locale-routes.mjs` et traduire les textes ajoutés depuis le 26 octobre, ainsi que les images « Comment ça marche ? ».

### Points à corriger ou à décider
- **Prix Pro :** 100 000 Ar/mois dans la base locale, 75 000 Ar/mois dans `FONCTIONNALITES-ET-ALGORITHMES.md`.
- **Offre gratuite alwaysdata :** 100 Mo, à surveiller avec les fichiers envoyés et le volume d'e-mails.
- **Documents dépassés :** `docs/DEPLOIEMENT-RENDER.md` (Render abandonné) et la commande `npm run deploy` (GitHub Pages).

---

## 7. Déploiement et commandes

**Site et back-office :** Vercel redéploie à chaque push sur `main`. Variable `NEXT_PUBLIC_API_URL` sur les deux projets.

**API :** hébergée sur alwaysdata, à mettre à jour **à la main** après chaque push qui touche `backend/` :

```bash
cd ~/edumada && git pull && cd backend && composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan config:cache && php artisan route:cache
```

**En local :**

```bash
npm install                  # dépendances du site
npm run dev                  # site : http://localhost:3000 (copier .env.example en .env.local)
npm run build                # build de production (export statique dans out/)
npm run lint                 # vérification ESLint

cd backoffice && npm run dev # back-office : http://localhost:5173
cd backend && php artisan serve --port=8000   # API
cd backend && php artisan test                # tests de l'API
```

L'API demande PHP 8.3 ou plus et une base MariaDB ou MySQL : voir [`backend/README.md`](../backend/README.md).

---

## 8. Historique

**366 commits sur `main`,** tous envoyés sur GitHub au 5 novembre 2026.

1. **15 octobre :** reprise du template, charte Edumada, recherche, fiches, généralisation aux 5 catégories.
2. **16 octobre :** API Laravel, site branché sur l'API, espaces et formules, back-office séparé.
3. **17 au 21 octobre :** pages Tarifs et Avantages, inscription des établissements, cartes et itinéraires, page Équipe.
4. **22 octobre :** mise en ligne sur Vercel et alwaysdata, mot de passe oublié, lieux de Madagascar.
5. **23 au 26 octobre :** connexion Google, nouveau hero, site en trois langues puis multilingue désactivé.
6. **28 au 31 octobre :** pages Universités, Formation professionnelle et Petite enfance, refonte des pages Domaines et Orientation, test RIASEC, stages, nouvelles fiches et adresses d'offres.
7. **1er au 5 novembre :** loaders, messagerie des demandes d'information, témoignages défilants, images « Comment ça marche ? », logo des établissements dans les demandes, formules sur la page Tarifs, nouvel en-tête et menu, pages Crèches et Écoles, arrondis réduits, contact d'un établissement depuis sa fiche, images allégées, CSS intégré aux pages.
