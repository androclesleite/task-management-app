# backend/Dockerfile
FROM php:8.3-apache
# FROM php:8.3-fpm

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    zip \
    unzip \
    libmariadb-dev \
    libmariadb-dev-compat \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensões do PHP
RUN docker-php-ext-install pdo pdo_mysql

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos do projeto
COPY . /var/www/html

# Copiar configuração personalizada do Apache
COPY /nginx/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
# COPY /nginx/php-fpm.conf /usr/local/etc/php-fpm.d/custom.conf

# Instalar dependências do Composer 
RUN if [ -f "composer.json" ]; then \
    composer validate || true && \
    composer install --no-dev --no-autoloader && \
    composer dump-autoload -o; \
    fi

# Configurar Apache
RUN a2enmod rewrite
# RUN chown -R www-data:www-data /var/www/html

# Expor porta 80
EXPOSE 80