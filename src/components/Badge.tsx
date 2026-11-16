import type { ReactNode } from 'react'
import { humanizar } from '../utils/format'

// Colores semanticos por estado (coinciden con las clases .badge-* de index.css)
const COLORES: Record<string, string> = {
  DISPONIBLE: 'green',
  LIMPIA: 'green',
  INSPECCIONADA: 'teal',
  CONFIRMADA: 'green',
  ACTIVA: 'blue',
  ABIERTO: 'blue',
  ABIERTA: 'green',
  COMPLETADA: 'green',
  RESUELTA: 'green',
  OCUPADA: 'blue',
  EN_CASA: 'blue',
  EN_PROCESO: 'blue',
  EN_REPARACION: 'blue',
  PENDIENTE: 'yellow',
  SUCIA: 'yellow',
  REPORTADA: 'yellow',
  MEDIA: 'yellow',
  BLOQUEADA: 'gray',
  FINALIZADA: 'gray',
  CERRADO: 'gray',
  CERRADA: 'gray',
  BAJA: 'gray',
  FUERA_DE_SERVICIO: 'red',
  CANCELADA: 'red',
  NO_SHOW: 'red',
  ALTA: 'orange',
  URGENTE: 'red',
}

export function Badge({ value, children }: { value?: string | null; children?: ReactNode }) {
  const color = (value && COLORES[value]) ?? 'gray'
  return <span className={`badge badge-${color}`}>{children ?? humanizar(value)}</span>
}
