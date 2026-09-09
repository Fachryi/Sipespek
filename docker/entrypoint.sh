#!/bin/sh
set -e

PORT="${PORT:-80}"

echo "Configuring Apache for Railway on port $PORT..."
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:$PORT>/g" /etc/apache2/sites-available/000-default.conf

# Mencegah AH00534 (More than one MPM loaded)
a2dismod mpm_event mpm_worker 2>/dev/null || true
a2enmod mpm_prefork 2>/dev/null || true

echo "Starting Apache..."
exec apache2-foreground
