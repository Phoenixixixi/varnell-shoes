#!/bin/bash
cat << 'NGINX_CONF' > /etc/nginx/sites-available/varnell
server {
    listen 80;
    listen [::]:80;
    server_name _;
    root /var/www/html/varnell/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
NGINX_CONF

ln -sf /etc/nginx/sites-available/varnell /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Set proper permissions for Laravel
chown -R www-data:www-data /var/www/html/varnell
find /var/www/html/varnell -type f -exec chmod 644 {} \;
find /var/www/html/varnell -type d -exec chmod 755 {} \;
chmod -R 775 /var/www/html/varnell/storage
chmod -R 775 /var/www/html/varnell/bootstrap/cache

# Restart Nginx
systemctl restart nginx
echo "Nginx configuration complete. Website should be accessible."
