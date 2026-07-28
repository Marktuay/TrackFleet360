# 🧠 MEMORIA TÉCNICA Y LÓGICA DEL PROYECTO: TRACKFLEET360

Documento oficial de arquitectura, reglas de negocio, alcances completados e inconvenientes técnicos resueltos en el sistema **TrackFleet360**.

---

## 1. 📌 Resumen y Propósito del Sistema

**TrackFleet360** es una plataforma integral de gestión de flota vehicular y auditoría anti-fraude diseñada para supervisar el uso de vehículos corporativos (automóviles, camionetas y motocicletas), validar los recorridos declarados por los conductores contra trazados GPS reales y liquidar la **nómina de subsidio vehicular** según el calendario oficial de cortes quincenales.

---

## 2. 🏗️ Arquitectura Técnica del Sistema

### Backend (API REST en Go)
* **Lenguaje**: Go 1.22
* **Framework Web**: Gin Gonic (`github.com/gin-gonic/gin`)
* **Seguridad & Autenticación**: JWT (JSON Web Tokens) con cifrado `bcrypt` para contraseñas de usuarios.
* **Control de Acceso (RBAC)**: Middleware de autorización con roles (`admin`, `supervisor`, `driver`).
* **Puerto del Servicio API**: `8085` (`http://localhost:8085/api/v1`)

### Frontend (Aplicación Web en Next.js)
* **Framework**: Next.js 15 (App Router / TypeScript)
* **Estilos & UI**: Vanilla CSS con variables CSS avanzadas, diseño Glassmorphism, Tailwind CSS y Lucide Icons.
* **Mapas & Geolocalización**: Leaflet.js + CartoDB Dark Matter tiles via `next/dynamic` client-side.
* **Exportación de Datos**: Native Excel workbook (`.xlsx`) mediante SheetJS (`xlsx`) y formato CSV.
* **Puerto del Servidor Web**: `3005` (`http://localhost:3005`)

---

## 3. 💰 Reglas de Negocio y Lógica Financiera

### A. Tarifas de Subsidio por Tipo de Vehículo
El cálculo monetario del subsidio en Córdobas (`C$`) se liquida automáticamente según la categoría del vehículo registrado:
* **Automóviles y Camionetas (`auto`)**: **`10.00 C$` por kilómetro** recorrido.
* **Motocicletas (`moto`)**: **`6.00 C$` por kilómetro** recorrido.

$$ \text{Subsidio Total (C\$)} = (\text{KM Auto} \times 10.00) + (\text{KM Moto} \times 6.00) $$

---

### B. Calendario Oficial de Cortes de Nómina 2026
El pago de subsidios se agrupa en **24 Cortes Quincenales Oficiales al Año** (2 cortes por mes):
* **Enero**: 7 y 22 de enero
* **Febrero**: 6 y 20 de febrero
* **Marzo**: 6 y 20 de marzo
* **Abril**: 7 y 21 de abril
* **Mayo**: 7 y 21 de mayo
* **Junio**: 5 y 22 de junio
* **Julio**: 7 y 22 de julio
* **Agosto**: 6 y 20 de agosto
* **Septiembre**: 7 y 21 de septiembre
* **Octubre**: 7 y 22 de octubre
* **Noviembre**: 6 y 20 de noviembre
* **Diciembre**: 7 y 21 de diciembre

* **Lógica de Agrupación**: Cada recorrido es asignado al período de corte según si su `start_time` se encuentra dentro del rango `[start_date, cutoff_date]`.
* **Modo Acumulado**: Opción para consultar el consolidado histórico general sin filtro de fechas.

---

### C. Auditoría Anti-Fraude de Recorridos
El sistema calcula la discrepancia entre el odómetro declarado por el conductor y la distancia calculada por la traza GPS real:

$$ \text{Diferencia (KM)} = \text{KM Odómetro Decl.} - \text{KM GPS Real} $$

* **Flagging Automático**: Si $\text{Diferencia} > 5.0\text{ KM}$, el recorrido cambia automáticamente a estado **`flagged`** (*Revisión Requerida*).
* El supervisor debe auditar la foto del odómetro final y el trazado en el mapa GPS para **Aprobar** o **Rechazar** la liberación del subsidio.

---

## 4. 👥 Módulo de Usuarios y Seguridad (RBAC)

