# Déployer l'API (Laravel) sur Render avec Docker

L'API tourne dans un conteneur Docker (PHP 8.4 + Apache) décrit par [backend/Dockerfile](../backend/Dockerfile), avec une base **PostgreSQL de Render**.

> **Fichiers envoyés (photos, logos, brochures, pièces jointes)** : pour l'instant, ils sont gardés dans le conteneur, **sans stockage durable**. Ils sont perdus à chaque redéploiement ou redémarrage du service. Pour les conserver plus tard, voir l'étape 3.

## 1. Créer la base PostgreSQL

Render → **New → PostgreSQL**.
- Même région que l'API (par exemple Frankfurt).
- Une fois créée, copier l'**Internal Database URL** : elle commence par `postgresql://`.

## 2. Créer le service web

Render → **New → Web Service** → dépôt `Collab-edu/Edumada`, branche `main`.

| Réglage | Valeur |
|---|---|
| Language / Runtime | **Docker** (pas Node) |
| Root Directory | *(vide)* |
| Dockerfile Path | `./backend/Dockerfile` |
| Docker Build Context Directory | `.` |
| Instance | Free pour commencer (Starter ou plus pour éviter la mise en veille) |
| Health Check Path | `/up` |

Laisser vides les champs *Build Command* et *Start Command* : le Dockerfile s'en charge.

## 3. Plus tard : conserver les fichiers envoyés

Non activé pour l'instant. Le jour venu, sur une instance Starter ou plus : Service → **Disks → Add disk**.

| Réglage | Valeur |
|---|---|
| Mount Path | `/var/www/html/storage/app/public` |
| Taille | 1 Go pour commencer |

Aucune modification de code n'est nécessaire : l'image est déjà prête pour ce disque.

## 4. Variables d'environnement

| Variable | Valeur |
|---|---|
| `APP_KEY` | générée par `php artisan key:generate --show` (commence par `base64:`) |
| `APP_URL` | adresse publique de l'API, par exemple `https://edumada-api.onrender.com` |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | l'Internal Database URL de l'étape 1 |
| `FRONTEND_URLS` | adresses autorisées à appeler l'API, séparées par des virgules : site **et** back-office |
| `FRONTEND_URL` | adresse du site |
| `BACKOFFICE_URL` | adresse du back-office |
| `QUEUE_CONNECTION` | `sync` |
| `ADMIN_EMAIL` | e-mail du compte administrateur |
| `ADMIN_PASSWORD` | son mot de passe (8 caractères au moins, lettres et chiffres) |
| `SEED_ON_DEPLOY` | `true` au **premier** déploiement, puis `false` |
| `MAIL_MAILER` | `log` tant qu'aucun service d'e-mail n'est branché (les e-mails apparaissent dans les journaux) |

Déjà réglées dans l'image (inutile de les ajouter) : `APP_ENV=production`, `APP_DEBUG=false`, `LOG_CHANNEL=stderr`.

## 5. Ce qui se passe à chaque démarrage

Le script [backend/docker/entrypoint.sh](../backend/docker/entrypoint.sh) :
1. écoute sur le port imposé par Render (`$PORT`) ;
2. prépare le dossier des fichiers envoyés et le lien `public/storage` ;
3. met en cache la configuration, les routes et les vues ;
4. applique les migrations (`RUN_MIGRATIONS=false` pour l'éviter) ;
5. si `SEED_ON_DEPLOY=true`, charge les formules et le catalogue du site (pas de comptes de démonstration en production) ;
6. si `ADMIN_EMAIL` est défini, crée le compte administrateur s'il n'existe pas, sans jamais changer le mot de passe d'un compte existant ;
7. lance les tâches planifiées (rappels et expiration des abonnements), puis Apache.

## 6. Relier le site et le back-office

Sur Vercel, dans chaque projet (site et back-office) :
- `NEXT_PUBLIC_API_URL` = adresse de l'API suivie de `/api/v1`, par exemple `https://edumada-api.onrender.com/api/v1` ;
- back-office seulement : `NEXT_PUBLIC_SITE_URL` = adresse du site (liens « Voir ma fiche », logos et photos) ;
- puis redéployer.

## 7. Vérifier

- `https://<adresse-api>/up` répond « Application up ».
- `https://<adresse-api>/api/v1/plans` renvoie les trois formules.
- La connexion au back-office avec le compte administrateur fonctionne.
