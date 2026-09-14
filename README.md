# Hotel Aventura — Frontend (SPA React)

> **Curso:** Herramientas de Desarrollo (Sección 39171) — Sistema web modular para la gestión hotelera integral en tiempo real con control de versiones en Git.  
> **Docente:** Agullas Suares, Marlene Pilar  
> **Año Académico:** 2026  
> **Repositorio Oficial Frontend:** [https://github.com/lFateGC/HOTELAVENTURA-FRONTEND](https://github.com/lFateGC/HOTELAVENTURA-FRONTEND)  
> **Repositorio Oficial Backend:** [https://github.com/lFateGC/HOTELAVENTURA-BACKEND](https://github.com/lFateGC/HOTELAVENTURA-BACKEND)

---

## 1. Encabezado del Proyecto
* **Nombre del Proyecto:** Hotel Aventura — Frontend (Sistema de Reservas y Gestión de Habitaciones)
* **Curso:** Herramientas de Desarrollo (Sección 39171)
* **Docente:** Agullas Suares, Marlene Pilar
* **Tipo de Proyecto:** Single Page Application (SPA) con Arquitectura Desacoplada (Frontend en React 19 + TypeScript + Vite)

---

## 2. Descripción del Proyecto
El frontend del sistema **Hotel Aventura** proporciona una interfaz moderna, interactiva y reactiva que digitaliza y moderniza la operativa diaria del hotel, reemplazando las libretas y hojas de cálculo manuales tradicionales.

La aplicación permite a los recepcionistas, administradores y personal de servicio:
* Visualizar en tiempo real el estado y disponibilidad de las habitaciones a través de un **Rack Interactivo** para evitar el sobrealquiler (*overbooking*).
* Procesar registros de **Check-In / Check-Out** tanto en modalidad **Pernocte** (noche completa) como **Day Use** (estancias diurnas por horas).
* Administrar la base de datos de **Huéspedes** con validación y búsqueda rápida de documentos de identidad.
* Coordinar las tareas operativas de **Limpieza, Mantenimiento y Control de Averías** por habitación.
* Gestionar las ventas del hotel mediante un **Punto de Venta (POS)** integrado con control de inventario y arqueo de caja chica.

---

## 3. Integrantes y Roles

| Integrante | Rol Scrum | Módulo Asignado en Frontend | Rama Git Asignada |
|:---|:---|:---|:---:|
| **Garay Carlos, Kenny Sebastian** | **Líder de Proyecto & Scrum Master** | **Acceso, Seguridad, Autenticación & Auditoría**<br>*(Login, protección de rutas por rol, interceptor de sesión JWT y visualizador de registros de auditoría)* | `Kenny` |
| **Urbano Pilco, Héctor Ivan** *(U22244557)* | Desarrollador | **Servicios del Hotel**<br>*(Tablero kanban de operarios de limpieza, control de mantenimiento y reporte de averías)* | `Hector` |
| **Asto Condori, David Josue** | Desarrollador | **Recepción y Habitaciones**<br>*(Rack interactivo en tiempo real, modal de Check-In Pernocte / Day Use y tarifas)* | `David` |
| **Barrera Chavez, Erik Eduardo** | Desarrollador | **Huéspedes y Panel de Control**<br>*(Búsqueda y registro de huéspedes, Dashboard con tarjetas de ocupación y KPIs)* | `Erik` |
| **Mariño Avila, Eliseo** | Desarrollador | **Punto de Venta (POS), Inventario & Control de Caja**<br>*(Terminal de ventas rápida de consumos, catálogo de productos y arqueo de caja)* | `Eliseo` |

---

## 4. Tecnologías Usadas

* **Biblioteca UI:** [React 19](https://react.dev/) — Arquitectura declarativa de componentes funcionales y hooks modernos.
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) — Tipado estático riguroso para interfaces de datos, props y control de estados.
* **Herramienta de Construcción y Dev Server:** [Vite 8](https://vite.dev/) — Empaquetado ultra rápido con reemplazo de módulos en caliente (*Hot Module Replacement - HMR*).
* **Linter y Calidad de Código:** [Oxlint](https://oxc.rs/) — Análisis estático de código de alto rendimiento para asegurar buenas prácticas.
* **Estilos:** CSS3 / Vanilla CSS modular con variables de diseño estructuradas para responsividad y temas.
* **Activos Gráficos:** Formato vectorial SVG para iconos escalables e imágenes optimizadas para la web.
* **Consumo de API:** Arquitectura de servicios basada en Fetch API / Axios para comunicación REST con el Backend (Spring Boot 4).

---

## 5. Estructura de Carpetas

```
HOTELAVENTURA-FRONTEND/
├── public/                  # Recursos estáticos servidos sin procesar
│   ├── favicon.svg          # Favicon oficial del Hotel Aventura
│   └── icons.svg            # Sprite optimizado de iconos vectoriales SVG
├── src/
│   ├── app/                 # Componente principal de la aplicación (App.tsx)
│   ├── assets/              # Imágenes, logotipos e ilustraciones (hero.png, react.svg, vite.svg)
│   ├── components/          # Componentes de interfaz reutilizables (Botones, Modales, Tablas, Badges)
│   ├── config/              # Variables de entorno y configuración de conexión con la API Backend
│   ├── hooks/               # Custom hooks reutilizables (useAuth, useHabitaciones, usePOS)
│   ├── layouts/             # Plantillas de diseño estructural (Sidebar, Topbar, MainLayout)
│   ├── pages/               # Vistas principales de cada módulo:
│   │   ├── Login/           # Vista de autenticación y control de acceso
│   │   ├── Rack/            # Matriz interactiva de habitaciones en tiempo real
│   │   ├── CheckIn/         # Formularios de entrada (Pernocte y Day Use)
│   │   ├── Huespedes/       # Directorio, historial y registro de clientes
│   │   ├── Operaciones/     # Tablero operativo de limpieza y control de averías
│   │   └── POS/             # Terminal de punto de venta, cobros y arqueo de caja
│   ├── services/            # Clientes de consumo de API REST hacia el Backend Spring Boot
│   ├── styles/              # Hojas de estilo CSS globales, variables de tema y módulos
│   ├── types/               # Modelos e interfaces TypeScript para tipado estricto
│   ├── utils/               # Funciones auxiliares (formateo de moneda PEN, validaciones DNI)
│   └── main.tsx             # Punto de entrada y montaje del árbol DOM de React
├── .gitignore               # Archivos y carpetas omitidos por el control de versiones
├── .oxlintrc.json           # Reglas de validación estática de código
├── index.html               # Documento HTML base de la Single Page Application
├── package.json             # Manifiesto de dependencias npm y scripts del proyecto
├── package-lock.json        # Registro exacto del árbol de versiones de dependencias
├── tsconfig.json            # Configuración raíz del compilador TypeScript
├── tsconfig.app.json        # Configuración específica de TypeScript para el código cliente
├── tsconfig.node.json       # Configuración de TypeScript para las herramientas de Vite
├── vite.config.ts           # Configuración del servidor y empaquetador Vite
└── README.md                # Documentación oficial del repositorio Frontend
```

---

## 6. Cómo Ejecutar el Proyecto Localmente

### Requisitos Previos:
* **Node.js:** Versión 20.x o 22.x LTS instalada ([Descargar Node.js](https://nodejs.org/))
* **Gestor de paquetes:** `npm` (instalado automáticamente con Node.js)
* **Navegador web moderno:** Google Chrome, Microsoft Edge, Mozilla Firefox o Brave
* **Git:** Cliente Git configurado en el sistema operativo

### Pasos de Instalación y Ejecución:

#### 1. Clonar el repositorio oficial de Frontend
```bash
git clone https://github.com/lFateGC/HOTELAVENTURA-FRONTEND.git
cd HOTELAVENTURA-FRONTEND
```

#### 2. Instalar las dependencias del proyecto
```bash
npm install
```

#### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

#### 4. Acceder a la aplicación
Abre tu navegador e ingresa a la dirección local indicada por Vite:
```
http://localhost:5173/
```

### Scripts Disponibles:
| Comando | Descripción |
|:---|:---|
| `npm run dev` | Inicia el servidor de desarrollo con recarga rápida instantánea (HMR). |
| `npm run build` | Compila y optimiza el código TypeScript y los activos para producción en la carpeta `dist/`. |
| `npm run lint` | Ejecuta el análisis de calidad de código ultrarrápido con Oxlint. |
| `npm run preview` | Levanta un servidor local para previsualizar la compilación final de producción. |

---

## 7. Ramas y Flujo de Trabajo Git

* **Rama Principal (`main`):** Rama de producción del repositorio. Es una rama protegida y estable; no recibe commits directos, únicamente integraciones probadas mediante Pull Requests.
* **Ramas de Trabajo por Integrante:** Cada miembro del equipo trabaja de forma aislada en una rama nombrada con su nombre de pila para implementar su módulo asignado:
  * `Kenny` ➔ **Kenny Garay**: Interfaz de autenticación, control de sesiones, protección de rutas y auditoría de accesos.
  * `Hector` ➔ **Héctor Urbano**: Panel de asignación de limpieza, actualización de estados de cuarto y reporte de averías.
  * `David` ➔ **David Asto**: Interfaz del Rack de habitaciones, filtros por piso y modales de Check-in.
  * `Erik` ➔ **Erik Barrera**: Formulario de búsqueda y registro de huéspedes, y tarjetas de estadísticas del Dashboard.
  * `Eliseo` ➔ **Eliseo Mariño**: Terminal visual de punto de venta (POS), catálogo con control de stock y panel de caja.
* **Flujo de Integración:**
  1. Cada desarrollador realiza commits descriptivos en su rama personal.
  2. Se verifica que el proyecto compile localmente (`npm run build`).
  3. Se genera un **Pull Request** hacia `main`.
  4. El Líder de Proyecto (**Kenny Garay**) revisa el código, resuelve conflictos si existieran y aprueba el *merge*.

---

## 8. Estado del Proyecto / Avance Actual (Avance 1)

### Implementado en este Avance 1:
* **Entorno y Herramientas:** Configuración completa de React 19, TypeScript y Vite 8 con Oxlint.
* **Separación de Repositorios:** Repositorio Frontend desacoplado e independiente del Backend.
* **Estructura de Componentes:** Definición de la arquitectura modular de carpetas (`components/`, `pages/`, `services/`, `types/`).
* **Verificación de Compilación:** Build de producción verificado al 100% libre de errores.
* **Gestión de Proyecto en GitHub:** Matriz de integrantes, roles, ramas individuales y seguimiento de backlog con GitHub Issues.

### Pendiente para Siguientes Avances:
* **Sprint 2:** Maquetación inicial de interfaces por módulo e integración de componentes visuales.
* **Sprint 3 (Frontend UI/UX Dinámico):** Conexión con la API REST del Backend (Spring Boot 4), manejo reactivo del estado de habitaciones y validación de formularios.
* **Sprint 4 (Despliegue y QA):** Despliegue en la nube mediante **Vercel**, pruebas de usabilidad y sustentación final.

---

## 9. Enlace a los Repositorios del Proyecto

* **Repositorio Frontend (Este Repositorio):** [https://github.com/lFateGC/HOTELAVENTURA-FRONTEND](https://github.com/lFateGC/HOTELAVENTURA-FRONTEND)
* **Repositorio Backend (Spring Boot 4 + Java 21):** [https://github.com/lFateGC/HOTELAVENTURA-BACKEND](https://github.com/lFateGC/HOTELAVENTURA-BACKEND)
* **Gestión de Backlog & Issues:** [GitHub Issues del Proyecto](https://github.com/lFateGC/HOTELAVENTURA-FRONTEND/issues)
