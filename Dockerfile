# ==========================================
# Stage 1: Build React Frontend (Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Server (PHP 8.2 + Apache)
# ==========================================
FROM php:8.2-apache

# Install sistem dependensi, dos2unix & ekstensi PHP yang dibutuhkan (pdo_mysql, gd)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    curl \
    dos2unix \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Aktifkan modul rewrite & headers Apache
RUN a2enmod rewrite headers

# Konfigurasi VirtualHost agar membaca .htaccess (AllowOverride All)
COPY docker/apache.conf /etc/apache2/conf-available/sipespek.conf
RUN a2enconf sipespek

WORKDIR /var/www/html

# Salin skema database untuk auto-migration
COPY database/ /var/www/html/database/

# Salin Backend ke folder api/
COPY backend/ /var/www/html/api/

# Jalankan composer install di dalam backend
WORKDIR /var/www/html/api
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Buat direktori uploads dan atur permission
RUN mkdir -p /var/www/html/api/uploads && \
    chown -R www-data:www-data /var/www/html/api/uploads && \
    chmod -R 775 /var/www/html/api/uploads

# Salin Frontend build output ke web root
WORKDIR /var/www/html
COPY --from=frontend-builder /app/frontend/dist/ /var/www/html/

# Pastikan permission web root sesuai www-data
RUN chown -R www-data:www-data /var/www/html

# Script startup untuk bind dynamic PORT dari Railway
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
