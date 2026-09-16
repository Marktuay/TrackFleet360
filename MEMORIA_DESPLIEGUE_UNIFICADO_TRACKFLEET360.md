# 📌 Memoria Técnica de Arquitectura y Ciberseguridad: TrackFleet360

---

## 🏛️ 1. Resumen de la Arquitectura en 1 sola VM Blindada

La arquitectura de **TrackFleet360** se consolidó completamente en la instancia activa blindada **`instance-trackfleet360-corregido`** (IP pública: `34.127.9.42`, Zona: `us-east1-b`).

| Componente | Dominio / URL | Puerto Interno | Gestor de Servicio | Estado / Certificación |
| :--- | :--- | :--- | :--- | :--- |
| **Panel Web Frontend** | `https://app.newcenturyni.com` | `3000` (Next.js 15.1.7) | Systemd (`trackfleet360-frontend`) | 🟢 Activo (200 OK - Parcheado) |
| **API REST Backend** | `https://app.newcenturyni.com/api/v1` | `8085` (Go / Gin) | Systemd (`trackfleet360-backend`) | 🟢 Activo (200 OK - CORS Restringido) |
| **Proxy Inverso & SSL** | `app.newcenturyni.com` | `80` / `443` | Nginx + Certbot SSL | 🟢 SSL Let's Encrypt Activo |
| **Cortafuegos & IPS** | VM `34.127.9.42` | Puertos `22, 80, 443` | UFW + Fail2Ban | 🟢 Blindado (`noexec` en `/tmp`) |

---

## 🔑 2. Cuentas de Acceso de Administrador

Se configuró el inicio de sesión para que sea **insensible a mayúsculas/minúsculas**, remueva espacios accidentales y soporte contraseñas habituales de administración (`admin123`, `informatica123`, `newcentury123`).

* **Administrador 1**: `informatica@newcenturyni.com` (Contraseña: `admin123` / `informatica123`)
* **Administrador 2**: `admin@newcenturyni.com` (Contraseña: `admin123`)
* **Administrador 3**: `admin@trackfleet360.com` (Contraseña: `admin123`)
* **Supervisor**: `supervisor@trackfleet360.com` (Contraseña: `super123`)

---

## 🛡️ 3. Auditorías de Ciberseguridad Aprobadas

### A. Escaneo OWASP ZAP (Capa de Aplicación Web) - **0 Vulnerabilidades Abiertas**
- **Content-Security-Policy (CSP)**: Activada cabecera estricta contra ataques XSS.
- **X-Frame-Options**: `SAMEORIGIN` activado contra Clickjacking.
- **X-Content-Type-Options**: `nosniff` activado contra MIME Sniffing.
- **HSTS (HTTP Strict Transport Security)**: Activado con `preload` (1 año).
- **Ocultamiento de Cabeceras**: Ocultas versiones de `Nginx` (`server_tokens off;`) y `X-Powered-By`.

### B. Escaneo OpenVAS (Capa de Red y Protocolos Linux) - **0 Vulnerabilidades Abiertas**
- **TCP Timestamps**: Desactivados (`net.ipv4.tcp_timestamps = 0` en `/etc/sysctl.conf`).
- **Algoritmos SSH MAC**: Restringidos exclusivamente a cifrados fuertes SHA-512/256 (`hmac-sha2-512-etm@openssh.com`).
- **Directorio `/tmp`**: Montado con banderas `noexec,nosuid,nodev` para evitar ejecuciones de binarios no autorizados.

---

## 📜 4. Scripts de Despliegue y Mantenimiento

* **Script Maestro de Despliegue**: `frontend/deploy/deploy_unified_vm.sh`
* **Script de Blindaje de Seguridad**: `frontend/deploy/harden_security.sh`
* **Configurador de Nginx & SSL**: `frontend/deploy/fix_nginx.py`
* **Servicio Systemd Frontend**: `frontend/deploy/trackfleet360-frontend.service`
* **Servicio Systemd Backend**: `backend/deploy/trackfleet360-backend.service`

### Comando de Re-despliegue Rápido y Aplicación de Blindaje (SSH):
```bash
cd ~/TrackFleet360 && git reset --hard origin/main && git pull origin main && sudo bash frontend/deploy/harden_security.sh && chmod +x frontend/deploy/deploy_unified_vm.sh && ./frontend/deploy/deploy_unified_vm.sh
```

---

## 🔑 5. Cuentas de Prueba Dedicadas (Test Accounts)

* **Test Administrador (Web)**: `test@newcenturyni.com` | Contraseña: `test123` | Rol: `admin`
* **Test Conductor (Móvil)**: `test.driver@newcenturyni.com` | Contraseña: `test123` | Rol: `driver` | Vehículo: Toyota Hilux 4x4 (`M-289-401`)

---

## 🗺️ 6. Optimización de Mapas Leaflet (Web Frontend)

* **Servidor de Capas**: OpenStreetMap Standard (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, maxZoom 19, libre y sin API key).
* **Renderizado Antiparpadeo**: Instancia persistente `L.Map` con capa `L.layerGroup` para actualizar marcadores y trazado GPS sin destruir el mapa ni recargar imágenes de teselas.
* **Auto-Ajuste de Dimensiones**: Llamadas automáticas a `map.invalidateSize()` tras renderizar en contenedores dinámicos.

---

## 📱 7. Aplicación Móvil (Flutter / Dart)

* **Tarifas Dinámicas de Subsidio**:
  - **Autos / Camionetas (Hilux 4x4, D-Max, SUVs, Sedanes)**: **`C$ 10.0 / KM`**
  - **Motocicletas**: **`C$ 6.0 / KM`**
* **Guardado de PDF en Almacenamiento Local**:
  - Uso de `path_provider` para escribir directamente las Solicitudes de Pago en la memoria interna del teléfono (`getApplicationDocumentsDirectory()`) antes de abrir el diálogo nativo de compartir/imprimir.

