import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHotel } from '../../context/HotelContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, habitaciones, incidencias, productos, logAuditoria, showToast } = useHotel();
  const location = useLocation();
  const navigate = useNavigate();

  const countLimpieza = habitaciones.filter((h) => h.estado === 'En Limpieza').length;
  const countIncidentes = incidencias.filter((i) => i.estado === 'Abierta').length;
  const countStockBajo = productos.filter((p) => p.stock <= p.stockMinimo).length;

  const isAdmin = currentUser.rol === 'Administrador';
  const isLimpieza = currentUser.rol === 'Personal de Limpieza';

  const navItems = [
    {
      path: '/home',
      label: 'Home',
      visible: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      path: '/huespedes',
      label: 'Clientes',
      visible: !isLimpieza,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      path: '/rack',
      label: 'Habitaciones',
      visible: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"></path>
          <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"></path>
          <line x1="2" y1="20" x2="22" y2="20"></line>
        </svg>
      ),
    },
    {
      path: '/reservas',
      label: 'Reservas',
      visible: !isLimpieza,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      path: '/estancias',
      label: 'Check-In / Estadías',
      visible: !isLimpieza,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
        </svg>
      ),
    },
    {
      path: '/operaciones',
      label: 'Housekeeping e Incidentes',
      visible: true,
      badge: countLimpieza + countIncidentes,
      badgeClass: 'limpieza',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        </svg>
      ),
    },
    {
      path: '/inventario',
      label: 'Inventario',
      visible: !isLimpieza,
      badge: countStockBajo,
      badgeClass: 'reservada',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
    },
    {
      path: '/pos',
      label: 'Ventas / Caja',
      visible: !isLimpieza,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
          <line x1="7" y1="15" x2="7.01" y2="15"></line>
          <line x1="11" y1="15" x2="13" y2="15"></line>
        </svg>
      ),
    },
    {
      path: '/dashboard',
      label: 'Dashboard y Reportes',
      visible: isAdmin,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
    {
      path: '/usuarios',
      label: 'Personal y Usuarios',
      visible: isAdmin,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      path: '/auditoria',
      label: 'Auditoría',
      visible: isAdmin,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logAuditoria('Acceso', 'Cierre de Sesión', `Usuario "${currentUser.usuario}" cerró sesión.`);
    localStorage.removeItem('hotel_aventura_user');
    showToast('Sesión cerrada correctamente', 'info');
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: 0.5 }}>
            HA
          </div>
          <div className="sidebar-brand-text">
            <h2>Hotel Aventura</h2>
            <span>Sistema PMS</span>
          </div>
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar">
            {(currentUser.usuario || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="user-meta">
            <strong className="user-name">{currentUser.nombre.split(' ')[0]} ({currentUser.usuario})</strong>
            <span className="user-role-tag">
              {currentUser.rol}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`nav-counter-pill ${item.badgeClass}`}>{item.badge}</span>
                  )}
                </button>
              );
            })}

          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              className="nav-link"
              onClick={() => handleNav('/portal')}
              style={{ color: 'var(--gold-strong)' }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </span>
              <span className="nav-text">Portal Web del Cliente</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <button className="btn-logout" type="button" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
    </>
  );
};
