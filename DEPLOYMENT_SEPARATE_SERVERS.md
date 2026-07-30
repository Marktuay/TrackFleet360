# 🌐 GUÍA DE DESPLIEGUE EN MÁQUINAS VIRTUALES GOOGLE CLOUD (VMs)

Esta guía explica paso a paso cómo desplegar **TrackFleet360** en dos Máquinas Virtuales (VMs) independientes en **Google Cloud Compute Engine** bajo el dominio `newcenturyni.com` usando certificados SSL directos con Certbot (Let's Encrypt).

---

## 📐 Esquema de Arquitectura de Producción

```
                       [ NAVEGADOR / APP MÓVIL ]
                            │              │
                   (HTTPS)  │              │  (HTTPS)
                            ▼              ▼
           ┌──────────────────┐          ┌───────────────────────────┐
           │ GCP VM: FRONTEND │          │ GCP VM: BACKEND           │
           │ app.newcenturyni.com        │ trackfleet360.newcenturyni.com
           │ Puerto: 3005     │          │ Puerto: 8085              │
           └──────────────────┘          └───────────────────────────┘
```

* **Servidor Backend (Go API)**: `https://trackfleet360.newcenturyni.com` (IP: `35.185.89.55`, Puerto interno `8085`)
* **Servidor Frontend (Next.js)**: `https://app.newcenturyni.com` (IP: `35.231.193.40`, Puerto interno `3005`)

---

## 🛠️ PASO 1: Registros DNS y Cortafuegos GCP

1. **Registros A en el Proveedor de DNS**:
   * `trackfleet360.newcenturyni.com` ➔ `35.185.89.55`
   * `app.newcenturyni.com` ➔ `35.231.193.40`

2. **Google Cloud Firewall Rules**:
   * Permitir tráfico en los puertos `80` (HTTP) y `443` (HTTPS) en ambas instancias VM.

---

## 🛠️ PASO 2: Despliegue del Backend (`trackfleet360.newcenturyni.com`)

En la VM del Backend (Ubuntu 22.04 LTS):

```bash
# Clonar repositorio o copiar archivos del proyecto
cd /var/www/trackfleet360/backend

# Ejecutar el script automatizado de configuración
bash deploy/setup_gcp_backend.sh
```

### Configuración Nginx (`/etc/nginx/sites-available/trackfleet360-backend`):
```nginx
server {
    listen 80;
    server_name trackfleet360.newcenturyni.com;

    location / {
        proxy_pass http://127.0.0.1:8085;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /var/www/trackfleet360/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 🛠️ PASO 3: Despliegue del Frontend (`app.newcenturyni.com`)

En la VM del Frontend (Ubuntu 22.04 LTS):

```bash
# Clonar repositorio o copiar archivos del proyecto
cd /var/www/trackfleet360/frontend

# Ejecutar el script automatizado de configuración
bash deploy/setup_gcp_frontend.sh
```

### Variable de Entorno (`frontend/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://trackfleet360.newcenturyni.com/api/v1
```

### Configuración Nginx (`/etc/nginx/sites-available/trackfleet360-frontend`):
```nginx
server {
    listen 80;
    server_name app.newcenturyni.com;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔒 PASO 4: Certificados SSL Gratuitos con Certbot (HTTPS)

El script de instalación ejecuta Certbot automáticamente. Si necesitas renovar o generar manualmente:

```bash
# En VM Backend:
sudo certbot --nginx -d trackfleet360.newcenturyni.com

# En VM Frontend:
sudo certbot --nginx -d app.newcenturyni.com
```

---

## ⚙️ PASO 5: Verificación de Servicios Systemd

```bash
# Estado del Backend
sudo systemctl status trackfleet360-backend

# Estado del Frontend
sudo systemctl status trackfleet360-frontend
```

---

## 📋 Resumen de Puntos Clave

1. **Variable `NEXT_PUBLIC_API_URL`**: Debe apuntar a `https://trackfleet360.newcenturyni.com/api/v1`.
2. **CORS en Go**: Permite la comunicación entre `app.newcenturyni.com` y `trackfleet360.newcenturyni.com`.
3. **App Móvil Flutter**: Conectada a `https://trackfleet360.newcenturyni.com/api/v1` en `mobile/lib/services/api_service.dart`.

