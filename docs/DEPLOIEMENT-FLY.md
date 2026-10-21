# Déployer l'API (Laravel) sur Fly.io

L'API tourne dans le conteneur Docker de [backend/Dockerfile](../backend/Dockerfile), configuré pour Fly.io par [fly.toml](../fly.toml) à la racine du dépôt. Le site et le back-office restent sur Vercel.

> L'assistant web de Fly.io (« Launch UI ») ne sait pas gérer ce dépôt, qui contient trois applications. Le déploiement se fait avec l'outil en ligne de commande **flyctl**, depuis la racine du dépôt.

> **Fichiers envoyés (photos, logos, brochures)** : pas de stockage durable pour l'instant. Ils sont perdus à chaque redéploiement.

## 1. Installer flyctl et se connecter

Dans PowerShell :

```powershell
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
fly auth login
```

Fermez puis rouvrez le terminal si la commande `fly` n'est pas reconnue.

## 2. Créer l'application

Depuis la racine du dépôt (`Edumada/`) :

```powershell
fly apps create edumada-api
```

Si le nom est déjà pris, choisissez-en un autre, et remplacez `app = "edumada-api"` dans `fly.toml` par ce nom.

## 3. Créer la base PostgreSQL

Le plus simple est de passer par le tableau de bord Fly.io : **Managed Postgres → Create**, région **Frankfurt (fra)**, la même que l'API. Copiez ensuite la **chaîne de connexion** (elle commence par `postgresql://`).

## 4. Enregistrer les secrets

En une seule commande, en remplaçant les valeurs entre `<…>` :

```powershell
fly secrets set `
  APP_KEY="base64:..." `
  APP_URL="https://edumada-api.fly.dev" `
  DB_URL="<chaîne de connexion PostgreSQL>" `
  FRONTEND_URLS="<adresse du site>,<adresse du back-office>" `
  FRONTEND_URL="<adresse du site>" `
  BACKOFFICE_URL="<adresse du back-office>" `
  ADMIN_EMAIL="<e-mail administrateur>" `
  ADMIN_PASSWORD="<mot de passe : 8 caractères min., lettres et chiffres>" `
  SEED_ON_DEPLOY="true"
```

- `APP_KEY` : générée avec `php artisan key:generate --show` dans `backend/`.
- `APP_URL` : `https://<nom-de-l-app>.fly.dev`.

Les réglages sans secret (port, `DB_CONNECTION=pgsql`, journaux…) sont déjà dans `fly.toml`.

## 5. Déployer

Toujours depuis la racine du dépôt :

```powershell
fly deploy
```

Au démarrage, le conteneur :
1. applique les migrations ;
2. charge les formules et le catalogue du site (puisque `SEED_ON_DEPLOY=true`) ;
3. crée le compte administrateur ;
4. lance les tâches planifiées.

## 6. Après le premier déploiement

```powershell
fly secrets set SEED_ON_DEPLOY="false"
```

Puis vérifiez :
- `https://edumada-api.fly.dev/up` répond « Application up » ;
- `https://edumada-api.fly.dev/api/v1/plans` renvoie les trois formules ;
- en cas de problème, les journaux s'affichent avec `fly logs`.

## 7. Relier le site et le back-office (Vercel)

Dans les deux projets Vercel :
- `NEXT_PUBLIC_API_URL` = `https://edumada-api.fly.dev/api/v1` ;
- dans le back-office seulement, `NEXT_PUBLIC_SITE_URL` = l'adresse du site.

Puis redéployez les deux projets.

## Coût

Fly.io facture à l'usage et demande une carte bancaire. Une machine `shared-cpu-1x` de 512 Mo allumée en permanence coûte quelques dollars par mois, plus la base PostgreSQL.
