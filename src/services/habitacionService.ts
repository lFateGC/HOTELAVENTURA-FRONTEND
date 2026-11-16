import { api } from './api'
import type {
  EstadoLimpieza,
  EstadoOperativo,
  HabitacionDTO,
  TipoHabitacionDTO,
} from '../types'

// /api/habitaciones y /api/tipos-habitacion
export const habitacionService = {
  listar: () => api.get<HabitacionDTO[]>('/habitaciones'),
  rack: () => api.get<HabitacionDTO[]>('/habitaciones/rack'),
  obtener: (id: number) => api.get<HabitacionDTO>(`/habitaciones/${id}`),
  porPiso: (pisoId: number) => api.get<HabitacionDTO[]>(`/habitaciones/piso/${pisoId}`),
  crear: (dto: HabitacionDTO) => api.post<HabitacionDTO>('/habitaciones', dto),
  actualizar: (id: number, dto: HabitacionDTO) => api.put<HabitacionDTO>(`/habitaciones/${id}`, dto),
  cambiarEstadoOperativo: (id: number, estado: EstadoOperativo, usuario: string) =>
    api.patch<HabitacionDTO>(`/habitaciones/${id}/estado-operativo`, { estado, usuario }),
  cambiarEstadoLimpieza: (id: number, estado: EstadoLimpieza, usuario: string) =>
    api.patch<HabitacionDTO>(`/habitaciones/${id}/estado-limpieza`, { estado, usuario }),
}

export const tipoHabitacionService = {
  listar: () => api.get<TipoHabitacionDTO[]>('/tipos-habitacion'),
  crear: (dto: TipoHabitacionDTO) => api.post<TipoHabitacionDTO>('/tipos-habitacion', dto),
  actualizar: (id: number, dto: Partial<TipoHabitacionDTO>) =>
    api.put<TipoHabitacionDTO>(`/tipos-habitacion/${id}`, dto),
}
