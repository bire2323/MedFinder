#!/bin/sh
set -e

# Substitute PORT into nginx config
if [ -z "$PORT" ]; then
  PORT=8080
fi

# Replace placeholder in nginx template
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Ensure permissions
chown -R www-data:www-data /var/www/html

# Start supervisord (will run nginx, php-fpm, and reverb)
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
