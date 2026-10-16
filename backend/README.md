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
| GET | `/plans` | Formules Gratuit, Pro et Premium |
| GET | `/reference` | Valeurs acceptées |

Filtres de `/offers` : `q`, `category`, `domain`, `city`, `type`, `kind`, `school`, `feesMin`, `feesMax`, `durationMin`, `durationMax`, `modalities[]`, `diplomas[]`, `registration`, `languages[]`, `level`, `bacSeries[]`, `housing[]`, `scholarships[]`, `childAge`, `sort` (`pertinence`, `frais-asc`, `frais-desc`, `duree-asc`) et `perPage` (100 au maximum).

**Authentification**

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/auth/register` | `accountType` : `student` ou `establishment` (jamais `admin`) |
| POST | `/auth/login` | Renvoie `token` (5 essais par minute) |
| POST | `/auth/logout` | Révoque le jeton |
| GET | `/me` | Compte connecté et établissements représentés |

**Back-office** (en-tête `Authorization: Bearer <token>`)

| Méthode | Route | Qui |
|---|---|---|
| GET | `/me/establishments` | Équipe : ses fiches, toutes les offres (brouillons compris), la formule en vigueur |
| POST | `/establishments` | Compte établissement : la fiche est créée **en attente de validation** |
| PATCH / DELETE | `/establishments/{id}` | Équipe de l'établissement ou administrateur |
| PUT | `/establishments/{id}/moderation` | **Administrateur seulement** : publication, badge « vérifié », accréditation |
| POST | `/establishments/{id}/offers` | Équipe ou administrateur |
| PATCH / DELETE | `/offers/{id}` | Équipe ou administrateur |
| POST / PATCH / DELETE | `/categories`, `/domains` | Administrateur |

## Règles des comptes appliquées

D'après le document « Les 4 types de comptes » :

- **Le catalogue est public.** Un brouillon n'est visible que par son équipe et les administrateurs ; pour les autres, il n'existe pas (404).
- **Un établissement ne voit et ne modifie que ses propres fiches.**
- **Le badge « vérifié » et l'accréditation vérifiée sont réservés aux administrateurs**, jamais liés au paiement.
- **Gratuit : 3 offres publiées au maximum.** Les brouillons restent possibles. Pro et Premium : illimité.
- **Abonnement expiré :** retour automatique à Gratuit, sans supprimer la fiche ni les offres.
- **Prix et limites stockés en base** (table `plans`) : ce sont des hypothèses à valider, modifiables sans toucher au code.

Les tables `favorites`, `inquiries` (demandes et candidatures) et `inquiry_status_changes` sont créées. Leurs routes arrivent aux phases 3 et 4.
