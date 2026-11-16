import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '../config/env'
import { tienePermiso, type Permiso } from '../config/permisos'
import { setUnauthorizedHandler } from '../services/api'
import { authService } from '../services/authService'
import type { LoginRequest, SessionUser } from '../types'

interface AuthContextValue {
  user: SessionUser | null
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<SessionUser>
  logout: () => void
  puede: (permiso: Permiso) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Lee el campo exp (segundos) del payload del JWT emitido por JwtUtil.java */
function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function cargarSesion(): SessionUser | null {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  const raw = localStorage.getItem(STORAGE_KEYS.user)
  if (!token || !raw || tokenExpirado(token)) {
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.user)
    return null
  }
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(cargarSesion)

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.user)
    setUser(null)
  }, [])

  // Si cualquier peticion devuelve 401, cerramos sesion automaticamente
  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authService.login(data)
    const sessionUser: SessionUser = {
      id: res.id,
      username: res.username,
      email: res.email,
      nombreCompleto: res.nombreCompleto,
      roles: (res.roles ?? []).map((r) => r.replace(/^ROLE_/, '')),
    }
    localStorage.setItem(STORAGE_KEYS.token, res.token)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(sessionUser))
    setUser(sessionUser)
    return sessionUser
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      puede: (permiso) => tienePermiso(user?.roles, permiso),
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
