#!/bin/bash
# ==============================================================================
# Script de Despliegue Automatizado para GCP VM - Backend TrackFleet360
# Dominio: trackfleet360.newcenturyni.com
# Puerto interno: 8085
# ==============================================================================

set -e

echo "🚀 Iniciando instalación y configuración de TrackFleet360 Backend..."

# 1. Actualizar paquetes e instalar dependencias básicas
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx build-essential

# 2. Instalar Go 1.22.5
if ! command -v go &> /dev/null; then
    echo "📦 Instalando Go 1.22.5..."
    wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
    rm go1.22.5.linux-amd64.tar.gz
    export PATH=$PATH:/usr/local/go/bin
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
fi

# 3. Crear estructura de directorios
sudo mkdir -p /var/www/trackfleet360/backend/uploads
sudo chown -R $USER:$USER /var/www/trackfleet360

# 4. Copiar y compilar la aplicación Go
echo "🔨 Compilando binario Go de producción..."
cd /var/www/trackfleet360/backend
go build -o trackfleet360-backend ./cmd/api

# 5. Configurar servicio Systemd
echo "⚙️ Configurando servicio Systemd..."
sudo cp /var/www/trackfleet360/backend/deploy/trackfleet360-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable trackfleet360-backend
sudo systemctl restart trackfleet360-backend

# 6. Configurar Nginx
echo "🌐 Configurando Nginx Reverse Proxy..."
sudo cp /var/www/trackfleet360/backend/deploy/nginx.conf /etc/nginx/sites-available/trackfleet360-backend
sudo ln -sf /etc/nginx/sites-available/trackfleet360-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 7. Generar Certificado SSL con Certbot
echo "🔒 Generando Certificado SSL Let's Encrypt para trackfleet360.newcenturyni.com..."
sudo certbot --nginx -d trackfleet360.newcenturyni.com --non-interactive --agree-tos --redirect -m admin@newcenturyni.com || echo "⚠️ Asegúrate de que el registro DNS de trackfleet360.newcenturyni.com ya apunte a la IP de esta VM."

echo "✅ ¡Despliegue del Backend completado con éxito!"
