# 🧠 MEMORIA TÉCNICA Y LÓGICA DEL PROYECTO: TRACKFLEET360

Documento oficial de arquitectura, reglas de negocio, alcances completados, configuración del entorno móvil e inconvenientes técnicos resueltos en el sistema **TrackFleet360**.

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
* **Puerto del Servicio API**: `8085` (`http://localhost:8085/api/v1` y acceso en red local Wi-Fi `http://192.168.6.123:8085/api/v1`)

### Frontend (Aplicación Web en Next.js)
* **Framework**: Next.js 15 (App Router / TypeScript)
* **Estilos & UI**: Vanilla CSS con variables CSS avanzadas, diseño Glassmorphism, Tailwind CSS y Lucide Icons.
* **Mapas & Geolocalización**: Leaflet.js + CartoDB Dark Matter tiles via `next/dynamic` client-side.
* **Exportación de Datos**: Native Excel workbook (`.xlsx`) mediante SheetJS (`xlsx`) y formato CSV.
* **Puerto del Servidor Web**: `3005` (`http://localhost:3005` y acceso PWA en red local `http://192.168.6.123:3005`)

### Módulo Móvil (Flutter App - `/mobile`)
* **Framework Móvil**: Flutter 3.16.9 (Channel Stable, Dart 3.2.6)
* **Compatibilidad de Entorno**: Configurado en macOS 13.7.8 (Ventura) Intel x86_64.
* **Java SDK**: Java JDK 17 (Ubicación: `/Users/informatica/jdk-17/Contents/Home`).
* **Android SDK**: Android SDK API 34 / Build-Tools 34.0.0 (Ubicación: `/Users/informatica/Library/Android/sdk`).
* **Configuración Gradle**: AGP 8.1.0, Gradle 8.2, `minSdkVersion 24`, MultiDex activo (`androidx.multidex:multidex:2.0.1`) y Java 17 target.
* **Conexión de Red Local**: Apunta directamente a la IP de la Mac `http://192.168.6.123:8085/api/v1` con permiso `android:usesCleartextTraffic="true"` en `AndroidManifest.xml`.

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
   * **Mapa Interactivo (Leaflet Dark Matter)** con Marcador de Origen (🟢 Verde), Destino (🔴 Rojo) y Trazado de Ruta GPS Real siguiendo carreteras principales de Nicaragua (NIC-1 y NIC-12).
   * Modal de Auditoría con evidencia fotográfica del odómetro.
5. **Gestión de Usuarios y Seguridad (`/users`)**:
   * Tabla de usuarios con modales interactivas para Crear, Editar, Cambiar Clave, Desactivar y Eliminar.
6. **Reportería de Subsidio y Cortes 2026 (`/reports`)**:
   * Selector dinámico para alternar entre los **24 Cortes Quincenales de 2026** o el **Acumulado General**.
   * Tabla de liquidación técnica detallada por **Nombres de Conductores**.
   * **Exportación Nativa a Excel (`.xlsx`)** con 3 hojas de trabajo (*Desglose Conductores*, *Resumen por Categoría*, *Calendario Cortes 2026*) y exportador CSV.
7. **Aplicación Móvil Android Nativa y PWA (`/mobile`)**:
   * Registro de recorrido con captura de odómetro, geolocalización GPS y cámara.
   * Compilación de ejecutable ejecutable nativo `.apk` en el entorno local de la Mac (`mobile/build/app/outputs/flutter-apk/app-debug.apk`).
   * Integración con GitHub Actions para despliegue automatizado en la nube.

---

## 6. ⚠️ Inconvenientes Técnicos Encontrados y Soluciones Aplicadas

Este listado detalla los desafíos técnicos encontrados durante el desarrollo para que cualquier agente o desarrollador que continúe el proyecto conozca las decisiones de arquitectura:

