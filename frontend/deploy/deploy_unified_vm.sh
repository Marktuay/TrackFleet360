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

# Asegurar symlinks para que sudo detecte node y npm
NODE_PATH=$(which node 2>/dev/null || echo "/usr/bin/node")
NPM_PATH=$(which npm 2>/dev/null || echo "/usr/bin/npm")
sudo ln -sf "$NODE_PATH" /usr/bin/node 2>/dev/null || true
sudo ln -sf "$NPM_PATH" /usr/bin/npm 2>/dev/null || true

if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2 Manager..."
    sudo "$NPM_PATH" install -g pm2 --force || npm install -g pm2
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
/usr/local/go/bin/go build -o trackfleet360-backend ./cmd/api
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

echo "🔄 Reiniciando proceso PM2 del Frontend..."
pm2 delete trackfleet-frontend || true
pm2 start npm --name "trackfleet-frontend" -- run start -- -p 3000
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

# 7. Configurar Nginx para Frontend (app.newcenturyni.com) con SSL
sudo bash "${TARGET_DIR}/frontend/deploy/configure_nginx_ssl.sh"

echo "✅ DESPLIEGUE UNIFICADO COMPLETADO CON ÉXITO!"
echo "🌐 Panel Web: https://app.newcenturyni.com"
echo "⚙️ API Backend: https://trackfleet360.newcenturyni.com/api/v1"
