import type { Permiso } from '../config/permisos'

export interface NavItem {
  path: string
  label: string
  subtitle: string
  responsable: string
  icon: string
  permiso: Permiso
}

// Menu lateral alineado con los modulos e integrantes del proyecto
export const NAV_ITEMS: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard & KPIs',
    subtitle: 'Vision global de ocupacion y finanzas en tiempo real',
    responsable: 'Erik Barrera',
    icon: '📊',
    permiso: 'dashboard',
  },
  {
    path: '/rack',
    label: 'Rack de Habitaciones',
    subtitle: 'Matriz interactiva de cuartos y control de recepcion',
    responsable: 'David Asto',
    icon: '🏨',
    permiso: 'rack',
  },
  {
    path: '/reservas',
    label: 'Reservas & Front Desk',
    subtitle: 'Gestion de reservaciones y formalizacion de Check-In',
    responsable: 'David Asto',
    icon: '📅',
    permiso: 'reservas',
  },
  {
    path: '/estancias',
    label: 'Check-In / Estancias',
    subtitle: 'Huespedes en casa, folios de consumo y Check-Out',
    responsable: 'David Asto',
    icon: '🛎️',
    permiso: 'estancias',
  },
  {
    path: '/huespedes',
    label: 'Ficha de Huespedes',
    subtitle: 'Padron de pasajeros, ficha tecnica y registro MINCETUR',
    responsable: 'Erik Barrera',
    icon: '👥',
    permiso: 'huespedes',
  },
  {
    path: '/pos',
    label: 'Caja & Punto de Venta',
    subtitle: 'Comandas, cargos al folio, inventario y arqueo de caja',
    responsable: 'Eliseo Marino',
    icon: '💳',
    permiso: 'pos',
  },
  {
    path: '/operaciones',
    label: 'Limpieza & Averias',
    subtitle: 'Housekeeping, camareria e incidencias de mantenimiento',
    responsable: 'Hector Urbano',
    icon: '🧹',
    permiso: 'operaciones',
  },
  {
    path: '/usuarios',
    label: 'Usuarios & Roles',
    subtitle: 'Control de cuentas del personal y permisos RBAC',
    responsable: 'Kenny Garay',
    icon: '🔐',
    permiso: 'usuarios',
  },
  {
    path: '/auditoria',
    label: 'Bitacora Auditoria',
    subtitle: 'Registro inmutable de seguridad y eventos del sistema',
    responsable: 'Kenny Garay',
    icon: '📜',
    permiso: 'auditoria',
  },
]

/** Primera ruta a la que el usuario tiene acceso (para redirigir tras el login) */
export function rutaInicial(puede: (p: Permiso) => boolean): string {
  return NAV_ITEMS.find((i) => puede(i.permiso))?.path ?? '/sin-acceso'
}
