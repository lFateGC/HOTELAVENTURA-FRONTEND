// Funciones auxiliares de formato y validacion

const pen = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export function formatPEN(value: number | null | undefined): string {
  return pen.format(Number(value ?? 0))
}

export function formatFecha(value?: string | null): string {
  if (!value) return '-'
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatFechaHora(value?: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 'DAY_USE' -> 'Day use', 'FUERA_DE_SERVICIO' -> 'Fuera de servicio' */
export function humanizar(value?: string | null): string {
  if (!value) return '-'
  const t = value.replace(/_/g, ' ').toLowerCase()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Fecha local en formato 'YYYY-MM-DD' (para inputs type=date) */
export function hoyISO(offsetDias = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDias)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Fecha-hora local 'YYYY-MM-DDTHH:mm' (para inputs datetime-local y LocalDateTime del back) */
export function fechaHoraLocalISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function nochesEntre(desde: string | Date, hasta: string | Date): number {
  const a = new Date(desde)
  const b = new Date(hasta)
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000))
}

export function validarDocumento(tipo: string, numero: string): string | null {
  const n = numero.trim()
  if (tipo === 'DNI' && !/^\d{8}$/.test(n)) return 'El DNI debe tener 8 digitos'
  if (tipo === 'CARNET_EXTRANJERIA' && !/^[A-Za-z0-9]{9,12}$/.test(n))
    return 'El carnet de extranjeria debe tener entre 9 y 12 caracteres'
  if (n.length < 6 || n.length > 20) return 'El documento debe tener entre 6 y 20 caracteres'
  return null
}
