# Hotel Aventura — Backend (API REST Spring Boot)

> **Curso:** Herramientas de Desarrollo (Sección 39171) — Servicio API REST y lógica de negocio para el sistema hotelero Hotel Aventura.  
> **Docente:** Agullas Suares, Marlene Pilar  
> **Año Académico:** 2026  
> **Repositorio Principal:** [https://github.com/lFateGC/HOTELAVENTURA](https://github.com/lFateGC/HOTELAVENTURA)  
> **Repositorio / Módulo Frontend:** [Enlace a Frontend](../Frontend/README.md)

---

## 1. Encabezado del Proyecto
* **Nombre del Proyecto:** Hotel Aventura — Backend (API REST de Reservas y Gestión de Habitaciones)
* **Curso:** Herramientas de Desarrollo (Sección 39171)
* **Docente:** Agullas Suares, Marlene Pilar
* **Tipo de Aplicación:** API RESTful robusta y desacoplada con persistencia relacional en la nube

---

## 2. Descripción del Proyecto
Módulo Backend del sistema **Hotel Aventura**. Centraliza la lógica de negocio, reglas transaccionales, seguridad y persistencia de datos del hotel. Reemplaza la manipulación manual de registros asegurando transacciones ACID que erradican el overbooking accidental, gestionan el ciclo de vida de las habitaciones (disponible, ocupada, limpieza, mantenimiento), calculan tarifas automáticas de Check-In (Pernocte / Day Use), controlan el stock del punto de venta y auditan cada acción por roles.

---

## 3. Integrantes y Roles

| Integrante | Rol Scrum / Módulo Asignado | Rama Git Asignada |
|:---|:---|:---:|
| **Garay Carlos, Kenny Sebastian** | **Líder de Proyecto & Scrum Master** / **Acceso, Seguridad, Autenticación & Auditoría** | `Kenny` |
| **Urbano Pilco, Héctor Ivan** *(U22244557)* | Desarrollador Backend / **Servicios del Hotel (Limpieza, Mantenimiento & Control de Averías)** | `Hector` |
| **Asto Condori, David Josue** | Desarrollador Backend & Core / **Recepción y Habitaciones (Rack en Tiempo Real)** | `David` |
| **Barrera Chavez, Erik Eduardo** | Desarrollador Backend & Analítica / **Huéspedes y Panel de Control (Dashboard & KPIs)** | `Erik` |
| **Mariño Avila, Eliseo** | Desarrollador Backend & Transacciones / **Punto de Venta (POS), Inventario & Control de Caja** | `Eliseo` |

---

## 4. Tecnologías Usadas
* **Lenguaje:** Java 21 LTS
* **Framework:** Spring Boot 4.1.1
* **Librerías y Módulos Spring:**
  * `spring-boot-starter-webmvc`: Exposición de endpoints REST y serialización JSON.
  * `spring-boot-starter-data-jpa`: Capa de persistencia relacional y ORM con Hibernate.
  * `spring-boot-starter-security`: Control de acceso y autorización por roles (RBAC).
  * `spring-boot-starter-validation`: Validación de contratos de entrada con Bean Validation.
  * `org.postgresql:postgresql`: Driver JDBC para conexión a base de datos.
  * `org.projectlombok:lombok`: Reducción de código boilerplate (Getters, Setters, Builders).
* **Gestor de Construcción:** Gradle 9.x con Gradle Wrapper (`gradlew`)
* **Base de Datos Cloud:** PostgreSQL en **Supabase**

---

## 5. Estructura de Carpetas

```
Backend/
├── gradle/wrapper/          # Binarios y configuración del wrapper de Gradle
├── src/
│   ├── main/
│   │   ├── java/com/hotelaventura/
│   │   │   ├── config/      # Configuración de Seguridad, CORS, Auditoría
│   │   │   ├── controller/  # Controladores REST (/api/habitaciones, /api/auth, /api/pos, etc.)
│   │   │   ├── dto/         # Request y Response Data Transfer Objects validados
│   │   │   ├── entity/      # Entidades JPA (@Entity, @Table, relaciones relacionales)
│   │   │   ├── exception/   # Manejo global de excepciones (@RestControllerAdvice)
│   │   │   ├── repository/  # Interfaces Spring Data JPA
│   │   │   ├── service/     # Interfaces de reglas de negocio
│   │   │   │   └── impl/    # Implementación de los servicios
│   │   │   └── util/        # Utilidades transversales
│   │   └── resources/
│   │       └── application.properties   # Configuración de puerto, perfiles y Supabase JDBC
│   └── test/                # Pruebas unitarias e integración con JUnit Platform
├── build.gradle             # Definición de dependencias y plugins de Spring Boot
├── gradlew                  # Script ejecutable en entornos Linux / macOS / Bash
├── gradlew.bat              # Script ejecutable en Windows PowerShell / CMD
└── settings.gradle          # Configuración del proyecto Gradle
```

---

## 6. Cómo Ejecutar el Proyecto Localmente

### Requisitos Previos:
* **Java Development Kit (JDK):** Versión 21 LTS instalada y variable de entorno `JAVA_HOME` configurada
* **Conexión a Internet:** Para resolver dependencias en Maven Central y conectar con Supabase

### Pasos de Ejecución:

#### 1. Navegar a la carpeta Backend
```bash
cd Backend
```

#### 2. Compilar y verificar dependencias
* **En Windows (PowerShell/CMD):**
  ```powershell
  .\gradlew.bat compileJava
  ```
* **En Linux/macOS:**
  ```bash
  ./gradlew compileJava
  ```

#### 3. Iniciar el servidor Spring Boot
```bash
./gradlew bootRun
```
*El servidor Backend estará escuchando peticiones en:* `http://localhost:8080/`

---

## 7. Ramas y Flujo de Trabajo Git
* **Rama Principal (`main`):** Rama de producción del monorepo.
* **Ramas por Desarrollador:**
  * `Kenny`: Modelos de usuario, roles RBAC, filtros JWT, interceptores de auditoría y endpoints `/api/auth/**` y `/api/auditoria/**` (Kenny Garay — Líder de Proyecto).
  * `Hector`: Entidades de tareas de limpieza, máquina de estados de habitación, registro y resolución de incidencias/averías y endpoints `/api/operaciones/**` (Héctor Urbano).
  * `David`: Entidades de habitación, reservas, validación de overbooking y endpoints `/api/habitaciones/**` y `/api/check-in/**` (David Asto).
  * `Erik`: Entidad de huéspedes, historial y endpoints analíticos `/api/huespedes/**` y `/api/dashboard/kpis` (Erik Barrera).
  * `Eliseo`: Catálogo de productos, control de stock y endpoints transaccionales `/api/pos/**` y `/api/caja/**` (Eliseo Mariño).
* **Políticas de Integración:** Cada desarrollador prueba localmente con `./gradlew check` en su rama personal (`Kenny`, `Hector`, `David`, `Erik`, `Eliseo`) y solicita Pull Request hacia `main` bajo supervisión y aprobación del Líder del Proyecto (**Kenny Garay**).

---

## 8. Estado del Proyecto / Avance Actual (Avance 1)

### Implementado en este Avance 1:
* Arquitectura base en Spring Boot 4.1.1 con Java 21 LTS y Gradle.
* Configuración de dependencias (Spring Web, Spring Security, JPA, PostgreSQL, Lombok).
* Scaffolding de estructura por capas listo para desarrollo.
* Compilación y arranque del servidor Tomcat embebido verificados localmente.

### Pendiente para Siguientes Avances:
* **Sprint 2 (Backend Core 100% — Enfoque Prioritario):** Conexión con base de datos en la nube **Supabase (PostgreSQL)**, creación de entidades JPA, repositorios, servicios y APIs REST para pruebas de funcionamiento de los servicios/microservicios del proyecto.
* **Sprint 4 (Despliegue y QA):** Levantamiento y despliegue del servicio Backend a la red mediante **Render** (o plataforma afín) conectado a Supabase, pruebas de concurrencia y sustentación final.

---

## 9. Enlace al Módulo Frontend
* **Módulo Frontend (React 19 + Vite):** [Ver documentación de Frontend](../Frontend/README.md)
* **Repositorio Central en GitHub:** [https://github.com/lFateGC/HOTELAVENTURA](https://github.com/lFateGC/HOTELAVENTURA)