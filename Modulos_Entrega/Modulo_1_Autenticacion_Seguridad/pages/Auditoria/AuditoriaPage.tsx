/**
 * MÓDULO 1: Auditoría y Trazabilidad Inmutable
 * Responsable: Kenny Garay (Rama: Kenny)
 */
import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';

export const AuditoriaPage: React.FC = () => {
  const { auditoria, showToast } = useHotel();
  const [busqueda, setBusqueda] = useState('');
  const [moduloFiltro, setModuloFiltro] = useState('Todos');

  const filtrados = auditoria.filter((a) => {
    const q = busqueda.toLowerCase().trim();
    const matchText =
      !q ||
      a.accion.toLowerCase().includes(q) ||
      a.usuario.toLowerCase().includes(q) ||
      a.detalle.toLowerCase().includes(q) ||
      a.modulo.toLowerCase().includes(q);
    const matchMod = moduloFiltro === 'Todos' || a.modulo.toLowerCase() === moduloFiltro.toLowerCase();
    return matchText && matchMod;
  });

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Registro de Auditoría</h1>
        <p className="view-subtitle">Historial de operaciones realizadas en el sistema</p>
      </div>

      <div className="filters-toolbar">
        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="Buscar por acción, usuario o detalle..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: 16 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="select-role"
            value={moduloFiltro}
            onChange={(e) => setModuloFiltro(e.target.value)}
          >
            <option value="Todos">Todos los Módulos</option>
            <option value="Reservas">Reservas</option>
            <option value="Caja">Caja</option>
            <option value="Clientes">Clientes</option>
            <option value="Incidentes">Incidentes</option>
            <option value="Facturación">Facturación</option>
            <option value="Usuarios">Usuarios</option>
            <option value="Inventario">Inventario</option>
            <option value="Housekeeping">Housekeeping</option>
          </select>
          <button
            className="btn btn-secondary"
            onClick={() => {
              showToast('Bitácora lista para imprimir', 'info');
              window.print();
            }}
          >
            Imprimir / Exportar
          </button>
        </div>
      </div>

      <div className="table-card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, color: 'var(--wine-900)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Eventos Registrados</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filtrados.length} registros</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Módulo</th>
                <th>Usuario Responsable</th>
                <th>Rol</th>
                <th>Acción</th>
                <th>Detalle de Operación</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: 'nowrap' }}><code>{a.fecha}</code></td>
                  <td><strong>{a.modulo}</strong></td>
                  <td>{a.usuario}</td>
                  <td><span className="badge-status reservada" style={{ fontSize: 10 }}>{a.rol}</span></td>
                  <td><strong>{a.accion}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--ink-light)' }}>{a.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
