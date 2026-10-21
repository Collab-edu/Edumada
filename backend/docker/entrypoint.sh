#!/bin/sh
# Démarrage du conteneur de l'API : port, caches, migrations, tâches planifiées, puis Apache.
set -e
cd /var/www/html

# Render (et la plupart des hébergeurs) imposent le port d'écoute via $PORT.
PORT="${PORT:-10000}"
sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Disque persistant monté sur storage/app/public : dossiers recréés à chaque démarrage.
mkdir -p storage/app/public/uploads storage/app/public/documents

php artisan storage:link --force >/dev/null 2>&1 || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
# Caches créés par root : Apache (www-data) doit pouvoir écrire dans storage et bootstrap/cache.
chown -R www-data:www-data storage bootstrap/cache

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
fi

# Premier déploiement (SEED_ON_DEPLOY=true) : formules et catalogue du site. Pas de comptes de démo en production.
if [ "${SEED_ON_DEPLOY:-false}" = "true" ]; then
    php artisan db:seed --force
fi

# Compte administrateur (ADMIN_EMAIL et ADMIN_PASSWORD) : créé s'il n'existe pas encore.
if [ -n "${ADMIN_EMAIL:-}" ]; then
    php artisan edumada:admin || true
fi

# Tâches planifiées (rappels et expiration des abonnements) dans le même conteneur.
su -s /bin/sh www-data -c "php artisan schedule:work" &

exec apache2-foreground
