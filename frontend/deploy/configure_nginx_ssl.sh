#!/bin/bash
set -e

echo "🌐 1. Configurando Nginx HTTP en Puerto 80 para app.newcenturyni.com..."
cat << 'EOF' > /etc/nginx/sites-available/app.newcenturyni.com
server {
    listen 80;
    server_name app.newcenturyni.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/app.newcenturyni.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo "🔒 2. Renovando/Generando certificado SSL unificado para app.newcenturyni.com y trackfleet360.newcenturyni.com..."
certbot --nginx -d app.newcenturyni.com -d trackfleet360.newcenturyni.com --non-interactive --agree-tos -m informatica@newcenturyni.com --no-eff-email --force-renewal || certbot --nginx -d app.newcenturyni.com --non-interactive --agree-tos -m informatica@newcenturyni.com --no-eff-email --force-renewal || true

# Buscar certificado generado
CERT_PATH=""
if [ -d "/etc/letsencrypt/live/app.newcenturyni.com" ]; then
    CERT_PATH="/etc/letsencrypt/live/app.newcenturyni.com"
elif [ -d "/etc/letsencrypt/live/trackfleet360.newcenturyni.com" ]; then
    CERT_PATH="/etc/letsencrypt/live/trackfleet360.newcenturyni.com"
fi

if [ -n "$CERT_PATH" ]; then
    echo "🔒 3. Aplicando puerto HTTPS 443 en Nginx para app.newcenturyni.com con certificado $CERT_PATH..."
    cat << EOF > /etc/nginx/sites-available/app.newcenturyni.com
server {
    listen 80;
    server_name app.newcenturyni.com;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name app.newcenturyni.com;

    ssl_certificate ${CERT_PATH}/fullchain.pem;
    ssl_certificate_key ${CERT_PATH}/privkey.pem;

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
    nginx -t
    systemctl reload nginx
    echo "✅ [ÉXITO COMPLETO] Nginx activado en HTTPS 443 hacia Next.js (Puerto 3000)!"
fi
