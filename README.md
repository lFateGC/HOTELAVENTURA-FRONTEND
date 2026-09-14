# Hotel Aventura — Sistema de Reservas y Gestión de Habitaciones

> **Curso:** Herramientas de Desarrollo (Sección 39171)
>
> **Docente:** Agullas Suares, Marlene Pilar  
> **Año Académico:** 2026  
> **Repositorio Oficial:** [https://github.com/lFateGC/HOTELAVENTURA](https://github.com/lFateGC/HOTELAVENTURA)

---

## 1. Encabezado del Proyecto
* **Nombre del Proyecto:** Hotel Aventura — Sistema de Reservas y Gestión de Habitaciones
* **Curso:** Herramientas de Desarrollo (Sección 39171)
* **Docente:** Agullas Suares, Marlene Pilar
* **Tipo de Proyecto:** Aplicación Web Fullstack con Arquitectura Desacoplada

---

## 2. Descripción del Proyecto
El sistema web **Hotel Aventura** reemplaza la gestión manual tradicional de reservas, habitaciones, huéspedes, servicios, mantenimiento, punto de venta (POS) y caja chica. Su propósito es digitalizar la operativa del hotel, erradicar el overbooking accidental mediante disponibilidad en tiempo real y centralizar la información financiera y operativa en una plataforma colaborativa, segura y completamente auditable.

---

## 3. Integrantes y Roles

| Integrante | Rol Scrum | Módulo Asignado | Rama Git Asignada |
|:---|:---|:---:|:---:|
| **Garay Carlos, Kenny Sebastian** | **Líder de Proyecto & Scrum Master** | **Acceso, Seguridad, Autenticación & Auditoría** | `Kenny` |
| **Urbano Pilco, Héctor Ivan** | Desarrollador | **Servicios del Hotel** | `Hector` |
| **Asto Condori, David Josue** | Desarrollador | **Recepción y Habitaciones** | `David` |
| **Barrera Chavez, Erik Eduardo** | Desarrollador | **Huéspedes y Panel de Control** | `Erik` |
| **Mariño Avila, Eliseo** | Desarrollador | **Punto de Venta (POS), Inventario & Control de Caja** | `Eliseo` |

---

## 4. Tecnologías Usadas

### Backend:
* **Lenguaje:** Java 21 LTS
* **Framework:** Spring Boot 4.1.1
* **Módulos Spring:** Spring Web (MVC), Spring Security (RBAC), Spring Data JPA, Bean Validation
* **Gestor de Dependencias y Construcción:** Gradle Wrapper (`gradlew`)
* **Librerías:** Lombok

### Frontend:
* **Biblioteca:** React 19
* **Lenguaje:** TypeScript
* **Empaquetador y Dev Server:** Vite 8
* **Linter y Calidad de Código:** Oxlint

### Base de Datos e Infraestructura:
* **Base de Datos Cloud:** PostgreSQL alojado en **Supabase** con cifrado SSL obligatorio
* **Control de Versiones y Gestión:** Git, GitHub Monorepo y GitHub Issues

---

## 5. Estructura de Carpetas

```
HOTEL_AVENTURA/
├── .github/                 # Flujos de trabajo y configuraciones de GitHub
│
├── Backend/                 # Proyecto Backend
│   ├── gradle/wrapper/      # Wrapper ejecutable de Gradle
│   ├── src/
│   │   ├── main/java/com/hotelaventura/   # Código fuente Java
│   │   └── main/resources/                # application.properties y recursos
│   ├── build.gradle         # Configuración de dependencias y plugins Gradle
│   └── gradlew / gradlew.bat# Scripts ejecutables de construcción
│
├── Frontend/                # Proyecto Frontend
│   ├── public/              # Recursos estáticos
│   ├── src/
│   │   ├── app/             # Componente raíz
│   │   ├── assets/          # Imágenes y logotipos
│   │   ├── components/      # Componentes UI reutilizables
│   │   ├── pages/           # Vistas principales
│   │   ├── services/        # Clientes de consumo de API REST
│   │   └── styles/          # Hojas de estilo CSS
│   ├── package.json         # Dependencias y scripts de Node.js
│   └── vite.config.ts       # Configuración de Vite
├── README.md                # Documentación referencial del proyecto
└── HELP.md                  # Referencias técnicas Backend
```

---

## 6. Cómo Ejecutar el Proyecto Localmente

### Requisitos Previos:
* **Node.js:** Versión 20+ o 22+ LTS instalada junto con `npm`
* **Java:** JDK 21 LTS instalado y configurado en el `PATH`
* **Git:** Cliente Git instalado en el sistema
* **Conexión a Internet:** Requerida para conectar a la base de datos Supabase

### Pasos de Ejecución:

#### 1. Clonar el repositorio
```bash
git clone https://github.com/lFateGC/HOTELAVENTURA.git
cd HOTELAVENTURA
```

#### 2. Ejecutar el Backend (Spring Boot)
```bash
cd Backend
./gradlew bootRun
```
*El servidor Backend se iniciará en:* `http://localhost:8080`

#### 3. Ejecutar el Frontend (React + Vite)
En una nueva terminal:
```bash
cd Frontend
npm install
npm run dev
```
*El servidor Frontend estará disponible en:* `http://localhost:5173`

---

## 7. Ramas y Flujo de Trabajo Git

* **Rama Principal (`main`):** Rama de producción protegida y estable. No se realizan commits directos; solo recibe código probado y validado.
* **Ramas de Trabajo por Integrante:** Cada integrante cuenta con su rama personal asignada en el repositorio remoto para desarrollar su módulo de manera independiente:
  * `Kenny` ➔ Kenny Garay (Acceso, Seguridad y Auditoría)
  * `Hector` ➔ Héctor Ivan Urbano Pilco (Servicios del Hotel — Limpieza, Mantenimiento y Averías)
  * `David` ➔ David Josue Asto Condori (Recepción y Habitaciones)
  * `Erik` ➔ Erik Eduardo Barrera Chavez (Huéspedes y Dashboard)
  * `Eliseo` ➔ Eliseo Mariño Avila (Punto de Venta — POS, Inventario y Caja)
* **Flujo de Integración:** Cada integrante desarrolla y valida en su rama individual, y solicita la integración a `main` mediante **Pull Request**, el cual requiere revisión y aprobación del Líder del Proyecto.

---

## 8. Estado del Proyecto / Avance Actual (Avance 1)

### Implementado en este Avance 1:
* **Planeación y Alcance:** Especificación formal de los 5 módulos funcionales del sistema hotelero.
* **Asignación de Roles y Ramas:** Delimitación de responsabilidades técnicas individuales y matriz de ramas de trabajo.
* **Infraestructura Git:** Repositorio centralizado en GitHub con rama `main` configurada y protegida.
* **Backlog en GitHub Issues:** Creación de la **Épica #1** (`Planteamiento del Proyecto y alcance`) y sus **5 Sub-issues** (#2 al #6).
* **Scaffolding Inicial y Entorno:** Estructuración de carpetas modulares para Frontend y Backend con dependencias resueltas y compilación verificada en ambos entornos.

### Pendiente para Siguientes Avances:
* **Sprint 2 (Backend):** Modelado de entidades JPA en Supabase PostgreSQL, repositorios, lógica de negocio y APIs REST, para la realización de pruebas para el funcionamiento correcto de los microservicios/servicios del proyecto.
* **Sprint 3 (Frontend UI/UX):** Maquetación interactiva en React 19.
* **Sprint 4 (Integración, Despliegue en la Red y QA):** Levantamiento y despliegue del proyecto a la red/nube (evaluando el despliegue del Backend mediante Render y el Frontend mediante Vercel, conectados a la base de datos Supabase), pruebas de concurrencia para evitar overbooking, auditoría de roles y sustentación final.

---

## 9. Enlace a los Repositorios y Subproyectos

* **Repositorio Central (Monorepo):** [https://github.com/lFateGC/HOTELAVENTURA](https://github.com/lFateGC/HOTELAVENTURA)
* **Módulo Backend:** [Carpeta Backend del Repositorio](https://github.com/lFateGC/HOTELAVENTURA/tree/main/Backend)
* **Módulo Frontend:** [Carpeta Frontend del Repositorio](https://github.com/lFateGC/HOTELAVENTURA/tree/main/Frontend)
* **Gestión de Tareas (Épica #1):** [GitHub Issue #1 — Planteamiento del Proyecto y alcance](https://github.com/lFateGC/HOTELAVENTURA/issues/1)



