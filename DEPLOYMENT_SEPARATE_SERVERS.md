# 🌐 GUÍA DE DESPLIEGUE EN SERVIDORES SEPARADOS (BACKEND & FRONTEND)

Esta guía explica paso a paso cómo desplegar **TrackFleet360** cuando el **Backend (Go API)** y el **Frontend (Next.js Web)** residen en dos servidores/máquinas virtuales independientes (Ej: Servidor A y Servidor B).

---

## 📐 Esquema de Arquitectura

```
  [ NAVEGADOR DEL USUARIO ]
       │              │
       │ (HTTPS)      │ (HTTPS)
       ▼              ▼
 ┌──────────────┐   ┌──────────────┐
 │ SERVIDOR B   │   │ SERVIDOR A   │
 │ Frontend Web │   │ Backend API  │
 │ (Next.js)    │   │ (Go API)     │
 │ Puerto: 3005 │   │ Puerto: 8085 │
 └──────────────┘   └──────────────┘
```

* **Servidor A (Backend Go API)**: `https://api.trackfleet360.com` (o IP `192.168.1.100:8085`)
* **Servidor B (Frontend Next.js)**: `https://app.trackfleet360.com` (o IP `192.168.1.200:3005`)

---

## 🛠️ PASO 1: Configurar CORS en el Backend (Servidor A)

Al estar en IP/Dominios distintos, el navegador exige cabeceras **CORS (Cross-Origin Resource Sharing)**.

En `backend/cmd/api/main.go`, el middleware de Gin permite la comunicación entre orígenes:

```go
router.Use(func(c *gin.Context) {
    c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // O el dominio 'https://app.trackfleet360.com'
    c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
    c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    
    if c.Request.Method == "OPTIONS" {
        c.AbortWithStatus(204)
        return
    }
    c.Next()
})
```

### Compilar y Ejecutar en Servidor A (Backend):
```bash
# Compilar binario linux
GOOS=linux GOARCH=amd64 go build -o trackfleet360-backend ./cmd/api

# Ejecutar con variable de puerto
PORT=8085 ./trackfleet360-backend
```

### Configuración Nginx en Servidor A (`/etc/nginx/sites-available/api.conf`):
```nginx
server {
    listen 80;
    server_name api.trackfleet360.com;

    location / {
        proxy_pass http://127.0.0.1:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🛠️ PASO 2: Configurar la URL de la API en el Frontend (Servidor B)

En el Servidor B donde se ejecuta Next.js, se configura la variable de entorno que apunta a la dirección del **Servidor A**.

### Crear o editar `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.trackfleet360.com/api/v1
```
*(Si no usas dominio y usas la IP directamente: `NEXT_PUBLIC_API_URL=http://192.168.1.100:8085/api/v1`)*.

### Compilar y Ejecutar en Servidor B (Frontend):
```bash
cd frontend

# Instalar dependencias y compilar
npm install
npm run build

# Iniciar servidor web de producción en puerto 3005
npx next start -p 3005
```

### Configuración Nginx en Servidor B (`/etc/nginx/sites-available/frontend.conf`):
```nginx
server {
    listen 80;
    server_name app.trackfleet360.com;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔒 PASO 3: Certificados SSL Gratuitos con Certbot (HTTPS)

Para asegurar las comunicaciones entre ambos servidores:

### En Servidor A (Backend):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.trackfleet360.com
```

### En Servidor B (Frontend):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d app.trackfleet360.com
```

---

## ⚙️ PASO 4: Servicios Automáticos (Systemd)

Para que los servicios se inicien automáticamente si el servidor se reinicia:

### En Servidor A (`/etc/systemd/system/trackfleet360-backend.service`):
```ini
[Unit]
Description=TrackFleet360 Go Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/trackfleet360/backend
ExecStart=/var/www/trackfleet360/backend/trackfleet360-backend
Restart=always
Environment=PORT=8085

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable trackfleet360-backend
sudo systemctl start trackfleet360-backend
```

### En Servidor B (`/etc/systemd/system/trackfleet360-frontend.service`):
```ini
[Unit]
Description=TrackFleet360 Next.js Frontend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/trackfleet360/frontend
ExecStart=/usr/bin/npx next start -p 3005
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3005

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable trackfleet360-frontend
sudo systemctl start trackfleet360-frontend
```

---

## 📋 Resumen de Puntos Clave para Servidores Separados

1. **La variable `NEXT_PUBLIC_API_URL`**: Debe apuntar a la IP o Dominio público del **Servidor A (Backend)**.
2. **CORS en Go**: Debe estar activado en el Backend para aceptar peticiones que provengan de la IP/Dominio del **Servidor B (Frontend)**.
3. **Manejo de HTTPS**: Si activas HTTPS en el Frontend, el Backend **también debe tener HTTPS**, de lo contrario el navegador bloqueará la conexión por *"Mixed Content Security Violation"*.
