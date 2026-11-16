import { api } from './api'
import type { ProductoDTO, TurnoCaja, VentaPOSDTO } from '../types'

// /api/productos
export const productoService = {
  listar: (soloActivos = false) => api.get<ProductoDTO[]>('/productos', { soloActivos }),
  obtener: (id: number) => api.get<ProductoDTO>(`/productos/${id}`),
  crear: (dto: ProductoDTO) => api.post<ProductoDTO>('/productos', dto),
  actualizar: (id: number, dto: ProductoDTO) => api.put<ProductoDTO>(`/productos/${id}`, dto),
  actualizarStock: (id: number, cantidad: number) => api.patch<ProductoDTO>(`/productos/${id}/stock`, { cantidad }),
}

// /api/pos
export const posService = {
  ventas: () => api.get<VentaPOSDTO[]>('/pos/ventas'),
  obtener: (id: number) => api.get<VentaPOSDTO>(`/pos/ventas/${id}`),
  procesarVenta: (dto: VentaPOSDTO, usuario: string) => api.post<VentaPOSDTO>('/pos/ventas', dto, { usuario }),
}

// /api/caja
export const cajaService = {
  turnos: () => api.get<TurnoCaja[]>('/caja/turnos'),
  // Lanza 404 si no hay turno abierto
  turnoActual: () => api.get<TurnoCaja>('/caja/turno-actual'),
  abrir: (montoInicial: number, cajero: string, observaciones?: string) =>
    api.post<TurnoCaja>('/caja/abrir', { montoInicial, observaciones }, { cajero }),
  cerrar: (id: number, montoFinalContado: number, cajero: string, observaciones?: string) =>
    api.patch<TurnoCaja>(`/caja/cerrar/${id}`, { montoFinalContado, observaciones, cajero }),
}
