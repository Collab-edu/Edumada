# Edumada — Backend (API)

API Laravel du site Edumada et de son futur back-office.

| Élément | Choix |
|---|---|
| Framework | Laravel 13, PHP 8.4 |
| Base de données | MySQL / MariaDB (XAMPP en local), base `edumada` |
| Authentification | Laravel Sanctum, jeton Bearer (le site statique appelle l'API depuis une autre origine) |
| Tests | PHPUnit, SQLite en mémoire |

## Démarrer en local

PHP 8.4 et Composer sont installés dans `C:\Users\Mahefa\tools` (le PHP 8.0 de XAMPP est trop ancien). Ajouter ce dossier au PATH :

```bash
export PATH="/c/Users/Mahefa/tools:/c/Users/Mahefa/tools/php84:$PATH"   # Git Bash
```

1. Démarrer MySQL depuis le panneau XAMPP.
2. Depuis `backend/` :

```bash
composer install
cp .env.example .env && php artisan key:generate   # première fois seulement
php artisan migrate:fresh --seed                    # crée les tables et importe ../public/data/*.json
php artisan serve                                   # http://localhost:8000
php artisan test                                    # tests
```

Le seeder importe les données d'exemple du site (`public/data/data.json` et `formation-details.json`) : l'API renvoie donc exactement ce que le site affiche aujourd'hui.

### Comptes de démonstration (mot de passe : `password`)

| Compte | E-mail | Établissement |
|---|---|---|
| Administrateur | `admin@edumada.test` | — |
| Étudiant | `etudiant@edumada.test` | 2 favoris |
| Établissement Gratuit | `gratuit@edumada.test` | Crèche Les Petits Lémuriens |
| Établissement Pro | `pro@edumada.test` | Institut Numérique de Madagascar |
| Établissement Premium | `premium@edumada.test` | Groupe scolaire Les Flamboyants |

## Principe : l'API parle le langage du site

- Les réponses ont **exactement la forme des types TypeScript du site** : `CategoryType`, `SchoolType`, `FormationType`, `FormationDetailType`, `TestimonialType`. Les identifiants sont les slugs des URL (`/etablissements/[id]`).
- En entrée, l'API accepte **le même format** que celui qu'elle renvoie, avec les libellés du site (`"Présentiel"`, `"Privé"`, `"Ouvertes"`…). Le back-office peut renvoyer tel quel ce qu'il a lu.
- Seuls les champs propres au back-office utilisent des codes : statut de publication (`draft`, `published`…), rôle, formule.
- `GET /api/v1/reference` donne toutes les valeurs acceptées, pour construire les listes déroulantes.

## Routes (`/api/v1`)

**Public, sans compte**

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/categories`, `/categories/{id}` | Catégories et sous-catégories |
| GET | `/domains` | Domaines d'études avec le nombre réel d'offres |
| GET | `/establishments` | Fiches publiées. Filtres : `q`, `category`, `city`, `type`, `verified` |
| GET | `/establishments/{id}` | Fiche complète, avec ses offres et ses avis |
| GET | `/offers` | Recherche avec les filtres de la page `/recherche` (voir ci-dessous) |
| GET | `/offers/{id}` | Fiche offre : offre, `details` et `establishment` |
| GET | `/reviews` | Avis publiés (`TestimonialType`) |
| GET | `/sponsored` | Offres des campagnes Premium en cours, ciblées par `category`, `domain`, `city` |
| GET | `/plans` | Formules Gratuit, Pro et Premium |
| GET | `/reference` | Valeurs acceptées |
| POST | `/reports` | Signaler une information erronée (10 par heure) |
| POST | `/track` | Mesures d'audience : vues, impressions, clics (sans donnée personnelle) |

Filtres de `/offers` : `q`, `category`, `domain`, `city`, `type`, `kind`, `school`, `feeRanges[]` (`min-max`, `5000000-` sans plafond), `durations[]` (libellés du site), `modalities[]`, `diplomas[]`, `registration`, `languages[]` (`Autre` = toute autre langue), `level`, `bacSeries[]`, `housing[]`, `scholarships[]`, `childAge`, `ids[]`, `sort` (`pertinence`, `frais-asc`, `frais-desc`, `duree-asc`) et `perPage` (100 au maximum).

**Compte** (en-tête `Authorization: Bearer <token>`)

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | Inscription (`student` ou `establishment`, jamais `admin`), connexion (5 essais par minute), déconnexion |
| GET / PATCH / DELETE | `/me` | Profil ; suppression du compte et des données (mot de passe demandé) |
| PUT | `/me/password` | Changer de mot de passe |

**Espace étudiant**

| Méthode | Route | Rôle |
|---|---|---|
| GET, PUT / DELETE | `/me/favorites`, `/me/favorites/{offre}` | Favoris |
| POST | `/offers/{offre}/inquiries` | Demande d'information ou candidature (pièces jointes PDF/JPG/PNG, 5 × 5 Mo), si la candidature est activée |
| GET | `/me/inquiries`, `/inquiries/{id}` | Mes démarches et leur historique de statuts |
| GET | `/inquiries/{id}/attachments/{pièce}` | Pièce jointe (auteur et établissement destinataire seulement) |
| POST | `/establishments/{id}/reviews` | Laisser un avis, publié après modération |

**Espace établissement** (équipe de la fiche ou administrateur)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/me/establishments`, `/establishments/{id}/manage` | Mes fiches, brouillons compris, formule en vigueur |
| POST, PATCH / DELETE | `/establishments`, `/establishments/{id}` | Créer (en attente de validation), modifier, supprimer |
| POST | `/establishments/{id}/claims` | Revendiquer une fiche existante |
| POST | `/establishments/{id}/verification-request` | Demander le badge « vérifié » |
| POST, PATCH / DELETE | `/establishments/{id}/offers`, `/offers/{id}` | Offres (limite de publication de la formule) |
| GET | `/establishments/{id}/inquiries`, `…/inquiries/export` | Boîte de réception et export CSV (**Pro et Premium**) |
| PUT | `/inquiries/{id}/status` | Changer le statut, avec une note ; l'étudiant est prévenu par e-mail |
| GET | `/establishments/{id}/reports` | Signalements reçus |
| GET | `/establishments/{id}/stats` | Statistiques standard (**Pro**) ou avancées (**Premium**) |
| GET, POST | `/establishments/{id}/billing`, `…/subscription-requests` | Formule, factures ; demander une formule (crée une facture) |
| GET / PATCH | `/invoices/{id}` | Facture ; indiquer la référence du paiement ou annuler |
| GET, POST, PATCH / DELETE | `/establishments/{id}/campaigns`, `/campaigns/{id}` | Campagnes sponsorisées (**Premium**) |
| POST | `/uploads` | Envoi d'une image (4 Mo max), renvoie son URL |

**Administration** (`/admin/…`, administrateurs seulement)

`overview` (indicateurs du pilote et files d'attente), `establishments` (+ `members`), `PUT /establishments/{id}/moderation` (publication, badge « vérifié », accréditation), `users`, `reviews`, `reports`, `claims`, `invoices` (`confirm`, `cancel`), `subscriptions` (`cancel`), `PATCH plans/{code}`, `campaigns`, `audit-logs`. Référentiels : `POST / PATCH / DELETE /categories` et `/domains`.

## Règles des comptes appliquées

D'après le document « Les 4 types de comptes » :

- **Le catalogue est public.** Un brouillon n'est visible que par son équipe et les administrateurs ; pour les autres, il n'existe pas (404).
- **Un établissement ne voit et ne modifie que ses propres fiches** ; une demande n'est visible que par son auteur et l'établissement destinataire.
- **Le badge « vérifié » et l'accréditation vérifiée sont réservés aux administrateurs**, jamais liés au paiement.
- **Gratuit :** 3 offres publiées, demandes reçues par e-mail. **Pro :** offres illimitées, boîte de réception, statistiques standard. **Premium :** + campagnes « Sponsorisé » et statistiques avancées.
- **Paiement :** l'établissement choisit une formule, règle la facture (MVola, Orange Money, Airtel Money, virement, espèces) et indique la référence ; un administrateur confirme, la formule s'active (ou se prolonge).
- **Expiration :** rappels à J-30, J-7 et J-1, période de grâce (7 jours, `EDUMADA_GRACE_DAYS`), puis retour à Gratuit. La fiche reste en ligne ; les offres au-delà de la limite repassent en brouillon.
- **Journal d'audit :** validation, changement de formule, suppression, export.
- **Prix et limites stockés en base** (table `plans`), modifiables depuis l'administration : ce sont des hypothèses à valider.

## Tâches planifiées et e-mails

- `php artisan subscriptions:process` gère les rappels et les expirations ; il est planifié chaque jour à 6 h (`routes/console.php`). En production, lancer `php artisan schedule:run` chaque minute (cron).
- En local, les e-mails sont écrits dans `storage/logs/laravel.log` (`MAIL_MAILER=log`). Configurer un vrai serveur SMTP avant la mise en ligne.
- Les images envoyées sont servies par `public/storage` : lancer `php artisan storage:link` une fois. Les pièces jointes de candidature restent dans `storage/app/private`.
- `FRONTEND_URLS` (origines autorisées, séparées par des virgules : site et back-office), `FRONTEND_URL` (liens des e-mails aux étudiants) et `BACKOFFICE_URL` (liens des e-mails aux établissements).