* **Jerarquía de Roles**:
  * `admin`: Acceso total, gestión de usuarios, vehículos, recorridos y reportes.
  * `supervisor`: Auditoría de recorridos, aprobación/rechazo de subsidios y reportería.
  * `driver`: Registro de inicios/finales de trayectos y carga de fotografías de odómetro.
* **Operaciones CRUD de Usuarios**:
  * Crear usuario con email, nombre, rol y contraseña bcrypt.
  * Modificar datos personales, cambiar rol o actualizar contraseña.
  * Desactivar/Bloquear cuentas activas.
  * Eliminar usuarios.

---

## 5. 🎯 Alcances Entregados (100% Funcionales)

1. **Dashboard Financiero (`/dashboard`)**:
   * KPIs en Córdobas (`C$`), tarjetas de vehículos activos, odómetros y alertas de discrepancia.
2. **Gestión de Vehículos (`/vehicles`)**:
   * Registro con asignación de categoría (*Auto 10 C$/km* o *Moto 6 C$/km*) y acumulación de kilometraje y subsidio por vehículo.
3. **Gestión de Conductores (`/drivers`)**:
   * Control de licencias, teléfonos y estado de conductores asignados.
4. **Monitoreo y Validación con Mapa GPS (`/journeys`)**:
   * Tabla interactiva de trayectos.
   * **Mapa Interactivo (Leaflet Dark Matter)** con Marcador de Origen (🟢 Verde), Destino (🔴 Rojo) y Trazado de Ruta GPS Real (🔵 Polínea Cian).
   * Modal de Auditoría con evidencia fotográfica del odómetro.
5. **Gestión de Usuarios y Seguridad (`/users`)**:
   * Tabla de usuarios con modales interactivas para Crear, Editar, Cambiar Clave, Desactivar y Eliminar.
6. **Reportería de Subsidio y Cortes 2026 (`/reports`)**:
   * Selector dinámico para alternar entre los **24 Cortes Quincenales de 2026** o el **Acumulado General**.
   * Tabla de liquidación técnica detallada por **Nombres de Conductores**.
   * **Exportación Nativa a Excel (`.xlsx`)** con 3 hojas de trabajo (*Desglose Conductores*, *Resumen por Categoría*, *Calendario Cortes 2026*) y exportador CSV.

---

## 6. ⚠️ Inconvenientes Identificados y Soluciones Aplicadas

| Inconveniente / Desafío | Causa Raíz | Solución Implementada |
| :--- | :--- | :--- |
| **Ocupación de Puerto 3000** | El puerto 3000 por defecto de Next.js estaba siendo utilizado por otro servicio del sistema. | Se reconfiguró el servidor web Next.js para ejecutarse de forma persistente en el puerto `3005` y la API Go en el puerto `8085`. |
| **Error de Hidratación SSR con Leaflet Maps** | Leaflet requiere el objeto global `window` que no está disponible durante el renderizado estático del servidor (SSR) de Next.js. | Se creó el componente `RouteMap` e importó dinámicamente usando `next/dynamic` con la opción `{ ssr: false }`. |
| **Minified React Error #418** | Discrepancia entre HTML prerenderizado en servidor y cliente por componentes dinámicos con `Date.now()`. | Se implementó el patrón `mounted` (`useEffect`) para garantizar una hidratación cliente 100% limpia. |
| **Filtrado por Cortes de Nómina sin Datos** | Si una quincena no tenía recorridos registrados, la interfaz mostraba componentes en blanco o sin contexto. | Se diseñó un panel de **Estado Vacío (Empty State)** con aviso descriptivo, métricas en `C$ 0.00` y botón de retorno al Acumulado. |
| **Requerimiento de Formato Excel** | Los clientes requerían formato nativo de hoja de cálculo en lugar de texto llano CSV. | Se integró la librería `xlsx` (SheetJS) estructurando un libro de Excel con múltiples hojas tabulares. |

---

## 7. 🚀 Estado Actual y Ejecución

* **Servidor Backend API (Go)**: Ejecutándose en `http://localhost:8085/api/v1`
* **Servidor Frontend (Next.js)**: Ejecutándose en `http://localhost:3005`
* **Credenciales de Acceso de Prueba**:
  * **Email**: `admin@trackfleet360.com`
  * **Password**: `admin123`
