// Configuracion de conexion con el backend (Spring Boot - puerto 8080 por defecto)
export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:8080/api'

export const STORAGE_KEYS = {
  token: 'ha_token',
  user: 'ha_user',
} as const
