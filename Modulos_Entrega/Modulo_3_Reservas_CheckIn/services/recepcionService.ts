import { api } from './api'
import type {
  Cargo,
  CargoDTO,
  CheckInRequestDTO,
  CheckOutRequestDTO,
  Estancia,
  Folio,
  Pago,
  PagoDTO,
  ReservaRequestDTO,
  ReservaResponseDTO,
} from '../types'

// /api/reservas
export const reservaService = {
  listar: () => api.get<ReservaResponseDTO[]>('/reservas'),
  obtener: (id: number) => api.get<ReservaResponseDTO>(`/reservas/${id}`),
  porCodigo: (codigo: string) => api.get<ReservaResponseDTO>(`/reservas/codigo/${encodeURIComponent(codigo)}`),
  crear: (dto: ReservaRequestDTO, usuario: string) => api.post<ReservaResponseDTO>('/reservas', dto, { usuario }),
  confirmar: (id: number, usuario: string) => api.patch<ReservaResponseDTO>(`/reservas/${id}/confirmar`, { usuario }),
  cancelar: (id: number, motivo: string, usuario: string) =>
    api.patch<ReservaResponseDTO>(`/reservas/${id}/cancelar`, { motivo, usuario }),
}

// /api/estancias (check-in / check-out)
export const estanciaService = {
  listar: () => api.get<Estancia[]>('/estancias'),
  activas: () => api.get<Estancia[]>('/estancias/activas'),
  obtener: (id: number) => api.get<Estancia>(`/estancias/${id}`),
  checkIn: (dto: CheckInRequestDTO, usuario: string) => api.post<Estancia>('/estancias/check-in', dto, { usuario }),
  checkOut: (dto: CheckOutRequestDTO, usuario: string) => api.post<Estancia>('/estancias/check-out', dto, { usuario }),
}

// /api/folios (cuenta corriente de la estancia)
export const folioService = {
  porEstancia: (estanciaId: number) => api.get<Folio>(`/folios/estancia/${estanciaId}`),
  // Idempotente: si ya existe un folio para la estancia, el back lo devuelve
  crearParaEstancia: (estanciaId: number) => api.post<Folio>(`/folios/estancia/${estanciaId}`),
  obtener: (id: number) => api.get<Folio>(`/folios/${id}`),
  cargos: (id: number) => api.get<Cargo[]>(`/folios/${id}/cargos`),
  pagos: (id: number) => api.get<Pago[]>(`/folios/${id}/pagos`),
  agregarCargo: (dto: CargoDTO, usuario: string) => api.post<Cargo>('/folios/cargos', dto, { usuario }),
  registrarPago: (dto: PagoDTO, usuario: string) => api.post<Pago>('/folios/pagos', dto, { usuario }),
  cerrar: (id: number, usuario: string) => api.patch<Folio>(`/folios/${id}/cerrar`, { usuario }),
}
