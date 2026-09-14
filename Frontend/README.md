# Hotel Aventura — Frontend (SPA React)

> **Curso:** Herramientas de Desarrollo (Sección 39171) — Interfaz de usuario interactiva y responsiva para el sistema hotelero Hotel Aventura.  
> **Docente:** Agullas Suares, Marlene Pilar  
> **Año Académico:** 2026  
> **Repositorio Principal:** [https://github.com/lFateGC/HOTELAVENTURA](https://github.com/lFateGC/HOTELAVENTURA)  
> **Repositorio / Módulo Backend:** [Enlace a Backend](../Backend/README.md)

---

## 1. Encabezado del Proyecto
* **Nombre del Proyecto:** Hotel Aventura — Frontend (Sistema de Reservas y Gestión de Habitaciones)
* **Curso:** Herramientas de Desarrollo (Sección 39171)
* **Docente:** Agullas Suares, Marlene Pilar
* **Tipo de Aplicación:** Single Page Application (SPA) en React con Vite y TypeScript

---

## 2. Descripción del Proyecto
Módulo Frontend del sistema **Hotel Aventura**. Proporciona una interfaz visual interactiva y reactiva que reemplaza las libretas y hojas de cálculo tradicionales. Permite visualizar el estado en tiempo real de las habitaciones (Rack dinámico), realizar Check-In en modalidades Pernocte y Day Use con validaciones inmediatas, registrar huéspedes, gestionar tareas de limpieza/mantenimiento y operar el punto de venta (POS) y caja.

---

## 3. Integrantes y Roles

| Integrante | Rol Scrum / Módulo Asignado | Rama Git Asignada |
|:---|:---|:---:|
| **Garay Carlos, Kenny Sebastian** | **Líder de Proyecto & Scrum Master** / **Acceso, Seguridad, Autenticación & Auditoría** | `Kenny` |
| **Urbano Pilco, Héctor Ivan** *(U22244557)* | Desarrollador / **Servicios del Hotel (Limpieza, Mantenimiento & Control de Averías)** | `Hector` |
| **Asto Condori, David Josue** | Desarrollador / **Recepción y Habitaciones (Rack en Tiempo Real)** | `David` |
| **Barrera Chavez, Erik Eduardo** | Desarrollador / **Huéspedes y Panel de Control (Dashboard & KPIs)** | `Erik` |
| **Mariño Avila, Eliseo** | Desarrollador / **Punto de Venta (POS), Inventario & Control de Caja** | `Eliseo` |

---

## 4. Tecnologías Usadas
* **Biblioteca UI:** React 19
* **Lenguaje:** TypeScript (~5.7 / ~6.0)
* **Herramienta de Construcción y Dev Server:** Vite 8 con HMR (Hot Module Replacement)
* **Linter de Rendimiento:** Oxlint
* **Estilos:** CSS3 / Vanilla CSS con variables de diseño modulares
* **Formatos de Activos:** SVG vectorial y optimizaciones web

---

## 5. Estructura de Carpetas

```
Frontend/
├── public/                  # Recursos estáticos servidos directamente
│   ├── favicon.svg          # Favicon del hotel
│   └── icons.svg            # Sprite de iconos SVG
├── src/
│   ├── app/                 # Componente principal de la aplicación (App.tsx)
│   ├── assets/              # Imágenes, logotipos e ilustraciones (hero.png, react.svg, vite.svg)
│   ├── components/          # Componentes de interfaz reutilizables (Botones, Modales, Tablas)
│   ├── config/              # Configuración de URLs y variables de entorno del cliente
│   ├── hooks/               # Custom hooks reutilizables (useAuth, useHabitaciones)
│   ├── layouts/             # Plantillas de diseño estructural (Sidebar, Topbar, Layout general)
│   ├── pages/               # Vistas principales de cada módulo:
│   │   ├── Login/           # Vista de autenticación y roles
│   │   ├── Rack/            # Matriz interactiva de habitaciones en tiempo real
│   │   ├── CheckIn/         # Formularios de entrada (Pernocte / Day Use)
│   │   ├── Huespedes/       # Búsqueda y gestión de clientes
│   │   ├── Operaciones/     # Tablero de operarios de limpieza y averías
│   │   └── POS/             # Terminal de punto de venta y arqueo de caja
│   ├── services/            # Servicios de consumo de API REST hacia el Backend
│   ├── styles/              # Hojas de estilo CSS globales y por módulo
│   ├── types/               # Definiciones e interfaces TypeScript para tipado estricto
│   ├── utils/               # Funciones de utilidad (formateo de moneda, validación DNI)
│   └── main.tsx             # Punto de entrada de la aplicación React
├── .oxlintrc.json           # Configuración del linter Oxlint
├── package.json             # Dependencias y scripts de ejecución
├── tsconfig.json            # Configuración raíz de TypeScript
├── tsconfig.app.json        # Configuración TypeScript para el código cliente
└── vite.config.ts           # Configuración del servidor de desarrollo Vite
```

---

## 6. Cómo Ejecutar el Proyecto Localmente

### Requisitos Previos:
* **Node.js:** Versión 20.x o 22.x LTS instalada
* **Gestor de paquetes:** `npm` (incluido con Node.js)
* **Navegador web moderno:** Chrome, Edge, Firefox, Brave

### Pasos de Ejecución:

#### 1. Navegar a la carpeta Frontend
```bash
cd Frontend
```

#### 2. Instalar dependencias
```bash
npm install
```

#### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

#### 4. Abrir en el navegador
El servidor iniciará localmente en:
`http://localhost:5173/`

#### Scripts Disponibles:
* `npm run dev`: Inicia el servidor de desarrollo con recarga rápida.
* `npm run build`: Compila y optimiza la aplicación para producción con TypeScript.
* `npm run lint`: Ejecuta el análisis de calidad con Oxlint.
* `npm run preview`: Previsualiza localmente la compilación de producción.

---

## 7. Ramas y Flujo de Trabajo Git
* **Rama Principal (`main`):** Rama de producción del monorepo.
* **Ramas por Integrante:**
  * `Kenny`: Módulo de Login, protección de rutas por rol, interceptor de sesión JWT y visualizador de auditoría (Kenny Garay — Líder de Proyecto).
  * `Hector`: Panel de tareas de servicios/limpieza de habitaciones y tablero de averías técnicas (Héctor Urbano).
  * `David`: Panel interactivo de habitaciones y modal de Check-In (David Asto).
  * `Erik`: Formulario de registro/búsqueda de huéspedes y tarjetas de métricas del Dashboard (Erik Barrera).
  * `Eliseo`: Interfaz de terminal POS, catálogo de productos con stock y arqueo de caja (Eliseo Mariño).
* **Flujo de Trabajo:** Desarrollo individual en ramas personales (`Kenny`, `Hector`, `David`, `Erik`, `Eliseo`) ➔ pruebas locales de compilación (`npm run build`) ➔ Pull Request hacia `main` supervisado y aprobado por el Líder del Proyecto (**Kenny Garay**).

---

## 8. Estado del Proyecto / Avance Actual (Avance 1)

### Implementado en este Avance 1:
* Configuración completa de React 19 + TypeScript + Vite con Oxlint.
* Arquitectura modular de carpetas lista para desarrollo (`components/`, `pages/`, `services/`, etc.).
* Servidor de desarrollo y build de producción verificados al 100% sin errores.
* Integración del flujo de trabajo colaborativo con ramas en GitHub.

### Pendiente para Siguientes Avances:
* **Sprint 3 (Frontend UI/UX):** Maquetación e interactividad de las pantallas de los 5 módulos (Rack interactivo, modales de Check-in, terminal POS, formulario de averías y Dashboard).
* Consumo e integración con los endpoints REST del Backend desarrollados en el Sprint 2.
* **Sprint 4 (Despliegue y QA):** Levantamiento y despliegue del Frontend a la red mediante **Vercel** conectado a la API de Render y Supabase, pruebas E2E y sustentación final.

---

## 9. Enlace al Módulo Backend
* **Módulo Backend (Spring Boot + Java 21):** [Ver documentación del Backend](../Backend/README.md)
* **Repositorio Central en GitHub:** [https://github.com/lFateGC/HOTELAVENTURA](https://github.com/lFateGC/HOTELAVENTURA)
