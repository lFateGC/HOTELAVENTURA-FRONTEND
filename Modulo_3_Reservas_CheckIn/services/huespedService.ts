import { api } from './api'
import type { DashboardKpiDTO, HuespedDTO, RegistroHuespedDTO } from '../types'

// /api/huespedes
export const huespedService = {
  listar: (buscar?: string) => api.get<HuespedDTO[]>('/huespedes', { buscar }),
  obtener: (id: number) => api.get<HuespedDTO>(`/huespedes/${id}`),
  porDocumento: (documento: string) =>
    api.get<HuespedDTO>(`/huespedes/documento/${encodeURIComponent(documento)}`),
  registrar: (dto: HuespedDTO) => api.post<HuespedDTO>('/huespedes', dto),
  actualizar: (id: number, dto: HuespedDTO) => api.put<HuespedDTO>(`/huespedes/${id}`, dto),
  registrarEnEstancia: (dto: RegistroHuespedDTO) =>
    api.post<RegistroHuespedDTO>('/huespedes/registro-estancia', dto),
  porEstancia: (estanciaId: number) => api.get<RegistroHuespedDTO[]>(`/huespedes/estancia/${estanciaId}`),
}

// /api/dashboard
export const dashboardService = {
  kpis: () => api.get<DashboardKpiDTO>('/dashboard/kpis'),
}
