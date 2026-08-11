# 📌 Memoria Técnica de Despliegue Unificado: TrackFleet360

---

## 🏛️ 1. Resumen de la Arquitectura en 1 sola VM

Para evitar bloqueos automatizados por falsos positivos de abuso en Google Cloud Platform (GCP), la arquitectura de **TrackFleet360** se consolidó completamente en la instancia activa **`instance-apitrackfleet360`** (IP pública: `35.185.89.55`, Zona: `us-east1-b`).

| Componente | Dominio / URL | Puerto Interno | Gestor de Servicio | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Panel Web Frontend** | `https://app.newcenturyni.com` | `3000` (Next.js 14) | Systemd (`trackfleet360-frontend`) | 🟢 Activo (200 OK) |
| **API REST Backend** | `https://trackfleet360.newcenturyni.com/api/v1` | `8085` (Go / Gin) | Systemd (`trackfleet360-backend`) | 🟢 Activo (200 OK) |
| **Proxy Inverso & SSL** | `app.newcenturyni.com` | `80` / `443` | Nginx + Certbot SSL | 🟢 Candado Seguro |
| **Cortafuegos** | VM `35.185.89.55` | Puertos `22, 80, 443` | UFW Strict Firewall | 🟢 Habilitado |

---

## 🔑 2. Cuentas de Acceso de Administrador

Se configuró el inicio de sesión para que sea **insensible a mayúsculas/minúsculas** y remueva espacios accidentales.

* **Administrador 1**: `informatica@newcenturyni.com` (Contraseña: `admin123`)
* **Administrador 2**: `admin@newcenturyni.com` (Contraseña: `admin123`)
* **Administrador 3**: `admin@trackfleet360.com` (Contraseña: `admin123`)
* **Supervisor**: `supervisor@trackfleet360.com` (Contraseña: `super123`)

---

## 📜 3. Scripts de Despliegue y Mantenimiento

* **Script Maestro de Despliegue**: `frontend/deploy/deploy_unified_vm.sh`
* **Configurador de Nginx & SSL**: `frontend/deploy/fix_nginx.py`
* **Servicio Systemd Frontend**: `frontend/deploy/trackfleet360-frontend.service`
* **Servicio Systemd Backend**: `backend/deploy/trackfleet360-backend.service`

### Comando de Re-despliegue Rápido (SSH):
```bash
cd ~/TrackFleet360 && git reset --hard origin/main && git pull origin main && chmod +x frontend/deploy/deploy_unified_vm.sh && ./frontend/deploy/deploy_unified_vm.sh
```
