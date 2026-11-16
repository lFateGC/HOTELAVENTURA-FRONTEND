import type { Rol } from '../types'

// Espejo de las reglas RBAC definidas en SecurityConfig.java del backend.
// Si se cambia una regla en el back, actualizarla tambien aqui.
export const PERMISOS = {
  dashboard: ['ADMIN', 'RECEPCIONISTA'],
  rack: ['ADMIN', 'RECEPCIONISTA', 'HOUSEKEEPING', 'MANTENIMIENTO'],
  habitacionesEscritura: ['ADMIN', 'RECEPCIONISTA'],
  reservas: ['ADMIN', 'RECEPCIONISTA'],
  estancias: ['ADMIN', 'RECEPCIONISTA'],
  huespedes: ['ADMIN', 'RECEPCIONISTA'],
  folios: ['ADMIN', 'RECEPCIONISTA', 'CAJERO'],
  pos: ['ADMIN', 'CAJERO', 'RECEPCIONISTA'],
  productosEscritura: ['ADMIN'],
  limpieza: ['ADMIN', 'HOUSEKEEPING', 'RECEPCIONISTA'],
  incidencias: ['ADMIN', 'MANTENIMIENTO', 'HOUSEKEEPING', 'RECEPCIONISTA'],
  operaciones: ['ADMIN', 'HOUSEKEEPING', 'RECEPCIONISTA', 'MANTENIMIENTO'],
  usuarios: ['ADMIN'],
  auditoria: ['ADMIN'],
} satisfies Record<string, Rol[]>

export type Permiso = keyof typeof PERMISOS

export function tienePermiso(roles: string[] | undefined, permiso: Permiso): boolean {
  if (!roles) return false
  const permitidos = PERMISOS[permiso] as readonly string[]
  return roles.some((r) => permitidos.includes(r.replace(/^ROLE_/, '')))
}
