# Multi-stage build for Render
FROM composer:2 AS composer
WORKDIR /app
COPY composer.json composer.lock /app/
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction -d /app

FROM node:18 AS nodebuild
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci --silent

FROM php:8.2-fpm
ENV DEBIAN_FRONTEND=noninteractive

# Install system deps
RUN apt-get update && apt-get install -y \
    nginx supervisor git zip unzip gettext-base libpng-dev libonig-dev libxml2-dev libzip-dev curl \
    && docker-php-ext-install pdo_mysql mbstring bcmath pcntl gd zip \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer-installed vendor from builder
COPY --from=composer /app /var/www/html
# Copy built assets
COPY --from=nodebuild /app/public /var/www/html/public
# Copy application files (overwrites where needed)
COPY . /var/www/html

# Install PHP deps, optimize autoloader
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress && \
    composer dump-autoload -o && \
    chown -R www-data:www-data /var/www/html && \
    mkdir -p storage bootstrap/cache && chmod -R 775 storage bootstrap/cache

# Copy service configs
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY supervisord.render.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080
ENV PORT 8080

CMD ["/usr/local/bin/docker-entrypoint.sh"]


# FROM php:8.2-apache

# # 1. Install system dependencies
# RUN apt-get update && apt-get install -y \
#     git curl libpng-dev libonig-dev libxml2-dev zip unzip supervisor \
#     && docker-php-ext-install pdo_mysql mbstring bcmath pcntl

# # 2. Install Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# # 3. Configure Apache and DocumentRoot for Laravel

# RUN a2enmod rewrite proxy proxy_http proxy_wstunnel headers
# COPY 000-default.conf /etc/apache2/sites-available/000-default.conf
# ENV APACHE_DOCUMENT_ROOT /var/www/html/public
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
# RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# WORKDIR /var/www/html

# # 4. Install PHP dependencies
# COPY composer.json composer.lock ./
# RUN composer install --no-scripts --no-autoloader

# # 5. Copy the rest of the application
# COPY . .
# RUN composer dump-autoload

# # 6. Setup Supervisor
# COPY Supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
