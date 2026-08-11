#!/bin/bash
set -e

echo "🌐 1. Escribiendo reglas Nginx completas (Puerto 80 y Puerto 443) para app.newcenturyni.com..."

# Buscar certificado SSL disponible en la máquina
SSL_CERT="/etc/letsencrypt/live/app.newcenturyni.com/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/app.newcenturyni.com/privkey.pem"

if [ ! -f "$SSL_CERT" ]; then
    SSL_CERT="/etc/letsencrypt/live/trackfleet360.newcenturyni.com/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/trackfleet360.newcenturyni.com/privkey.pem"
fi

cat << EOF > /etc/nginx/sites-available/app.newcenturyni.com
server {
    listen 80;
    server_name app.newcenturyni.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 443 ssl;
    server_name app.newcenturyni.com;

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/app.newcenturyni.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
echo "✅ Nginx vinculado en puerto 443 hacia Next.js (Puerto 3000)."

echo "🔒 2. Ejecutando Certbot installer en Nginx..."
certbot --nginx -d app.newcenturyni.com --non-interactive --agree-tos -m informatica@newcenturyni.com --redirect --reinstall || certbot --nginx -d app.newcenturyni.com --non-interactive --agree-tos -m informatica@newcenturyni.com --redirect || true

nginx -t
systemctl reload nginx
echo "✅ [ÉXITO COMPLETO] Nginx y SSL activos para app.newcenturyni.com!"
