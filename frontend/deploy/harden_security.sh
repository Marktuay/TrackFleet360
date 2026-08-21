#!/bin/bash
set -e

echo "🛡️ Ejecutando blindaje de seguridad en instance-apitrackfleet360..."

# 1. Eliminar cualquier archivo sospechoso en /tmp
sudo pkill -9 -f "/tmp/" || true
sudo rm -rf /tmp/dashboard /tmp/v.json /tmp/v* /tmp/*.sh /tmp/*.py /tmp/*.bin 2>/dev/null || true

# 2. Configurar permisos restringidos y noexec en /tmp
sudo chmod 1777 /tmp
sudo mount -o remount,noexec,nosuid,nodev /tmp 2>/dev/null || true

# 3. Asegurar UFW Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable || true

# 4. Instalar y activar Fail2Ban contra fuerza bruta
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

echo "✅ Blindaje de servidor completado con éxito."
