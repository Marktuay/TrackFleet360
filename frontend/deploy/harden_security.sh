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

# 5. Desactivar TCP Timestamps (OpenVAS Low Finding)
sudo sysctl -w net.ipv4.tcp_timestamps=0 || true
if ! grep -q "net.ipv4.tcp_timestamps" /etc/sysctl.conf; then
    echo "net.ipv4.tcp_timestamps = 0" | sudo tee -a /etc/sysctl.conf
else
    sudo sed -i 's/.*net.ipv4.tcp_timestamps.*/net.ipv4.tcp_timestamps = 0/' /etc/sysctl.conf
fi

# 6. Desactivar algoritmos MAC débiles en SSH (OpenVAS Low Finding)
if ! grep -q "^MACs" /etc/ssh/sshd_config; then
    echo "MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com" | sudo tee -a /etc/ssh/sshd_config
else
    sudo sed -i 's/^MACs.*/MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com/' /etc/ssh/sshd_config
fi
sudo systemctl restart sshd 2>/dev/null || sudo systemctl restart ssh 2>/dev/null || true

echo "✅ Blindaje de servidor completado con éxito."
