import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHotel } from '../../context/HotelContext';

interface TopbarProps {
  onToggleMobile: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/home': 'Inicio Operativo',
  '/huespedes': 'Directorio de Clientes',
  '/rack': 'Rack de Habitaciones',
  '/reservas': 'Gestión de Reservas',
  '/estancias': 'Check-In y Estadías en Curso',
  '/operaciones': 'Housekeeping e Incidentes',
  '/inventario': 'Almacén e Inventario',
  '/pos': 'Caja Chica y Facturación',
  '/dashboard': 'Reportes Gerenciales',
  '/usuarios': 'Control de Usuarios',
  '/auditoria': 'Bitácora de Auditoría',
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobile }) => {
  const {
    currentUser,
    habitaciones,
    reservas,
    clientes,
    getAlertasOperativas,
  } = useHotel();

  const [showAlerts, setShowAlerts] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchDrop, setShowSearchDrop] = useState(false);

  const alertsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const alertas = getAlertasOperativas();
  const breadcrumbLabel = ROUTE_TITLES[location.pathname] || 'Panel Operativo';

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const now = new Date();
  const fechaStr = `${now.getDate()} ${meses[now.getMonth()]} ${now.getFullYear()}`;

  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(ev.target as Node)) {
        setShowAlerts(false);
      }
      if (searchRef.current && !searchRef.current.contains(ev.target as Node)) {
        setShowSearchDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = quickSearch.trim().toLowerCase();
  const matchedRooms = q
    ? habitaciones.filter((h) => h.numero.includes(q) || h.estado.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedClients = q
    ? clientes
        .filter((c) => c.nombre.toLowerCase().includes(q) || c.documento.toLowerCase().includes(q))
        .slice(0, 4)
    : [];
  const matchedReservas = q
    ? reservas
        .filter((r) => r.codigo.toLowerCase().includes(q) || r.habitacionNumero.includes(q))
        .slice(0, 4)
    : [];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-mobile-toggle" onClick={onToggleMobile} aria-label="Abrir menú">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <div className="breadcrumb-container">
          <span>Hotel Aventura</span>
          <span className="bc-sep">/</span>
          <strong>{breadcrumbLabel}</strong>
        </div>
      </div>

      <div className="topbar-right">
        {/* Buscador Rápido Global */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar cuarto (#102), DNI o reserva..."
            value={quickSearch}
            onFocus={() => setShowSearchDrop(true)}
            onChange={(e) => {
              setQuickSearch(e.target.value);
              setShowSearchDrop(true);
            }}
            style={{
              width: 240,
              padding: '6px 12px',
              fontSize: 12,
              borderRadius: 8,
              background: '#f8fafc',
            }}
          />
          {showSearchDrop && q.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: 310,
                background: '#ffffff',
                border: '1px solid var(--line)',
                borderRadius: 10,
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.14)',
                zIndex: 999,
                padding: 8,
                maxHeight: 340,
                overflowY: 'auto',
              }}
            >
              {matchedRooms.length === 0 && matchedClients.length === 0 && matchedReservas.length === 0 ? (
                <div style={{ padding: 12, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                  Sin resultados para "{quickSearch}"
                </div>
              ) : (
                <>
                  {matchedRooms.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', padding: '2px 8px', textTransform: 'uppercase' }}>
                        Habitaciones
                      </div>
                      {matchedRooms.map((h) => (
                        <button
                          key={h.numero}
                          type="button"
                          onClick={() => {
                            setShowSearchDrop(false);
                            setQuickSearch('');
                            navigate(h.estado === 'Ocupada' ? '/estancias' : '/rack');
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '7px 8px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: 6,
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 12,
                          }}
                        >
                          <span>
                            <strong>Habitación #{h.numero}</strong> · Piso {h.piso}
                          </span>
                          <span className={`badge-status ${h.estado.toLowerCase().replace(' ', '-')}`}>
                            {h.estado}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedReservas.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', padding: '2px 8px', textTransform: 'uppercase' }}>
                        Reservas
                      </div>
                      {matchedReservas.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setShowSearchDrop(false);
                            setQuickSearch('');
                            navigate(r.estado === 'En Curso' ? '/estancias' : '/reservas');
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '7px 8px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: 6,
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 12,
                          }}
                        >
                          <span>
                            <strong>{r.codigo}</strong> · Hab. #{r.habitacionNumero}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--wine-700)', fontWeight: 600 }}>
                            {r.estado} →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedClients.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', padding: '2px 8px', textTransform: 'uppercase' }}>
                        Clientes
                      </div>
                      {matchedClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setShowSearchDrop(false);
                            setQuickSearch('');
                            navigate('/huespedes');
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '7px 8px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: 6,
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 12,
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 190 }}>
                            <strong>{c.nombre}</strong>
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{c.documento}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Insignia fija del usuario autenticado (sin cambio de panel ni selector de rol fuera del Login) */}
        <div
          className="topbar-item"
          style={{
            padding: '5px 12px',
            borderRadius: 8,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            fontSize: 12,
            color: '#14532d',
            fontWeight: 600,
          }}
        >
          {currentUser.nombre} · <strong>{currentUser.rol}</strong>
        </div>

        <div className="topbar-item date-item">
          <span>{fechaStr}</span>
        </div>

        {/* Centro de Notificaciones Operativas con Redirección Directa */}
        <div className="topbar-item alerts-item" ref={alertsRef}>
          <button
            className="btn-alerts-toggle"
            onClick={() => setShowAlerts((prev) => !prev)}
            title="Notificaciones Operativas en Vivo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {alertas.length > 0 && <span className="badge-alert-count">{alertas.length}</span>}
          </button>

          <div className={`alerts-popover ${showAlerts ? 'show' : ''}`} style={{ width: 350 }}>
            <div className="alerts-popover-header">
              <strong>Notificaciones Operativas</strong>
              <span className="badge-count-pill">{alertas.length} activas</span>
            </div>
            <div className="alerts-popover-body" style={{ maxHeight: 380, overflowY: 'auto' }}>
              {alertas.length === 0 ? (
                <div style={{ padding: 18, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                  Sin notificaciones pendientes. Operación al día.
                </div>
              ) : (
                alertas.map((a) => (
                  <div
                    key={a.id}
                    className={`alert-item-mini ${a.tipo}`}
                    onClick={() => {
                      setShowAlerts(false);
                      navigate(a.ruta);
                    }}
                    style={{
                      cursor: 'pointer',
                      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 12.5 }}>{a.titulo}</strong>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(15, 23, 42, 0.08)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {a.prioridad}
                      </span>
                    </div>
                    <span style={{ fontSize: 11.5, lineHeight: 1.35 }}>{a.detalle}</span>
                    <div
                      style={{
                        marginTop: 4,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--wine-800)',
                      }}
                    >
                      {a.accionTexto} →
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
