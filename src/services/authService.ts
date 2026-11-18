import { api } from './api'
import type {
  AuditoriaDTO,
  AuthResponse,
  LoginRequest,
  RegistroUsuarioRequest,
  UsuarioDTO,
} from '../types'

// /api/auth (publico), /api/usuarios y /api/auditoria (solo ADMIN)
export const authService = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  registrar: (data: RegistroUsuarioRequest) => api.post<UsuarioDTO>('/auth/registro', data),
}

export const usuarioService = {
  listar: () => api.get<UsuarioDTO[]>('/usuarios'),
  obtener: (id: number) => api.get<UsuarioDTO>(`/usuarios/${id}`),
  cambiarEstado: (id: number, activo: boolean, usuarioModificador: string) =>
    api.patch<UsuarioDTO>(`/usuarios/${id}/estado`, { activo, usuarioModificador }),
}

export const auditoriaService = {
  listar: () => api.get<AuditoriaDTO[]>('/auditoria'),
  porUsuario: (usuario: string) => api.get<AuditoriaDTO[]>(`/auditoria/usuario/${encodeURIComponent(usuario)}`),
  porAccion: (accion: string) => api.get<AuditoriaDTO[]>(`/auditoria/accion/${encodeURIComponent(accion)}`),
}
