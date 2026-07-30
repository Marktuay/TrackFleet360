#!/bin/bash
# ==============================================================================
# Script de Despliegue Automatizado para GCP VM - Frontend TrackFleet360
# Dominio: app.newcenturyni.com
# Puerto interno: 3005
# ==============================================================================

set -e

echo "🚀 Iniciando instalación y configuración de TrackFleet360 Frontend..."

# 1. Actualizar paquetes e instalar dependencias básicas
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx build-essential

# 2. Instalar Node.js 20 LTS (LTS oficial)
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Crear estructura de directorios
TARGET_DIR="${HOME}/TrackFleet360/frontend"
mkdir -p "${TARGET_DIR}"

# 4. Instalar dependencias de Node.js y compilar la app Next.js
echo "🔨 Instalando npm packages y compilando Next.js..."
cd "${TARGET_DIR}"
npm install
NEXT_PUBLIC_API_URL=https://trackfleet360.newcenturyni.com/api/v1 npm run build

# 5. Configurar servicio Systemd
echo "⚙️ Configurando servicio Systemd..."
sudo cp "${TARGET_DIR}/deploy/trackfleet360-frontend.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable trackfleet360-frontend
sudo systemctl restart trackfleet360-frontend

# 6. Configurar Nginx
echo "🌐 Configurando Nginx Reverse Proxy..."
sudo cp "${TARGET_DIR}/deploy/nginx.conf" /etc/nginx/sites-available/trackfleet360-frontend
sudo ln -sf /etc/nginx/sites-available/trackfleet360-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 7. Generar Certificado SSL con Certbot
echo "🔒 Generando Certificado SSL Let's Encrypt para app.newcenturyni.com..."
sudo certbot --nginx -d app.newcenturyni.com --non-interactive --agree-tos --redirect -m admin@newcenturyni.com || echo "⚠️ Asegúrate de que el registro DNS de app.newcenturyni.com ya apunte a la IP de esta VM."

echo "✅ ¡Despliegue del Frontend completado con éxito!"
