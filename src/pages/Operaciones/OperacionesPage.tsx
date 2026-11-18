/**
 * MÓDULO 4: Housekeeping (Limpieza de Habitaciones) e Incidentes / Averías Técnicas
 * Responsable: Héctor Urbano (Rama: Hector)
 */
import React, { useState } from 'react';
import { useHotel, type IncidenciaHotel } from '../../context/HotelContext';

export const OperacionesPage: React.FC = () => {
  const {
    todayYMD,
    currentUser,
    habitaciones,
    setHabitaciones,
    categorias,
    incidencias,
    setIncidencias,
    procesarLimpiezaTerminada,
    logAuditoria,
    showToast,
  } = useHotel();

  const [subtab, setSubtab] = useState<'housekeeping' | 'incidentes'>('housekeeping');

  // Modales de Incidentes
  const [showReportModal, setShowReportModal] = useState(false);
  const [repHab, setRepHab] = useState(habitaciones[0]?.numero || '101');
  const [repCat, setRepCat] = useState('Aire Acondicionado');
  const [repDesc, setRepDesc] = useState('');
  const [repErr, setRepErr] = useState('');

  const [resolveInc, setResolveInc] = useState<IncidenciaHotel | null>(null);
  const [solucionTxt, setSolucionTxt] = useState('');
  const [solErr, setSolErr] = useState('');

  const cuartosLimpieza = habitaciones.filter((h) => h.estado === 'En Limpieza');
  const abiertas = incidencias.filter((i) => i.estado === 'Abierta');

  const handleReportarIncidencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (repDesc.trim().length < 10) {
      setRepErr('La descripción de la falla debe tener al menos 10 caracteres');
      return;
    }

    setIncidencias((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        habitacionNumero: repHab,
        categoria: repCat,
        descripcion: repDesc.trim(),
        fecha: todayYMD,
        estado: 'Abierta',
        usuario: currentUser.usuario,
      },
    ]);
    setHabitaciones((prev) =>
      prev.map((h) => (h.numero === repHab ? { ...h, estado: 'Mantenimiento' } : h))
    );
    logAuditoria(
      'Incidentes',
      'Reporte de Avería',
      `Habitación #${repHab} enviada a Mantenimiento por ${repCat}: ${repDesc.trim()}`
    );
    showToast(`Avería registrada. Habitación #${repHab} pasa a Mantenimiento`, 'warning');
    setShowReportModal(false);
    setRepDesc('');
    setRepErr('');
  };

  const handleResolverIncidencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveInc) return;
    if (solucionTxt.trim().length < 8) {
      setSolErr('Describa la solución aplicada (mínimo 8 caracteres)');
      return;
    }

    setIncidencias((prev) =>
      prev.map((i) =>
        i.id === resolveInc.id
          ? { ...i, estado: 'Resuelta', solucion: solucionTxt.trim() }
          : i
      )
    );
    setHabitaciones((prev) =>
      prev.map((h) =>
        h.numero === resolveInc.habitacionNumero ? { ...h, estado: 'En Limpieza' } : h
      )
    );
    logAuditoria(
      'Incidentes',
      'Avería Resuelta',
      `Resuelta avería en Hab. #${resolveInc.habitacionNumero}. Pasa a En Limpieza.`
    );
    showToast(`Avería resuelta. Habitación #${resolveInc.habitacionNumero} pasa a En Limpieza`, 'success');
    setResolveInc(null);
    setSolucionTxt('');
    setSolErr('');
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Housekeeping e Incidentes</h1>
        <p className="view-subtitle">
          Control de habitaciones en limpieza y registro de averías de mantenimiento
        </p>
      </div>

      <div className="subtabs-container">
        <button
          className={`subtab-btn ${subtab === 'housekeeping' ? 'active' : ''}`}
          onClick={() => setSubtab('housekeeping')}
        >
          Housekeeping y Limpieza ({cuartosLimpieza.length})
        </button>
        <button
          className={`subtab-btn ${subtab === 'incidentes' ? 'active' : ''}`}
          onClick={() => setSubtab('incidentes')}
        >
          Incidentes y Averías ({abiertas.length} abiertas)
        </button>
      </div>

      {subtab === 'housekeeping' ? (
        <div className="table-card">
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--wine-900)' }}>
                Habitaciones Pendientes de Limpieza
              </h3>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                Al confirmar la limpieza, la habitación pasa a Disponible o a Reservada si tiene llegada hoy.
              </p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Habitación</th>
                  <th>Piso</th>
                  <th>Categoría</th>
                  <th>Capacidad</th>
                  <th>Estado Actual</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cuartosLimpieza.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No hay habitaciones pendientes de limpieza en este momento.
                    </td>
                  </tr>
                ) : (
                  cuartosLimpieza.map((h) => {
                    const cat = categorias.find((c) => c.id === h.categoriaId) || {
                      nombre: 'Estándar',
                      capacidad: 2,
                    };
                    return (
                      <tr key={h.numero}>
                        <td><strong style={{ fontSize: 15 }}>#{h.numero}</strong></td>
                        <td>Piso {h.piso}</td>
                        <td>{cat.nombre}</td>
                        <td>{cat.capacidad} persona(s)</td>
                        <td><span className="badge-status limpieza">En Limpieza</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-gold"
                            onClick={() => procesarLimpiezaTerminada(h.numero)}
                          >
                            Marcar como Limpia
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--wine-900)' }}>
                Registro de Averías Técnicas
              </h3>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                Reportar una avería cambia el estado del cuarto a Mantenimiento. Al resolverla pasa a En Limpieza.
              </p>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => {
                setRepHab(habitaciones[0]?.numero || '101');
                setRepDesc('');
                setRepErr('');
                setShowReportModal(true);
              }}
            >
              Reportar Avería
            </button>
          </div>

          <div className="table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Habitación</th>
                    <th>Categoría</th>
                    <th>Descripción de la Falla</th>
                    <th>Fecha Reporte</th>
                    <th>Reportado Por</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {incidencias.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">No hay incidencias registradas.</td>
                    </tr>
                  ) : (
                    incidencias.map((inc) => (
                      <tr key={inc.id}>
                        <td><strong>#{inc.habitacionNumero}</strong></td>
                        <td><strong>{inc.categoria}</strong></td>
                        <td style={{ maxWidth: 320 }}>{inc.descripcion}</td>
                        <td>{inc.fecha}</td>
                        <td>{inc.usuario}</td>
                        <td>
                          <span className={`badge-status ${inc.estado === 'Abierta' ? 'mantenimiento' : 'disponible'}`}>
                            {inc.estado}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {inc.estado === 'Abierta' ? (
                            <button
                              className="btn btn-sm btn-gold"
                              onClick={() => {
                                setResolveInc(inc);
                                setSolucionTxt('');
                                setSolErr('');
                              }}
                            >
                              Resolver Avería
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                              {inc.solucion || 'Resuelta'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL REPORTAR AVERÍA */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reportar Nueva Avería Técnica</h3>
              <button className="btn-close-modal" onClick={() => setShowReportModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleReportarIncidencia}>
              <div className="modal-body">
                {repErr && <small className="field-msg-error" style={{ marginBottom: 10 }}>{repErr}</small>}
                <div className="form-grid">
                  <div>
                    <label className="field-label">Habitación <span className="req">*</span></label>
                    <select className="form-select" value={repHab} onChange={(e) => setRepHab(e.target.value)}>
                      {habitaciones.map((h) => (
                        <option key={h.numero} value={h.numero}>
                          Habitación #{h.numero} ({h.estado})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Categoría Técnica <span className="req">*</span></label>
                    <select className="form-select" value={repCat} onChange={(e) => setRepCat(e.target.value)}>
                      <option value="Aire Acondicionado">Aire Acondicionado</option>
                      <option value="Plomería / Gasfitería">Plomería / Gasfitería</option>
                      <option value="Sistema Eléctrico">Sistema Eléctrico</option>
                      <option value="Mobiliario / Cerradura">Mobiliario / Cerradura</option>
                      <option value="TV / Red Wi-Fi">TV / Red Wi-Fi</option>
                    </select>
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Descripción de la Falla <span className="req">*</span></label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {[
                        'Equipo de aire acondicionado no enfría',
                        'Fuga de agua en grifería del baño',
                        'Falla en cerradura de tarjeta magnética',
                        'Televisor o señal Wi-Fi sin conexión',
                      ].map((mot) => (
                        <button
                          key={mot}
                          type="button"
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => {
                            setRepDesc(mot);
                            setRepErr('');
                          }}
                        >
                          {mot}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Seleccione una falla arriba o escriba el detalle..."
                      value={repDesc}
                      onChange={(e) => setRepDesc(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Registrar Avería</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESOLVER AVERÍA */}
      {resolveInc && (
        <div className="modal-backdrop" onClick={() => setResolveInc(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Resolver Avería - Hab. #{resolveInc.habitacionNumero}</h3>
              <button className="btn-close-modal" onClick={() => setResolveInc(null)}>&times;</button>
            </div>
            <form onSubmit={handleResolverIncidencia}>
              <div className="modal-body">
                <p style={{ fontSize: 13, marginBottom: 12 }}>
                  <strong>Falla reportada:</strong> {resolveInc.descripcion}
                </p>
                <label className="field-label">Trabajo Realizado / Solución Aplicada <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[
                    'Reemplazo de repuesto y prueba operativa conforme',
                    'Mantenimiento correctivo y calibración realizada',
                    'Reinicio de equipo y verificación de funcionamiento',
                  ].map((sol) => (
                    <button
                      key={sol}
                      type="button"
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => {
                        setSolucionTxt(sol);
                        setSolErr('');
                      }}
                    >
                      {sol}
                    </button>
                  ))}
                </div>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Seleccione una solución arriba o indique la reparación efectuada..."
                  value={solucionTxt}
                  onChange={(e) => setSolucionTxt(e.target.value)}
                />
                {solErr && <small className="field-msg-error">{solErr}</small>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setResolveInc(null)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Confirmar Reparación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
