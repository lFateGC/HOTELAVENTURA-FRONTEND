import { API_URL, STORAGE_KEYS } from '../config/env'
import type { ErrorResponse } from '../types'
import { handleDemoRequest } from './demoData'

// Error tipado con la estructura ErrorResponse del GlobalExceptionHandler del backend
export class ApiError extends Error {
  status: number
  details: string[]

  constructor(status: number, message: string, details: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type QueryValue = string | number | boolean | null | undefined
type Query = Record<string, QueryValue>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Query
  signal?: AbortSignal
}

// Callback para que el AuthProvider cierre sesion cuando el token expira (401)
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(API_URL + path)
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options
  const token = localStorage.getItem(STORAGE_KEYS.token)

  // Si la sesion actual fue iniciada en Modo Demo o el backend no responde, usamos el motor interactivo
  if (token?.endsWith('.demo_signature')) {
    return handleDemoRequest<T>(path, method, body, query)
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    // Fallback automatico al Modo Demo Interactivo cuando el backend de Spring Boot no esta encendido
    return handleDemoRequest<T>(path, method, body, query)
  }

  if (res.status === 401) {
    onUnauthorized?.()
    throw new ApiError(401, 'Tu sesion expiro. Inicia sesion nuevamente.')
  }
  if (res.status === 403) {
    throw new ApiError(403, 'No tienes permisos para realizar esta accion.')
  }

  const text = await res.text()
  const data: unknown = text ? safeJson(text) : null

  if (!res.ok) {
    const err = (data ?? {}) as Partial<ErrorResponse> & { mensaje?: string }
    throw new ApiError(
      res.status,
      err.message ?? err.mensaje ?? err.error ?? `Error ${res.status}`,
      err.details ?? [],
    )
  }
  return data as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown, query?: Query) => request<T>(path, { method: 'POST', body, query }),
  put: <T>(path: string, body?: unknown, query?: Query) => request<T>(path, { method: 'PUT', body, query }),
  patch: <T>(path: string, query?: Query, body?: unknown) => request<T>(path, { method: 'PATCH', body, query }),
  delete: <T>(path: string, query?: Query) => request<T>(path, { method: 'DELETE', query }),
}

export function mensajeError(e: unknown): string {
  if (e instanceof ApiError) {
    return e.details.length ? `${e.message}: ${e.details.join(', ')}` : e.message
  }
  if (e instanceof Error) return e.message
  return 'Ocurrio un error inesperado'
}
