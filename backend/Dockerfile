# API Edumada (Laravel) — image de production.
#
# Contexte de construction : la RACINE du dépôt (le seeder lit les données du site dans public/data).
#   docker build -f backend/Dockerfile -t edumada-api .
# Sur Render : Dockerfile Path = ./backend/Dockerfile, Docker Build Context Directory = .

# 1. Assets de la page d'accueil Laravel (Vite).
FROM node:22-alpine AS assets
WORKDIR /app
COPY backend/package.json backend/vite.config.js ./
COPY backend/resources ./resources
RUN npm install --no-audit --no-fund && npm run build

# 2. Dépendances PHP (sans les outils de développement).
FROM composer:2 AS vendor
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --ignore-platform-reqs
COPY backend/ ./
RUN composer dump-autoload --optimize --no-dev --no-scripts

# 3. Image finale : PHP 8.4 + Apache.
FROM php:8.4-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libzip-dev libicu-dev unzip \
    && docker-php-ext-install pdo_pgsql pdo_mysql zip intl bcmath opcache \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY backend/docker/php.ini /usr/local/etc/php/conf.d/edumada.ini
COPY backend/docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY backend/docker/entrypoint.sh /usr/local/bin/edumada-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/edumada-entrypoint && chmod +x /usr/local/bin/edumada-entrypoint

WORKDIR /var/www/html
COPY --from=vendor /app ./
COPY --from=assets /app/public/build ./public/build
# Données du site (catalogue de départ) pour le seeder, hors du dossier de l'application.
COPY public/data /var/www/site-data

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    LOG_LEVEL=info \
    EDUMADA_SITE_DATA_PATH=/var/www/site-data \
    PORT=10000

# Composer a été lancé sans scripts : découverte des paquets Laravel (Sanctum…).
RUN rm -f .env bootstrap/cache/*.php && php artisan package:discover --ansi

RUN mkdir -p storage/app/public \
    storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD curl -fs "http://127.0.0.1:${PORT}/up" || exit 1

CMD ["edumada-entrypoint"]
