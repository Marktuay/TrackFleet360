#!/bin/bash
set -e

echo "🛡️ Ejecutando blindaje de seguridad en instance-apitrackfleet360..."

# 1. Eliminar cualquier archivo sospechoso en /tmp
sudo pkill -9 -f "/tmp/" || true
sudo rm -rf /tmp/dashboard /tmp/v.json /tmp/v* /tmp/*.sh /tmp/*.py /tmp/*.bin 2>/dev/null || true

# 2. Configurar permisos restringidos en /tmp
sudo chmod 1777 /tmp

# 3. Asegurar UFW Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable || true

echo "✅ Blindaje de servidor completado con éxito."
