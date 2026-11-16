import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS, rutaInicial } from '../app/navigation'
import { API_URL } from '../config/env'
import { tienePermiso } from '../config/permisos'
import { useAuth } from '../hooks/useAuth'

export function MainLayout() {
  const { user, login, logout, puede } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [reloj, setReloj] = useState('')
  const [apiOnline, setApiOnline] = useState(false)

  const items = NAV_ITEMS.filter((i) => puede(i.permiso))
  const actual = NAV_ITEMS.find((i) => location.pathname.startsWith(i.path)) ?? items[0]

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setReloj(`${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const verificarBackend = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '__ping__', password: '' }),
      })
      setApiOnline(res.status > 0)
    } catch {
      setApiOnline(false)
    }
  }

  useEffect(() => {
    void verificarBackend()
  }, [])

  const cambiarUsuarioDemo = async (username: string) => {
    const u = await login({ username, password: 'password123' })
    if (actual && !tienePermiso(u.roles, actual.permiso)) {
      navigate(rutaInicial((p) => tienePermiso(u.roles, p)))
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">HA</div>
          <div>
            <div className="brand-title">Hotel Aventura</div>
            <div className="brand-sub">PMS Core v2.0</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Modulos del Sistema</div>
          {items.map((i) => (
            <NavLink key={i.path} to={i.path} className="nav-link">
              <span className="nav-icon" aria-hidden="true">
                {i.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div>{i.label}</div>
                <small style={{ fontSize: '0.66rem', color: '#64748b', display: 'block' }}>
                  Módulo: {i.responsable}
                </small>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="api-pill">
            <div className="api-pill-left">
              <span className={`pulse-dot ${apiOnline ? 'online' : 'demo'}`} />
              <span>{apiOnline ? 'Backend: 8080 (Online)' : 'Modo Demo (Interactivo)'}</span>
            </div>
            <button
              type="button"
              className="btn-ghost"
              style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              title="Verificar conexion con Backend"
              onClick={() => void verificarBackend()}
            >
              ↻
            </button>
          </div>

          <div className="sidebar-user">
            <div className="user-chip">
              <div className="avatar">{user?.nombreCompleto?.charAt(0) ?? user?.username.charAt(0)}</div>
              <div className="user-info">
                <strong>{user?.nombreCompleto || user?.username}</strong>
                <small>ROLE_{user?.roles[0] ?? 'USER'}</small>
              </div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={logout} title="Cerrar sesion">
              Salir
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h2>{actual?.label ?? 'Hotel Aventura PMS'}</h2>
            <p>{actual?.subtitle ?? 'Sistema Integrado de Gestion Hotelera'}</p>
          </div>

          <div className="topbar-right">
            <select
              className="role-switcher"
              value={user?.username ?? 'kenny'}
              onChange={(e) => void cambiarUsuarioDemo(e.target.value)}
              title="Cambiar vista de integrante / rol"
            >
              <option value="kenny">👤 Vista: Kenny (Admin Total)</option>
              <option value="david">👤 Vista: David (Recepcion / Rack)</option>
              <option value="eliseo">👤 Vista: Eliseo (Caja / POS)</option>
              <option value="hector">👤 Vista: Hector (Limpieza / Averias)</option>
            </select>
            <span className="clock-pill">{reloj}</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
