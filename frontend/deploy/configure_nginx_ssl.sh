#!/bin/bash
set -e

echo "🔒 Configurando Nginx con certificado SSL HTTPS para app.newcenturyni.com..."

if [ -f "/etc/letsencrypt/live/app.newcenturyni.com/fullchain.pem" ]; then
    cat << 'EOF' > /etc/nginx/sites-available/app.newcenturyni.com
server {
    listen 80;
    server_name app.newcenturyni.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name app.newcenturyni.com;

    ssl_certificate /etc/letsencrypt/live/app.newcenturyni.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.newcenturyni.com/privkey.pem;

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
    echo "✅ [ÉXITO] Certificado SSL activado y Nginx reiniciado para app.newcenturyni.com!"
else
    echo "⚠️ Solicitando nuevo certificado con certbot..."
    certbot certonly --nginx -d app.newcenturyni.com --non-interactive --agree-tos -m informatica@newcenturyni.com || true
    
    if [ -f "/etc/letsencrypt/live/app.newcenturyni.com/fullchain.pem" ]; then
        cat << 'EOF' > /etc/nginx/sites-available/app.newcenturyni.com
server {
    listen 80;
    server_name app.newcenturyni.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name app.newcenturyni.com;

    ssl_certificate /etc/letsencrypt/live/app.newcenturyni.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.newcenturyni.com/privkey.pem;

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
        echo "✅ [ÉXITO] Certificado SSL generado y Nginx reiniciado para app.newcenturyni.com!"
    else
        echo "❌ No se pudo encontrar el certificado en /etc/letsencrypt/live/app.newcenturyni.com"
    fi
fi