| # | Inconveniente / Desafío | Causa Raíz | Solución Implementada |
| :-: | :--- | :--- | :--- |
| **1** | **Ocupación de Puerto 3000** | El puerto 3000 por defecto de Next.js estaba ocupado por otro proceso del sistema. | Se reconfiguró el servidor web Next.js en el puerto `3005` y la API Go en el puerto `8085`. |
| **2** | **Error de Hidratación SSR con Leaflet Maps** | Leaflet requiere el objeto `window` que no existe en el renderizado estático del servidor (SSR). | Se creó el componente `RouteMap` e importó dinámicamente con `next/dynamic` y `{ ssr: false }`. |
| **3** | **Minified React Error #418** | Discrepancia entre HTML prerenderizado en servidor y cliente por llamadas a `Date.now()`. | Se implementó el patrón de estado `mounted` (`useEffect`) para una hidratación 100% limpia. |
| **4** | **Filtrado por Cortes sin Datos** | Al seleccionar una quincena sin recorridos, los componentes quedaban vacíos sin indicación. | Se diseñó un panel de **Estado Vacío (Empty State)** con aviso descriptivo, métricas en `C$ 0.00` y botón de reset. |
| **5** | **Requerimiento de Formato Excel** | Los usuarios requerían reportes tabulares nativos de hoja de cálculo `.xlsx`. | Se integró la librería `xlsx` (SheetJS) con 3 pestañas tabulares avanzadas. |
| **6** | **Incompatibilidad de Flutter con macOS 13 Ventura** | Las versiones recientes de Flutter SDK (3.22+) en Homebrew exigen macOS 14+ (Sonoma) mostrando el error: *`VM initialization failed: Current Mac OS X version 13.0 is lower than minimum supported version 14.0`*. | Se instaló **Flutter SDK 3.16.9 stable** (compatible con macOS 13.7 Ventura) en `/Users/informatica/flutter`. |
| **7** | **Prioridad de PATH en Terminal** | El terminal del usuario seguía ejecutando el binario antiguo en `/usr/local/bin/flutter`. | Se antepuso `export PATH="/Users/informatica/flutter/bin:$PATH"` en `~/.zshrc`. |
| **8** | **Falta de Android SDK y Java JDK** | La compilación nativa `.apk` fallaba por la ausencia de compilador Android y motor Java en la Mac. | Se instaló `android-commandlinetools` via Homebrew, se descargó **OpenJDK 17** en `/Users/informatica/jdk-17` y se configuró Android SDK API 34 en `/Users/informatica/Library/Android/sdk`. |
| **9** | **Error Gradle D8 Dexing (`mergeExtDexDebug`)** | `play-services-location:21.2.0` de `geolocator` provocaba errores de desugaring en la tarea D8 con `minSdkVersion 21`. | Se actualizó a AGP 8.1.0, Gradle 8.2, Java 17, `minSdkVersion 24` y `multiDexEnabled true` en `android/app/build.gradle`. |
| **10** | **Lentitud/Timeout en Login desde Celular Físico** | El servicio `ApiService` apuntaba a `10.0.2.2:8080` (exclusivo de emulador). En un teléfono real provocaba 5s de retardo por timeout, además de faltar el permiso de tráfico HTTP claro. | Se cambió `baseUrl` a la IP de la Mac en la red Wi-Fi `http://192.168.6.123:8085/api/v1` y se habilitó `android:usesCleartextTraffic="true"` en `AndroidManifest.xml` logrando login instantáneo (<100ms). |

---

## 7. 🛠️ Comandos de Operación y Desarrollo

### Servidor Backend Go:
```bash
cd /Users/informatica/Documents/TrackFleet360/backend
PORT=8085 ./trackfleet360-backend
```

### Servidor Frontend Web Next.js:
```bash
cd /Users/informatica/Documents/TrackFleet360/frontend
npx next start -p 3005
```

### Compilación Móvil Android (Local):
```bash
cd /Users/informatica/Documents/TrackFleet360/mobile
export JAVA_HOME=/Users/informatica/jdk-17/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
/Users/informatica/flutter/bin/flutter build apk --debug
```
* **Ubicación del APK producido**: `mobile/build/app/outputs/flutter-apk/app-debug.apk`

---

## 8. 🔑 Credenciales y Rutas de Prueba

* **Repositorio GitHub**: `https://github.com/Marktuay/TrackFleet360.git`
* **Acceso Web Admin/Supervisor**: `http://localhost:3005` (o `http://192.168.6.123:3005`)
  * **Usuario Admin**: `admin@trackfleet360.com` / `admin123`
  * **Usuario Conductor**: `conductor@trackfleet360.com` / `driver123`
