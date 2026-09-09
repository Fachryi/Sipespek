#!/bin/sh
set -e

PORT="${PORT:-80}"

echo "Configuring Apache for Railway on port $PORT..."
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:$PORT>/g" /etc/apache2/sites-available/000-default.conf

echo "Starting Apache..."
exec apache2-foreground
