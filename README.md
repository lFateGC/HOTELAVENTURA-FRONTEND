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

## 7. Ramas y Flujo de Trabajo Git (Guía Paso a Paso para el Equipo)

### 7.1. Ramas Oficiales del Proyecto
* **Rama Principal (`main`):** Rama de producción oficial, estable y protegida. **Está prohibido hacer commits directos a `main`**. Todo cambio debe ingresar exclusivamente mediante Pull Request validado.
* **Ramas Asignadas por Integrante:**
  * `Kenny` ➔ **Kenny Garay** (Acceso, Seguridad y Auditoría)
  * `Hector` ➔ **Héctor Urbano** (Servicios del Hotel — Limpieza, Mantenimiento y Averías)
  * `David` ➔ **David Asto** (Recepción y Habitaciones — Rack)
  * `Erik` ➔ **Erik Barrera** (Huéspedes y Dashboard de KPIs)
  * `Eliseo` ➔ **Eliseo Mariño** (Punto de Venta — POS, Inventario y Caja)

---

### 7.2. Guía Práctica de Trabajo con Git y Visual Studio Code

#### Paso 1: Clonar el repositorio y abrir en VS Code
Tienes dos formas sencillas de hacerlo:

* **Opción A: Desde Visual Studio Code (Recomendado):**
  1. Abre **Visual Studio Code**.
  2. Presiona la combinación de teclas `Ctrl + Shift + P` para abrir la paleta de comandos.
  3. Escribe `Git: Clone` y presiona **Enter**.
  4. Pega la URL del repositorio:
     ```
     https://github.com/lFateGC/HOTELAVENTURA-FRONTEND.git
     ```
  5. Selecciona la carpeta en tu computadora donde deseas guardarlo (por ejemplo: `C:\Proyectos`).
  6. Cuando VS Code termine de clonar, haz clic en **"Open" / "Abrir repositorio"**.

* **Opción B: Desde la Terminal (PowerShell / Git Bash):**
  ```bash
  # 1. Ve a la carpeta donde guardas tus proyectos
  cd C:\Users\TuUsuario\Desktop\Proyectos

  # 2. Clona el repositorio
  git clone https://github.com/lFateGC/HOTELAVENTURA-FRONTEND.git

  # 3. Entra a la carpeta del proyecto
  cd HOTELAVENTURA-FRONTEND

  # 4. Abre el proyecto en VS Code
  code .
  ```

---

#### Paso 2: Cambiarte a tu Rama de Trabajo Asignada

Cada integrante debe trabajar en su rama personal para no sobreescribir el trabajo de los demás:

* **Desde la Terminal:**
  ```bash
  # Ver en qué rama estás actualmente
  git branch

  # Si tu rama ya existe en el remoto (ejemplo para Héctor):
  git checkout Hector

  # Si vas a crear tu rama localmente a partir de lo último de main:
  git checkout -b Hector origin/main
  ```
  *(Reemplaza `Hector` por tu propio nombre: `David`, `Erik`, `Eliseo` o `Kenny`)*

* **Desde la Interfaz de VS Code:**
  1. En la **esquina inferior izquierda** de la barra de estado de VS Code, verás el nombre de la rama actual (por ejemplo, `main`).
  2. Haz clic sobre ese nombre. Se desplegará una lista de ramas en la parte superior.
  3. Selecciona tu rama asignada (o haz clic en *"Create new branch..."* con tu nombre).

---

#### Paso 3: ¿Cómo sincronizar tu rama con lo último de `main`? *(¡Muy Importante!)*
Cuando el líder o un compañero integre nuevas funciones a `main`, debes actualizar tu rama personal para tener siempre el código más reciente y evitar conflictos:

```bash
# 1. Asegúrate de estar posicionado en tu rama personal
git checkout Hector

# 2. Trae y fusiona los últimos cambios de main hacia tu rama
git pull origin main
```

> **¿Qué hace este comando?** Descarga de GitHub todas las actualizaciones de `main` y las une automáticamente con tu rama personal, manteniendo todo al día.
> 
> *En VS Code:* Puedes presionar `Ctrl + Shift + P` ➔ escribir `Git: Pull From...` ➔ elegir `origin` ➔ seleccionar `origin/main`.

---

#### Paso 4: Trabajar, confirmar cambios (Commits) y buenas prácticas

