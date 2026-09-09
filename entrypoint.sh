#!/bin/bash
set -e

# Railway menyediakan variable PORT (misal 8080, 3000, atau port acak)
PORT="${PORT:-80}"

echo "Configuring Apache to listen on port: $PORT"
sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Jalankan Apache di foreground
exec apache2-foreground
