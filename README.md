# 🚛 TrackFleet360 - Sistema de Control de Flota y Subsidios Vehiculares

[![Go Version](https://img.shields.io/badge/Go-1.22-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GPS_Maps-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

**TrackFleet360** es una plataforma empresarial integral para la gestión de flotas de vehículos, auditoría de kilometraje en tiempo real, detección de inconsistencias por trazado GPS y liquidación automatizada de **nóminas de subsidio vehicular en Córdobas (C$)** conforme al **Calendario Oficial de Cortes 2026**.

---

## 🌟 Características Principales

### 💰 1. Liquidación Diferenciada de Subsidios (C$)
- **Automóviles y Camionetas (`auto`)**: **`10.00 C$` por kilómetro**.
- **Motocicletas (`moto`)**: **`6.00 C$` por kilómetro**.
- Consolidado automático del monto total a pagar por conductor y por tipo de vehículo.

### 📅 2. Calendario Oficial de Cortes de Nómina 2026
- Integración de los **24 Cortes Quincenales Oficiales del Año 2026** (2 cortes por mes).
- Agrupación automática de los recorridos aprobados por el rango de fechas quincenal.
- Vista de **Fecha Probable de Pago**, Estado de Nómina (*Pagado*, *En Auditoría*, *Pendiente*) y consulta de **Acumulado Histórico**.

### 🇳🇮 3. Geolocalización & Mapas de Ruta GPS (Nicaragua)
- **Mapas Interactivos (CartoDB Dark Matter)** centrados en el territorio de Nicaragua (Managua, León, Tipitapa, Granada, Chinandega, etc.).
- **Trazado GPS Real**: Visualización de la polínea exacta de coordenadas registradas por el vehículo en movimiento.
- Marcadores de **Origen (🟢 Verde)** y **Destino (🔴 Rojo)** con direcciones físicas.

### 📊 4. Exportación Nativa a Excel (`.xlsx`) y CSV
- Generación de libros nativos de Excel multicapa:
  1. **Desglose por Conductores**: Nombres, licencias, KM Auto, KM Moto y liquidación en C$.
  2. **Resumen por Categoría**: Totales comparativos.
  3. **Calendario de Cortes 2026**: Programación anual oficial de fechas de pago.

### 🛡️ 5. Auditoría Anti-Fraude & Odómetro
- Contraste automático: $\text{Diferencia (KM)} = \text{KM Decl. Odómetro} - \text{KM Trazado GPS}$.
- Alerta e inhabilitación temporal (*Revisión Requerida*) si la discrepancia supera los 5.0 KM.
- Evidencia fotográfica del odómetro digital/analógico capturada por el conductor.

### 👥 6. Módulo de Gestión de Usuarios & Seguridad (RBAC)
- Control de Acceso basado en Roles (`admin`, `supervisor`, `driver`).
- Modales interactivos para Crear, Editar datos/contraseñas con cifrado `bcrypt`, cambiar rol, desactivar y eliminar cuentas.

---

## 📁 Estructura del Repositorio (Monorepo)

```text
TrackFleet360/
├── backend/                   # API REST en Go 1.22 + Gin Framework
│   ├── cmd/api/               # Punto de entrada de la aplicación Go
│   ├── internal/              # Handlers, modelos, middleware RBAC y servicios de corte
│   └── deploy/                # Archivos Nginx y Systemd para servidores
├── frontend/                  # Aplicación Web en Next.js 15 + React 18
│   ├── src/app/               # Rutas (dashboard, journeys, reports, users, vehicles)
│   ├── src/components/        # Componentes UI y Mapa de Rutas GPS (RouteMap)
│   └── deploy/                # Archivos Nginx y Systemd para servidores
├── mobile/                    # Código fuente de aplicación móvil Flutter
├── MEMORY_TRACKFLEET360.md    # Memoria técnica oficial del proyecto
└── DEPLOYMENT_SEPARATE_SERVERS.md # Manual de despliegue en servidores VPS/Google Cloud
```

---

## 🚀 Inicio Rápido en Entorno Local

### Requisitos Previos
- **Go**: 1.21 o superior
- **Node.js**: 18.0 o superior
- **npm** / **yarn**

### 1. Iniciar el Backend (API Go)
```bash
cd backend
go build -o trackfleet360-backend ./cmd/api
PORT=8085 ./trackfleet360-backend
```
> La API estará lista en: `http://localhost:8085/api/v1`

### 2. Iniciar el Frontend (Next.js Web)
```bash
cd frontend
npm install
npm run build
npx next start -p 3005
```
> La aplicación web estará lista en: `http://localhost:3005`

---

## 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@trackfleet360.com` | `admin123` |
| **Supervisor** | `supervisor@trackfleet360.com` | `admin123` |
| **Conductor** | `conductor1@trackfleet360.com` | `admin123` |

---

## ☁️ Despliegue en Producción (Google Cloud / VPS)

Para desplegar el Backend y el Frontend en **dos máquinas independientes en Google Cloud Compute Engine**, consulta la guía detallada:
📖 [**Manual de Despliegue en Servidores Separados**](file:///Users/informatica/Documents/TrackFleet360/DEPLOYMENT_SEPARATE_SERVERS.md)

---

## 📄 Licencia

Este proyecto es de uso privado e interno. Todos los derechos reservados &copy; 2026 TrackFleet360.
