#!/bin/bash
set -e

echo "🔒 Configurando arquitectura de Nginx unificada (Frontend + Backend) en instance-apitrackfleet360..."

# Buscar el certificado SSL existente en el servidor
SSL_CERT=""
SSL_KEY=""

if [ -f "/etc/letsencrypt/live/app.newcenturyni.com/fullchain.pem" ]; then
    SSL_CERT="/etc/letsencrypt/live/app.newcenturyni.com/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/app.newcenturyni.com/privkey.pem"
elif [ -f "/etc/letsencrypt/live/trackfleet360.newcenturyni.com/fullchain.pem" ]; then
    SSL_CERT="/etc/letsencrypt/live/trackfleet360.newcenturyni.com/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/trackfleet360.newcenturyni.com/privkey.pem"
else
    # Generar certificado auto-firmado o intentar certbot
    echo "⚠️ Certificado SSL no detectado. Generando certificado Let's Encrypt para trackfleet360.newcenturyni.com..."
    certbot certonly --nginx -d trackfleet360.newcenturyni.com -d app.newcenturyni.com --non-interactive --agree-tos -m informatica@newcenturyni.com --expand || true
    SSL_CERT="/etc/letsencrypt/live/trackfleet360.newcenturyni.com/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/trackfleet360.newcenturyni.com/privkey.pem"
fi

echo "🔑 Usando certificado SSL: $SSL_CERT"

# 1. Configurar sitio Backend: trackfleet360.newcenturyni.com
cat << EOF > /etc/nginx/sites-available/trackfleet360.newcenturyni.com
server {
    listen 80;
    server_name trackfleet360.newcenturyni.com;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name trackfleet360.newcenturyni.com;

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};

    location / {
        proxy_pass http://127.0.0.1:8085;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads/ {
        alias /home/informatica/TrackFleet360/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# 2. Configurar sitio Frontend + Proxy API: app.newcenturyni.com
cat << EOF > /etc/nginx/sites-available/app.newcenturyni.com
server {
    listen 80;
    server_name app.newcenturyni.com;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl default_server;
    server_name app.newcenturyni.com;

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};

    # Ruta de la API Backend en Go
    location /api/ {
        proxy_pass http://127.0.0.1:8085/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Ruta del Panel Web Next.js
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

# Activar ambos sitios en Nginx
ln -sf /etc/nginx/sites-available/trackfleet360.newcenturyni.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/app.newcenturyni.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Probar y recargar Nginx
nginx -t
systemctl reload nginx

echo "✅ [ÉXITO COMPLETO] Nginx unificado: app.newcenturyni.com (Web + API) y trackfleet360.newcenturyni.com (API) totalmente activos!"
