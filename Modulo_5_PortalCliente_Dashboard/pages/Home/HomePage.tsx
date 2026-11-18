/**
 * MÓDULO 2: Portal de Inicio Operativo (Home)
 * Responsable: Erik Barrera (Rama: Erik)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel, formatMoney } from '../../context/HotelContext';

export const HomePage: React.FC = () => {
  const {
    todayYMD,
    currentUser,
    habitaciones,
    reservas,
    clientes,
    cajaActual,
    auditoria,
    getAlertasOperativas,
    procesarCheckIn,
    procesarLimpiezaTerminada,
  } = useHotel();
  const navigate = useNavigate();

  const totalHab = Math.max(1, habitaciones.length);
  const disponibles = habitaciones.filter((h) => h.estado === 'Disponible').length;
  const ocupadas = habitaciones.filter((h) => h.estado === 'Ocupada').length;
  const reservadas = habitaciones.filter((h) => h.estado === 'Reservada').length;
  const enLimpiezaList = habitaciones.filter((h) => h.estado === 'En Limpieza');
  const enLimpieza = enLimpiezaList.length;
  const enMantenimiento = habitaciones.filter((h) => h.estado === 'Mantenimiento').length;

  const llegadasHoy = reservas.filter((r) => r.entrada === todayYMD && r.estado === 'Confirmada');
  const salidasHoy = reservas.filter((r) => r.salida === todayYMD && r.estado === 'En Curso');
  const totalMovimientosHoy = llegadasHoy.length + salidasHoy.length + enLimpiezaList.length;
  const alertas = getAlertasOperativas();

  const rolActual = currentUser.rol;
  const isLimpieza = rolActual === 'Personal de Limpieza';
  const isAdmin = rolActual === 'Administrador';
  const cajaAbierta = cajaActual && cajaActual.estado === 'Abierta';

  let roleChipClass = 'recepcion';
  let roleDisplay = rolActual as string;
  if (isAdmin) {
    roleChipClass = 'admin';
    roleDisplay = 'Administrador';
  } else if (isLimpieza) {
    roleChipClass = 'limpieza';
    roleDisplay = 'Housekeeping';
  }

  const pctDisp = Math.round((disponibles / totalHab) * 100);
  const pctRes = Math.round((reservadas / totalHab) * 100);
  const pctOcup = Math.round((ocupadas / totalHab) * 100);
  const pctLimp = Math.round((enLimpieza / totalHab) * 100);
  const pctMant = Math.max(0, 100 - (pctDisp + pctRes + pctOcup + pctLimp));

  return (
    <div>
      <div className="view-header" style={{ marginBottom: 18 }}>
        <h1 className="view-title">Resumen Operativo en Tiempo Real</h1>
        <p className="view-subtitle">
          Control general de ocupación, notificaciones activas, llegadas, salidas y bitácora del día
        </p>
      </div>

      <div className="home-context-strip">
        <div className="home-context-left">
          <span className={`home-role-chip ${roleChipClass}`}>{roleDisplay}</span>
          <span className="home-meta-chip">
            Turno {cajaActual ? cajaActual.turno : 'Mañana'} (07:00 - 15:00)
          </span>
          {!isLimpieza && (
            <span
              className="home-meta-chip"
              onClick={() => navigate('/pos')}
              style={{ cursor: 'pointer' }}
              title="Ir a Caja Chica"
            >
              {cajaAbierta ? (
                <span style={{ color: 'var(--status-disponible)', fontWeight: 600 }}>
                  Caja Abierta ({formatMoney(cajaActual.montoInicial)})
                </span>
              ) : (
                <span style={{ color: 'var(--banner-danger-text)', fontWeight: 600 }}>
                  Caja Cerrada — Abrir Turno →
                </span>
              )}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => navigate('/estancias')}
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            Check-In / Estadías
          </button>
          <button
            className="btn btn-sm btn-gold"
            onClick={() => navigate('/rack')}
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            Ver Rack ({habitaciones.length})
          </button>
        </div>
      </div>

      {/* BANDA DE NOTIFICACIONES VERÍDICAS CON REDIRECCIÓN DIRECTA */}
      {alertas.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {alertas.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(a.ruta)}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                background:
                  a.tipo === 'danger'
                    ? '#fef2f2'
                    : a.tipo === 'warning'
                    ? '#fffbeb'
                    : '#f0fdf4',
                border: `1px solid ${
                  a.tipo === 'danger'
                    ? '#fecaca'
                    : a.tipo === 'warning'
                    ? '#fde68a'
                    : '#bbf7d0'
                }`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
                transition: 'transform 0.12s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <strong
                    style={{
                      fontSize: 12.5,
                      color:
                        a.tipo === 'danger'
                          ? '#991b1b'
                          : a.tipo === 'warning'
                          ? '#92400e'
                          : '#166534',
                    }}
                  >
                    {a.titulo}
                  </strong>
                  <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.75 }}>{a.prioridad}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink)', opacity: 0.85 }}>{a.detalle}</div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--wine-800)',
                  textAlign: 'right',
                }}
              >
                {a.accionTexto} →
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="home-tiles-grid">
        {!isLimpieza ? (
          <>
            <button className="home-action-tile featured" onClick={() => navigate('/reservas')}>
              <div className="tile-info">
                <span className="tile-title">Nueva Reserva / Walk-In</span>
                <span className="tile-sub">Asignar cuarto en vivo</span>
              </div>
            </button>
            <button className="home-action-tile" onClick={() => navigate('/estancias')}>
              <div className="tile-info">
                <span className="tile-title">Check-In y Estadías</span>
                <span className="tile-sub">{ocupadas} en casa · {llegadasHoy.length} llegan hoy</span>
              </div>
            </button>
            <button className="home-action-tile" onClick={() => navigate('/huespedes')}>
              <div className="tile-info">
                <span className="tile-title">Directorio Clientes</span>
                <span className="tile-sub">{clientes.length} registrados (RENIEC/SUNAT)</span>
              </div>
            </button>
            <button className="home-action-tile" onClick={() => navigate('/pos')}>
              <div className="tile-info">
                <span className="tile-title">Caja y Facturación</span>
                <span className="tile-sub">Boletas B001 y Facturas F001</span>
              </div>
            </button>
            <button className="home-action-tile" onClick={() => navigate('/operaciones')}>
              <div className="tile-info">
                <span className="tile-title">Limpieza y Averías</span>
                <span className="tile-sub">{enLimpieza} en limpieza · {enMantenimiento} mant.</span>
              </div>
            </button>
            {isAdmin && (
              <button className="home-action-tile" onClick={() => navigate('/dashboard')}>
                <div className="tile-info">
                  <span className="tile-title">Reportes 3 Meses</span>
                  <span className="tile-sub">Ocupación e ingresos reales</span>
                </div>
              </button>
            )}
          </>
        ) : (
          <>
            <button className="home-action-tile featured" onClick={() => navigate('/operaciones')}>
              <div className="tile-info">
                <span className="tile-title">Pendientes Limpieza</span>
                <span className="tile-sub">{enLimpieza} cuarto(s) en cola</span>
              </div>
            </button>
            <button className="home-action-tile" onClick={() => navigate('/operaciones')}>
              <div className="tile-info">
                <span className="tile-title">Reportar Avería</span>
                <span className="tile-sub">Notificar falla técnica</span>
              </div>
            </button>
            <button className="home-action-tile" onClick={() => navigate('/rack')}>
              <div className="tile-info">
                <span className="tile-title">Estado de Cuartos</span>
                <span className="tile-sub">Ver pisos 1, 2 y 3</span>
              </div>
            </button>
          </>
        )}
      </div>

      <div className="home-rooms-bar">
        <div className="home-rooms-bar-header">
          <div className="home-rooms-bar-title">
            <span className="home-rooms-label">Estado de Habitaciones ({habitaciones.length})</span>
            <div className="home-rooms-chips-row">
              <span className="room-stat-chip disponible" onClick={() => navigate('/rack')} style={{ cursor: 'pointer' }}>
                Disponibles <strong>{disponibles}</strong>
              </span>
              <span className="room-stat-chip reservada" onClick={() => navigate('/estancias')} style={{ cursor: 'pointer' }}>
                Reservadas <strong>{reservadas}</strong>
              </span>
              <span className="room-stat-chip ocupada" onClick={() => navigate('/estancias')} style={{ cursor: 'pointer' }}>
                Ocupadas <strong>{ocupadas}</strong>
              </span>
              <span className="room-stat-chip limpieza" onClick={() => navigate('/operaciones')} style={{ cursor: 'pointer' }}>
                Limpieza <strong>{enLimpieza}</strong>
              </span>
              <span className="room-stat-chip mantenimiento" onClick={() => navigate('/operaciones')} style={{ cursor: 'pointer' }}>
                Mantenimiento <strong>{enMantenimiento}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="home-rooms-mini-track">
          <div style={{ width: `${pctDisp}%`, background: 'var(--status-disponible)' }}></div>
          <div style={{ width: `${pctRes}%`, background: 'var(--status-reservada)' }}></div>
          <div style={{ width: `${pctOcup}%`, background: 'var(--status-ocupada)' }}></div>
          <div style={{ width: `${pctLimp}%`, background: 'var(--status-limpieza)' }}></div>
          <div style={{ width: `${pctMant}%`, background: 'var(--status-mantenimiento)' }}></div>
        </div>
      </div>

      <div className="home-bottom-grid">
        <div className="home-compact-card">
          <div className="home-card-head">
            <strong>Movimientos Operativos de Hoy ({totalMovimientosHoy})</strong>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => navigate('/estancias')}
              style={{ padding: '3px 10px', fontSize: 11 }}
            >
              Ir a Estadías
            </button>
          </div>

          {totalMovimientosHoy === 0 ? (
            <div style={{ padding: 18, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
              No hay llegadas, salidas ni limpiezas pendientes en este momento.
            </div>
          ) : (
            <div>
              {llegadasHoy.map((r) => {
                const cli = clientes.find((c) => c.id === r.clienteId);
                return (
                  <div className="compact-movement-row" key={`in-${r.id}`}>
                    <div className="movement-left">
                      <span className="movement-room-badge">#{r.habitacionNumero}</span>
                      <div className="movement-guest-text">
                        <strong>{cli ? cli.nombre : 'Huésped'}</strong>
                        <small>Llegada programada hoy · {r.codigo}</small>
                      </div>
                    </div>
                    {!isLimpieza && (
                      <button
                        className="btn btn-sm btn-gold"
                        onClick={() => procesarCheckIn(r.id)}
                        style={{ padding: '4px 10px', fontSize: 11 }}
                      >
                        Check-In 1 Clic
                      </button>
                    )}
                  </div>
                );
              })}

              {salidasHoy.map((r) => {
                const cli = clientes.find((c) => c.id === r.clienteId);
                return (
                  <div className="compact-movement-row" key={`out-${r.id}`}>
                    <div className="movement-left">
                      <span
                        className="movement-room-badge"
                        style={{ background: 'var(--status-reservada)', color: '#fff' }}
                      >
                        #{r.habitacionNumero}
                      </span>
                      <div className="movement-guest-text">
                        <strong>{cli ? cli.nombre : 'Huésped'}</strong>
                        <small>Salida programada hoy · {r.codigo}</small>
                      </div>
                    </div>
                    {!isLimpieza && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate('/estancias')}
                        style={{ padding: '4px 10px', fontSize: 11 }}
                      >
                        Liquidar Salida
                      </button>
                    )}
                  </div>
                );
              })}

              {enLimpiezaList.map((h) => (
                <div className="compact-movement-row" key={`limp-${h.numero}`}>
                  <div className="movement-left">
                    <span
                      className="movement-room-badge"
                      style={{ background: 'var(--status-limpieza)', color: '#fff' }}
                    >
                      #{h.numero}
                    </span>
                    <div className="movement-guest-text">
                      <strong>Habitación #{h.numero} (Piso {h.piso})</strong>
                      <small>En cola de Housekeeping</small>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => procesarLimpiezaTerminada(h.numero)}
                    style={{ padding: '4px 10px', fontSize: 11 }}
                  >
                    Habilitar Cuarto
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="home-compact-card">
          <div className="home-card-head">
            <strong>Bitácora de Actividad ({auditoria.length})</strong>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => navigate('/auditoria')}
              style={{ padding: '3px 10px', fontSize: 11 }}
            >
              Ver Bitácora
            </button>
          </div>
          <div>
            {auditoria.slice(0, 6).map((item) => (
              <div className="compact-movement-row" key={item.id}>
                <div className="movement-left">
                  <span className="home-meta-chip" style={{ fontSize: 10 }}>
                    {item.modulo}
                  </span>
                  <div className="movement-guest-text">
                    <strong>{item.accion}</strong>
                    <small>{item.detalle}</small>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {item.fecha.split(' ')[1] || item.fecha}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="home-subtle-footer-bar">
        <span>
          <strong>Check-In:</strong> 14:00 hrs · <strong>Check-Out:</strong> 12:00 hrs
        </span>
        <span>
          <strong>Desayuno Buffet:</strong> 06:30 a 10:00 hrs (Restaurante Piso 1)
        </span>
      </div>
    </div>
  );
};
