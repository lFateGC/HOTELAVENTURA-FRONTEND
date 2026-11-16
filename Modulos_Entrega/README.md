# Estructura Modular de Entrega — Hotel Aventura Frontend

Este directorio organiza el código fuente del proyecto **Hotel Aventura Frontend** dividido estrictamente en **5 Módulos funcionales**, listos para que cada responsable suba su trabajo a su rama correspondiente en GitHub.

---

### Distribución de Módulos y Responsables

| Módulo | Nombre Funcional | Responsable / Rama | Contenido Principal |
| :--- | :--- | :--- | :--- |
| **Módulo 1** | **Autenticación, Seguridad y Usuarios** | **Kenny Garay** (`origin/Kenny`) | Login de 2 columnas, Control de Acceso por Roles (RBAC), Gestión de Usuarios y Padrón de Auditoría. |
| **Módulo 2** | **Gestión de Habitaciones y Rack Visual** | **David** (`origin/David`) | Rack visual de 20 cuartos en 4 pisos, Categorías, Tarifas, Mantenimiento Preventivo, Limpieza / Housekeeping e Incidencias. |
| **Módulo 3** | **Reservas, Check-In y Estadías** | **Eliseo / Christian** (`origin/Eliseo`) | Gestión de Reservas (Llegan hoy, Salen hoy, Programadas, En estadía), Check-In, Folio de habitación, Check-Out y Padrón de Huéspedes. |
| **Módulo 4** | **Facturación, Ventas y Caja / POS** | **Hector** (`origin/Hector`) | Punto de Venta (POS), Minibar, Restaurante, Lavandería, Control de Caja Chica, Cierre de Turno e Inventario de Productos. |
| **Módulo 5** | **Portal Web del Cliente y Dashboard** | **Erik Barrera** (`origin/Erik`) | Portal Web de Clientes con fotos HD en habitaciones y servicios, temporizador de 15m para confirmar solicitud (si no se confirma se descarta sin guardar), regla de 8h para reprogramar, voucher de reserva y Dashboard gerencial con métricas. |

---

### Carpetas Incluidas en este Directorio:

1. **`Modulo_1_Autenticacion_Seguridad/`**
   - `pages/Login/LoginPage.tsx`
   - `pages/Usuarios/UsuariosPage.tsx`
   - `pages/Auditoria/AuditoriaPage.tsx`
   - `services/authService.ts`
   - `config/permisos.ts`
   - `config/useAuth.tsx`
   - `config/ProtectedRoute.tsx`

2. **`Modulo_2_Habitaciones_Rack/`**
   - `pages/Rack/RackPage.tsx`
   - `pages/Operaciones/OperacionesPage.tsx`
   - `services/habitacionService.ts`
   - `services/operacionesService.ts`

3. **`Modulo_3_Reservas_CheckIn/`**
   - `pages/Reservas/ReservasPage.tsx`
   - `pages/CheckIn/EstanciasPage.tsx`
   - `pages/CheckIn/CheckInModal.tsx`
   - `pages/CheckIn/FolioModal.tsx`
   - `pages/Huespedes/HuespedesPage.tsx`
   - `pages/Huespedes/RegistroRapidoHuespedModal.tsx`
   - `services/recepcionService.ts`
   - `services/huespedService.ts`

4. **`Modulo_4_Caja_POS_Facturacion/`**
   - `pages/POS/POSPage.tsx`
   - `pages/POS/InventarioPage.tsx`
   - `services/posService.ts`

5. **`Modulo_5_PortalCliente_Dashboard/`**
   - `pages/Portal/PortalClientePage.tsx`
   - `pages/Dashboard/DashboardPage.tsx`
   - `pages/Home/HomePage.tsx`
