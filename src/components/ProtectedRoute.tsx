import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Permiso } from '../config/permisos'
import { useAuth } from '../hooks/useAuth'

/** Protege rutas: exige sesion y (opcionalmente) un permiso por rol */
export function ProtectedRoute({ permiso }: { permiso?: Permiso }) {
  const { isAuthenticated, puede } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (permiso && !puede(permiso)) return <Navigate to="/sin-acceso" replace />
  return <Outlet />
}