Mientras avances con el código de tu módulo:

1. **Revisar qué archivos has modificado:**
   ```bash
   git status
   ```
2. **Agregar los archivos preparados para el commit:**
   ```bash
   git add .
   ```
3. **Crear el commit con un mensaje descriptivo:**
   ```bash
   git commit -m "feat(rack): implementación de filtros por piso"
   ```
   *Convención sugerida para los mensajes de commit:*
   * `feat:` Para una nueva funcionalidad (ej. `feat(pos): agregar botón de cobro`)
   * `fix:` Para corregir un error (ej. `fix(login): validación de contraseña vacía`)
   * `style:` Para cambios visuales o de CSS (ej. `style(rack): ajustar tarjetas de habitaciones`)
   * `docs:` Para cambios en documentación o README (ej. `docs: actualizar guía de instalación`)

* **Hacer el Commit en VS Code con interfaz gráfica:**
  1. Abre la pestaña **Control de código fuente** (*Source Control*) en la barra lateral izquierda (`Ctrl + Shift + G`).
  2. En el recuadro superior, escribe el mensaje de tu commit (ejemplo: `feat: diseño de modal de check-in`).
  3. Haz clic en el botón azul **Commit** (o presiona `Ctrl + Enter`).

---

#### Paso 5: Subir tus avances a GitHub (`git push`)

Una vez que hayas realizado tus commits y probado que todo compile sin errores:

```bash
# 1. Probar que el build compila correctamente
npm run build

# 2. Subir tu rama personal a GitHub
git push origin Hector
```
*(Reemplaza `Hector` por el nombre de tu rama)*

* **En VS Code:** Haz clic en el botón **"Sync Changes" / "Sincronizar cambios"** o haz clic en los tres puntos `...` del panel de Git y selecciona **Push**.

---

#### Paso 6: Crear un Pull Request (PR) en GitHub hacia `main`

Cuando hayas terminado una tarea o avance de tu módulo y quieras que se integre a la versión oficial:

1. Entra al repositorio en GitHub: [HOTELAVENTURA-FRONTEND](https://github.com/lFateGC/HOTELAVENTURA-FRONTEND).
2. Verás una barra amarilla con el botón **"Compare & pull request"**. Haz clic sobre él.
   *(Si no aparece, ve a la pestaña **Pull requests** ➔ botón verde **New pull request**)*.
3. Configura las ramas de la siguiente forma:
   * **base:** `main` ⬅️ **compare:** `TuNombre` *(ej. `Hector`)*.
4. Escribe un título claro (ejemplo: `feat: Módulo de servicios de habitaciones completo`).
5. En la descripción, detalla brevemente qué pantallas o componentes agregaste.
6. En el panel lateral derecho, en la sección **Reviewers**, asigna al Líder del Proyecto (**Kenny Garay** / `lFateGC`).
7. Haz clic en **"Create pull request"**.
8. El Líder revisará el código, verificará que no rompa la compilación y lo aprobará para unirlo a `main`.

---

#### Paso 7: ¿Qué hacer si hay un conflicto de código?
Si al hacer `git pull origin main` sale un mensaje de **CONFLICT**:
1. Abre los archivos marcados en rojo en **Visual Studio Code**.
2. Verás opciones encima de las líneas en conflicto:
   * **Accept Current Change:** Mantiene lo que tú escribiste.
   * **Accept Incoming Change:** Acepta lo que vino de `main`.
   * **Accept Both Changes:** Mantiene ambas cosas.
3. Selecciona la opción adecuada según el caso, guarda el archivo (`Ctrl + S`), y ejecuta en la terminal:
   ```bash
   git add .
   git commit -m "merge: resolución de conflictos con main"
   git push origin TuNombre
   ```

---

### 7.3. Reglas de Oro para el Equipo
1. 🚫 **NUNCA hagas commits directos sobre la rama `main`**. Trabaja siempre en tu rama con tu nombre.
2. 🔄 **SIEMPRE haz `git pull origin main`** antes de empezar a trabajar para tener los últimos cambios del equipo.
3. 🧪 **SIEMPRE ejecuta `npm run build`** antes de hacer push para garantizar que no haya errores de compilación ni de TypeScript.
4. 💬 **Haz commits frecuentes y con mensajes claros**. No esperes al final de la semana para hacer un solo commit gigante.

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
