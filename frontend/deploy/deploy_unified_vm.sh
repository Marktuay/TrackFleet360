#!/bin/bash
# ==============================================================================
# Script de Despliegue Unificado para GCP VM: instance-apitrackfleet360
# Dominio Frontend: app.newcenturyni.com (Puerto 3000 -> Nginx -> HTTPS 443)
# Dominio Backend: trackfleet360.newcenturyni.com (Puerto 8085 -> Nginx -> HTTPS 443)
# ==============================================================================

set -e

echo "🚀 Iniciando despliegue unificado en instance-apitrackfleet360..."

# 1. Actualizar paquetes y dependencias del sistema
sudo apt update
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx build-essential ufw

# 2. Configurar Cortafuegos UFW Blindado
echo "🛡️ Aplicando reglas de cortafuegos UFW estricto..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable || true

# 3. Instalar Node.js 20 LTS & PM2
echo "📦 Instalando/Verificando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# Asegurar ejecutable npm en /usr/bin/npm
if [ -f "/usr/lib/node_modules/npm/bin/npm-cli.js" ]; then
    sudo ln -sf /usr/lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm
fi

# Asegurar PATH
export PATH=$PATH:/usr/local/bin:/usr/bin:/usr/local/go/bin

if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2 Manager..."
    sudo npm install -g pm2 --force || true
fi

# 4. Clonar / Actualizar Repositorio
TARGET_DIR="${HOME}/TrackFleet360"
if [ ! -d "${TARGET_DIR}" ]; then
    echo "📥 Clonando repositorio desde GitHub..."
    git clone https://github.com/Marktuay/TrackFleet360.git "${TARGET_DIR}"
else
    echo "🔄 Actualizando repositorio desde GitHub..."
    cd "${TARGET_DIR}"
    git pull origin main
fi

# 5. Compilar y Desplegar Backend Go (api/v1)
echo "⚙️ Compilando API Backend Go..."
cd "${TARGET_DIR}/backend"
GO_BIN=$(which go 2>/dev/null || echo "/usr/local/go/bin/go")
if [ ! -x "$GO_BIN" ] && [ -f "/usr/bin/go" ]; then
    GO_BIN="/usr/bin/go"
fi
"$GO_BIN" build -o trackfleet360-backend ./cmd/api
sudo cp "${TARGET_DIR}/backend/deploy/trackfleet360-backend.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable trackfleet360-backend
sudo systemctl restart trackfleet360-backend

# 6. Compilar y Desplegar Frontend Next.js
echo "💻 Compilando Panel Web Frontend Next.js..."
cd "${TARGET_DIR}/frontend"
export NEXT_PUBLIC_API_URL="https://trackfleet360.newcenturyni.com/api/v1"
npm install
npm run build

echo "🔄 Configurando servicio Systemd nativo para el Frontend Next.js..."
sudo cp "${TARGET_DIR}/frontend/deploy/trackfleet360-frontend.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable trackfleet360-frontend
sudo systemctl restart trackfleet360-frontend

# 7. Configurar Nginx para Frontend y Backend con SSL
sudo python3 "${TARGET_DIR}/frontend/deploy/fix_nginx.py"

echo "✅ DESPLIEGUE UNIFICADO COMPLETADO CON ÉXITO!"
echo "🌐 Panel Web: https://app.newcenturyni.com"
echo "⚙️ API Backend: https://trackfleet360.newcenturyni.com/api/v1"
