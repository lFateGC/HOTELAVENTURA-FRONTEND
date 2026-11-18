import { api } from './api'
import type { IncidenciaDTO, TareaLimpiezaDTO } from '../types'

// /api/limpieza
export const limpiezaService = {
  listar: () => api.get<TareaLimpiezaDTO[]>('/limpieza'),
  pendientes: () => api.get<TareaLimpiezaDTO[]>('/limpieza/pendientes'),
  porHabitacion: (habitacionId: number) => api.get<TareaLimpiezaDTO[]>(`/limpieza/habitacion/${habitacionId}`),
  crear: (dto: TareaLimpiezaDTO, usuario: string) => api.post<TareaLimpiezaDTO>('/limpieza', dto, { usuario }),
  iniciar: (id: number, operario: string) => api.patch<TareaLimpiezaDTO>(`/limpieza/${id}/iniciar`, { operario }),
  completar: (id: number, operario: string) =>
    api.patch<TareaLimpiezaDTO>(`/limpieza/${id}/completar`, { operario }),
}

// /api/incidencias
export const incidenciaService = {
  listar: () => api.get<IncidenciaDTO[]>('/incidencias'),
  pendientes: () => api.get<IncidenciaDTO[]>('/incidencias/pendientes'),
  porHabitacion: (habitacionId: number) => api.get<IncidenciaDTO[]>(`/incidencias/habitacion/${habitacionId}`),
  reportar: (dto: IncidenciaDTO, usuario: string) => api.post<IncidenciaDTO>('/incidencias', dto, { usuario }),
  asignar: (id: number, tecnico: string) => api.patch<IncidenciaDTO>(`/incidencias/${id}/asignar`, { tecnico }),
  resolver: (id: number, solucion: string, usuario: string) =>
    api.patch<IncidenciaDTO>(`/incidencias/${id}/resolver`, { solucion, usuario }),
}

// /api/storage (publico) - subida de imagenes a Supabase
export const storageService = {
  subir: (file: File, carpeta = 'general') => {
    const form = new FormData()
    form.append('file', file)
    form.append('carpeta', carpeta)
    return api.post<{ status: string; mensaje: string; url: string }>('/storage/upload', form)
  },
}
