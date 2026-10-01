# ---------------------------------------------------------------------------
# Stage 1: build front-end assets (legacy Vite build + React/Inertia build)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.js vite.react.config.ts vite.shared.js tailwind.config.js tsconfig.json ./
COPY resources ./resources
COPY public ./public
# No PHP in this stage, so Wayfinder cannot regenerate its route helpers here;
# the build uses the copies committed under resources/react.
RUN SKIP_WAYFINDER=1 npm run build

# ---------------------------------------------------------------------------
# Stage 2: PHP 8.3 + Apache application image
# ---------------------------------------------------------------------------
FROM php:8.3-apache

# System libraries + PHP extensions required by the app:
#   pdo_mysql - MySQL, gd - barcodes/dompdf, intl - Filament,
#   zip/exif/bcmath - general Laravel, opcache - performance,
#   redis (pecl) - cache/session/queue drivers
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libwebp-dev \
        libicu-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql gd intl zip exif bcmath opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

# Apache: serve from public/, allow .htaccess rewrites
COPY docker/apache/vhost.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite headers

COPY docker/php/php.ini "$PHP_INI_DIR/conf.d/99-app.ini"
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first so this layer is cached between code changes
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress \
        --no-scripts --no-autoloader

# Application code + built assets
COPY . .
COPY --from=assets /app/public/build ./public/build
COPY --from=assets /app/public/build-react ./public/build-react

RUN mkdir -p storage/framework/cache/data storage/framework/sessions \
        storage/framework/views storage/logs storage/app/public bootstrap/cache \
    && composer dump-autoload --optimize --no-dev \
    && php artisan package:discover --ansi \
    && php artisan filament:upgrade \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
