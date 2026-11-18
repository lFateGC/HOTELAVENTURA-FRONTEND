/**
 * MÓDULO 2: Directorio de Clientes B2C (Persona Natural DNI/Pasaporte/CE) y B2B (Empresa RUC)
 * Responsable: Erik Barrera (Rama: Erik)
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel, type ClienteHotel } from '../../context/HotelContext';

const PADRON_RENIEC_SUNAT: Record<string, { nombre: string; direccion: string; tel: string; email: string }> = {
  '45892136': { nombre: 'Luis Fernando Cáceres Mendoza', direccion: 'Av. Arequipa 2450, Lince, Lima', tel: '987456321', email: 'lcaceres@correo.pe' },
  '72145896': { nombre: 'Valeria Sofía Salazar Ríos', direccion: 'Calle Schell 340, Miraflores, Lima', tel: '994125874', email: 'vsalazar@correo.pe' },
  '20547896321': { nombre: 'Corporación Minera Andina S.A.C.', direccion: 'Av. Javier Prado Este 4200, Surco, Lima', tel: '014587963', email: 'logistica@mineraandina.pe' },
  '20601245789': { nombre: 'Constructora Pacífico Sur S.A.', direccion: 'Av. Rivera Navarrete 765, San Isidro, Lima', tel: '012214587', email: 'reservas@pacificosur.pe' },
};

export const HuespedesPage: React.FC = () => {
  const { clientes, setClientes, reservas, logAuditoria, showToast } = useHotel();
  const navigate = useNavigate();

  const [subtab, setSubtab] = useState<'todos' | 'natural' | 'empresa'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Activo' | 'Inactivo'>('Todos');

  // Modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<ClienteHotel | null>(null);
  const [fichaCliente, setFichaCliente] = useState<ClienteHotel | null>(null);
  const [disableCliente, setDisableCliente] = useState<ClienteHotel | null>(null);
  const [motivoInhab, setMotivoInhab] = useState('');
  const [motivoErr, setMotivoErr] = useState('');

  // Campos de formulario reactivo
  const [cliTipo, setCliTipo] = useState<'Persona Natural' | 'Empresa'>('Persona Natural');
  const [cliTipoDoc, setCliTipoDoc] = useState<'DNI' | 'Pasaporte' | 'Carné de Extranjería' | 'RUC'>('DNI');
  const [cliDoc, setCliDoc] = useState('');
  const [cliNombre, setCliNombre] = useState('');
  const [cliTel, setCliTel] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliDireccion, setCliDireccion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isNaturalTab = subtab === 'natural';
  const isEmpresaTab = subtab === 'empresa';

  const listaFiltrada = clientes.filter((c) => {
    if (isNaturalTab && c.tipo !== 'Persona Natural') return false;
    if (isEmpresaTab && c.tipo !== 'Empresa') return false;
    if (filtroEstado !== 'Todos' && c.estado !== filtroEstado) return false;
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.documento.toLowerCase().includes(q) ||
      c.telefono.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  const handleAutocompletarPadron = () => {
    const docTrim = cliDoc.trim();
    if (PADRON_RENIEC_SUNAT[docTrim]) {
      const hit = PADRON_RENIEC_SUNAT[docTrim];
      setCliNombre(hit.nombre);
      setCliDireccion(hit.direccion);
      if (!cliTel) setCliTel(hit.tel);
      if (!cliEmail) setCliEmail(hit.email);
      setErrors({});
      showToast('Datos autocompletados desde padrón RENIEC / SUNAT', 'info');
      return;
    }
    if (cliTipo === 'Empresa') {
      const rucFinal = /^(10|20)\d{9}$/.test(docTrim) ? docTrim : '20608451239';
      setCliDoc(rucFinal);
      setCliNombre(`Inversiones & Servicios ${rucFinal.slice(-4)} S.A.C.`);
      setCliTel(cliTel || '014428910');
      setCliEmail(cliEmail || `contacto@empresa${rucFinal.slice(-4)}.pe`);
      setCliDireccion('Av. Canaval y Moreyra 380, San Isidro, Lima');
      setErrors({});
      showToast('RUC validado y autocompletado (SUNAT)', 'info');
    } else {
      const dniFinal = /^\d{8}$/.test(docTrim) ? docTrim : '46821953';
      setCliDoc(dniFinal);
      setCliNombre('Carlos Alberto Rojas Paredes');
      setCliTel(cliTel || '987654321');
      setCliEmail(cliEmail || 'crojas@correo.pe');
      setCliDireccion('Av. Benavides 1540, Miraflores, Lima');
      setErrors({});
      showToast('DNI validado y autocompletado (RENIEC)', 'info');
    }
  };

  const openModalCrear = (tipoDef: 'Persona Natural' | 'Empresa') => {
    setEditingCliente(null);
    setCliTipo(tipoDef);
    setCliTipoDoc(tipoDef === 'Empresa' ? 'RUC' : 'DNI');
    setCliDoc('');
    setCliNombre('');
    setCliTel('');
    setCliEmail('');
    setCliDireccion('');
    setErrors({});
    setShowFormModal(true);
  };

  const openModalEditar = (cli: ClienteHotel) => {
    setEditingCliente(cli);
    setCliTipo(cli.tipo);
    setCliTipoDoc(cli.tipoDoc);
    setCliDoc(cli.documento);
    setCliNombre(cli.nombre);
    setCliTel(cli.telefono);
    setCliEmail(cli.email || '');
    setCliDireccion(cli.direccion || '');
    setErrors({});
    setShowFormModal(true);
  };

  // Sanitización estricta en tiempo real para DNI (8 dígitos) y RUC (11 dígitos)
  const handleDocChange = (val: string) => {
    if (cliTipo === 'Empresa') {
      setCliDoc(val.replace(/\D/g, '').slice(0, 11));
    } else if (cliTipoDoc === 'DNI') {
      setCliDoc(val.replace(/\D/g, '').slice(0, 8));
    } else {
      setCliDoc(val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12));
    }
    setErrors((prev) => ({ ...prev, doc: '' }));
  };

  const handleTelChange = (val: string) => {
    setCliTel(val.replace(/\D/g, '').slice(0, 9));
    setErrors((prev) => ({ ...prev, tel: '' }));
  };

  const handleGuardarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    const newErr: Record<string, string> = {};

    const docVal = cliDoc.trim();
    const nomVal = cliNombre.trim();
    const telVal = cliTel.trim();

    if (!docVal) newErr.doc = 'El número de documento es obligatorio';
    if (!nomVal) newErr.nombre = cliTipo === 'Empresa' ? 'La Razón Social es obligatoria' : 'Nombres y Apellidos son obligatorios';
    if (!telVal) newErr.tel = 'El teléfono es obligatorio';

    if (cliTipo === 'Persona Natural') {
      if (cliTipoDoc === 'DNI' && !/^\d{8}$/.test(docVal)) {
        newErr.doc = 'El DNI debe tener exactamente 8 dígitos numéricos';
      } else if ((cliTipoDoc === 'Pasaporte' || cliTipoDoc === 'Carné de Extranjería') && !/^[a-zA-Z0-9]{9,12}$/.test(docVal)) {
        newErr.doc = 'El documento debe tener entre 9 y 12 caracteres alfanuméricos';
      }
      if (nomVal && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nomVal)) {
        newErr.nombre = 'Solo se permiten letras y espacios';
      }
    } else {
      if (!/^(10|20)\d{9}$/.test(docVal)) {
        newErr.doc = 'El RUC debe tener 11 dígitos numéricos y empezar con 10 o 20';
      }
    }

    if (telVal && !/^\d{7,9}$/.test(telVal)) {
      newErr.tel = 'El teléfono debe tener entre 7 y 9 dígitos numéricos';
    }

    const duplicado = clientes.some(
      (c) => c.documento === docVal && (!editingCliente || c.id !== editingCliente.id)
    );
    if (duplicado) {
      newErr.doc = 'El documento / RUC ya está registrado en el directorio';
    }

    if (Object.keys(newErr).length > 0) {
      setErrors(newErr);
      return;
    }

    if (editingCliente) {
      setClientes((prev) =>
        prev.map((c) =>
          c.id === editingCliente.id
            ? {
                ...c,
                tipo: cliTipo,
                tipoDoc: cliTipo === 'Empresa' ? 'RUC' : cliTipoDoc,
                documento: docVal,
                nombre: nomVal,
                telefono: telVal,
                email: cliEmail.trim() || undefined,
                direccion: cliDireccion.trim() || undefined,
              }
            : c
        )
      );
      logAuditoria('Clientes', 'Edición de Cliente', `Actualizado cliente ${nomVal} (${docVal}).`);
      showToast('Datos del cliente actualizados con éxito', 'success');
    } else {
      const nuevo: ClienteHotel = {
        id: clientes.length + 1,
        tipo: cliTipo,
        tipoDoc: cliTipo === 'Empresa' ? 'RUC' : cliTipoDoc,
        documento: docVal,
        nombre: nomVal,
        telefono: telVal,
        email: cliEmail.trim() || 'contacto@cliente.pe',
        direccion: cliDireccion.trim() || 'Lima, Perú',
        estado: 'Activo',
      };
      setClientes((prev) => [...prev, nuevo]);
      logAuditoria('Clientes', `Nuevo Cliente ${cliTipo === 'Empresa' ? 'B2B' : 'B2C'}`, `Registrado ${nomVal} (${docVal}).`);
      showToast(`${cliTipo === 'Empresa' ? 'Empresa registrada' : 'Cliente registrado'} con éxito`, 'success');
    }

    setShowFormModal(false);
  };

  const handleOpenInhabilitar = (cli: ClienteHotel) => {
    const activas = reservas.filter(
      (r) => r.clienteId === cli.id && (r.estado === 'Confirmada' || r.estado === 'En Curso')
    );
    if (activas.length > 0) {
      const codigos = activas.map((r) => r.codigo).join(', ');
      showToast(`Operación bloqueada: El cliente tiene reservas activas (${codigos})`, 'danger');
      return;
    }
    setDisableCliente(cli);
    setMotivoInhab('');
    setMotivoErr('');
  };

  const handleConfirmInhabilitar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCliente) return;
    if (motivoInhab.trim().length < 10) {
      setMotivoErr('El motivo debe tener al menos 10 caracteres');
      return;
    }
    setClientes((prev) => prev.map((c) => (c.id === disableCliente.id ? { ...c, estado: 'Inactivo' } : c)));
    logAuditoria('Clientes', 'Inhabilitación de Cliente', `Inhabilitado ${disableCliente.nombre} (${disableCliente.documento}). Motivo: ${motivoInhab.trim()}`);
    showToast('Cliente inhabilitado correctamente', 'success');
    setDisableCliente(null);
  };

  const handleHabilitar = (cli: ClienteHotel) => {
    setClientes((prev) => prev.map((c) => (c.id === cli.id ? { ...c, estado: 'Activo' } : c)));
    logAuditoria('Clientes', 'Habilitación Cliente', `Cliente ${cli.nombre} reactivado.`);
    showToast('Cliente habilitado correctamente', 'success');
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Directorio de Clientes</h1>
        <p className="view-subtitle">Gestión de huéspedes personas naturales (DNI / Pasaporte) y empresas (RUC)</p>
      </div>

      <div className="subtabs-container">
        <button
          className={`subtab-btn ${subtab === 'todos' ? 'active' : ''}`}
          onClick={() => setSubtab('todos')}
        >
          Todos ({clientes.length})
        </button>
        <button
          className={`subtab-btn ${isNaturalTab ? 'active' : ''}`}
          onClick={() => setSubtab('natural')}
        >
          Persona Natural ({clientes.filter((c) => c.tipo === 'Persona Natural').length})
        </button>
        <button
          className={`subtab-btn ${isEmpresaTab ? 'active' : ''}`}
          onClick={() => setSubtab('empresa')}
        >
          Empresa Corporativa ({clientes.filter((c) => c.tipo === 'Empresa').length})
        </button>
      </div>

      <div className="filters-toolbar">
        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="Buscar por DNI, RUC, nombre, razón social o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: 16 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="select-role"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as 'Todos' | 'Activo' | 'Inactivo')}
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Activo">Solo Activos</option>
            <option value="Inactivo">Solo Inactivos</option>
          </select>
          <button
            className="btn btn-gold"
            onClick={() => openModalCrear(isEmpresaTab ? 'Empresa' : 'Persona Natural')}
          >
            + Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Cliente / Razón Social</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No se encontraron registros para tu búsqueda.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="home-meta-chip">
                        {c.tipo === 'Empresa' ? 'Empresa' : 'Natural'}
                      </span>
                    </td>
                    <td><strong>{c.tipoDoc}: {c.documento}</strong></td>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.telefono}</td>
                    <td>
                      <span className={`badge-status ${c.estado === 'Activo' ? 'disponible' : 'ocupada'}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {c.estado === 'Activo' && (
                          <>
                            <button
                              className="btn btn-sm btn-gold"
                              onClick={() => navigate(`/reservas?clienteId=${c.id}`)}
                              title="Abrir asistente de reserva para este cliente"
                            >
                              Reservar
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => navigate(`/rack?clienteId=${c.id}`)}
                              title="Ver habitaciones disponibles para este cliente"
                            >
                              Elegir Cuarto
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setFichaCliente(c)}
                          title="Ver Ficha Técnica"
                        >
                          Ficha
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => openModalEditar(c)}
                        >
                          Editar
                        </button>
                        {c.estado === 'Activo' ? (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleOpenInhabilitar(c)}
                          >
                            Inhabilitar
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-gold"
                            onClick={() => handleHabilitar(c)}
                          >
                            Habilitar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORMULARIO CREAR / EDITAR CLIENTE (CON SANITIZACIÓN DNI 8 / RUC 11) */}
      {showFormModal && (
        <div className="modal-backdrop" onClick={() => setShowFormModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCliente ? `Editar Cliente: ${editingCliente.nombre}` : 'Registrar Cliente'}</h3>
              <button className="btn-close-modal" onClick={() => setShowFormModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleGuardarCliente}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Tipo de Cliente <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={cliTipo}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value as 'Persona Natural' | 'Empresa';
                        setCliTipo(nuevoTipo);
                        setCliTipoDoc(nuevoTipo === 'Empresa' ? 'RUC' : 'DNI');
                        setCliDoc('');
                        setErrors({});
                      }}
                    >
                      <option value="Persona Natural">Persona Natural (B2C - DNI 8 dígitos / Pasaporte)</option>
                      <option value="Empresa">Empresa Corporativa (B2B - RUC 11 dígitos)</option>
                    </select>
                  </div>

                  {cliTipo === 'Persona Natural' ? (
                    <>
                      <div>
                        <label className="field-label">Tipo de Documento <span className="req">*</span></label>
                        <select
                          className="form-select"
                          value={cliTipoDoc}
                          onChange={(e) => {
                            setCliTipoDoc(e.target.value as 'DNI' | 'Pasaporte' | 'Carné de Extranjería');
                            setCliDoc('');
                          }}
                        >
                          <option value="DNI">DNI (8 dígitos numéricos)</option>
                          <option value="Pasaporte">Pasaporte (9-12 alfanum)</option>
                          <option value="Carné de Extranjería">Carné de Extranjería</option>
                        </select>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label className="field-label" style={{ marginBottom: 0 }}>
                            N° Documento ({cliTipoDoc === 'DNI' ? `${cliDoc.length}/8` : 'Alfanum.'}) <span className="req">*</span>
                          </label>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            onClick={handleAutocompletarPadron}
                          >
                            Consultar RENIEC
                          </button>
                        </div>
                        <input
                          type="text"
                          inputMode={cliTipoDoc === 'DNI' ? 'numeric' : 'text'}
                          className={`form-input ${errors.doc ? 'has-error' : ''}`}
                          placeholder={cliTipoDoc === 'DNI' ? 'Ej. 45892136' : 'Ej. PA98451236'}
                          value={cliDoc}
                          onChange={(e) => handleDocChange(e.target.value)}
                        />
                        {errors.doc && <small className="field-msg-error">{errors.doc}</small>}
                      </div>
                      <div className="form-col-full">
                        <label className="field-label">Nombres y Apellidos <span className="req">*</span></label>
                        <input
                          type="text"
                          className={`form-input ${errors.nombre ? 'has-error' : ''}`}
                          placeholder="Solo letras y espacios"
                          value={cliNombre}
                          onChange={(e) => setCliNombre(e.target.value)}
                        />
                        {errors.nombre && <small className="field-msg-error">{errors.nombre}</small>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label className="field-label" style={{ marginBottom: 0 }}>
                            RUC ({cliDoc.length}/11) <span className="req">*</span>
                          </label>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            onClick={handleAutocompletarPadron}
                          >
                            Consultar SUNAT
                          </button>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`form-input ${errors.doc ? 'has-error' : ''}`}
                          placeholder="11 dígitos (inicia con 10 o 20)"
                          value={cliDoc}
                          onChange={(e) => handleDocChange(e.target.value)}
                        />
                        {errors.doc && <small className="field-msg-error">{errors.doc}</small>}
                      </div>
                      <div>
                        <label className="field-label">Teléfono Corporativo <span className="req">*</span></label>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`form-input ${errors.tel ? 'has-error' : ''}`}
                          placeholder="7 a 9 dígitos numéricos"
                          value={cliTel}
                          onChange={(e) => handleTelChange(e.target.value)}
                        />
                        {errors.tel && <small className="field-msg-error">{errors.tel}</small>}
                      </div>
                      <div className="form-col-full">
                        <label className="field-label">Razón Social <span className="req">*</span></label>
                        <input
                          type="text"
                          className={`form-input ${errors.nombre ? 'has-error' : ''}`}
                          placeholder="Nombre legal de la empresa S.A.C. / S.A."
                          value={cliNombre}
                          onChange={(e) => setCliNombre(e.target.value)}
                        />
                        {errors.nombre && <small className="field-msg-error">{errors.nombre}</small>}
                      </div>
                    </>
                  )}

                  {cliTipo === 'Persona Natural' && (
                    <div>
                      <label className="field-label">Teléfono / Celular <span className="req">*</span></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`form-input ${errors.tel ? 'has-error' : ''}`}
                        placeholder="7 a 9 dígitos numéricos"
                        value={cliTel}
                        onChange={(e) => handleTelChange(e.target.value)}
                      />
                      {errors.tel && <small className="field-msg-error">{errors.tel}</small>}
                    </div>
                  )}

                  <div>
                    <label className="field-label">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="correo@ejemplo.com"
                      value={cliEmail}
                      onChange={(e) => setCliEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-col-full">
                    <label className="field-label">Dirección / Domicilio Fiscal</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Av. / Calle / Distrito, Ciudad"
                      value={cliDireccion}
                      onChange={(e) => setCliDireccion(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE FICHA TÉCNICA DEL CLIENTE */}
      {fichaCliente && (
        <div className="modal-backdrop" onClick={() => setFichaCliente(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ficha Técnica del Cliente</h3>
              <button className="btn-close-modal" onClick={() => setFichaCliente(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="table-card" style={{ padding: 20, background: 'var(--cream)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span className="view-header-badge" style={{ marginBottom: 4 }}>
                      {fichaCliente.tipo === 'Empresa' ? 'CUENTA CORPORATIVA' : 'PERSONA NATURAL'}
                    </span>
                    <h4 style={{ fontSize: 20, fontWeight: 700, color: 'var(--wine-900)' }}>
                      {fichaCliente.nombre}
                    </h4>
                  </div>
                  <span className={`badge-status ${fichaCliente.estado === 'Activo' ? 'disponible' : 'ocupada'}`}>
                    {fichaCliente.estado}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div>
                    <strong style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>DOCUMENTO</strong>
                    <span>{fichaCliente.tipoDoc}: <strong>{fichaCliente.documento}</strong></span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>TELÉFONO</strong>
                    <span>{fichaCliente.telefono}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>CORREO ELECTRÓNICO</strong>
                    <span>{fichaCliente.email || 'reservas@hotelaventura.pe'}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>DIRECCIÓN</strong>
                    <span>{fichaCliente.direccion || 'Miraflores, Lima - Perú'}</span>
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: 14, color: 'var(--wine-900)', marginBottom: 8 }}>
                Historial de Reservas Asociadas:
              </h4>
              {reservas.filter((r) => r.clienteId === fichaCliente.id).length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin reservas registradas hasta la fecha.</p>
              ) : (
                <table className="data-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Habitación</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas
                      .filter((r) => r.clienteId === fichaCliente.id)
                      .map((r) => (
                        <tr key={r.id}>
                          <td><strong>{r.codigo}</strong></td>
                          <td>#{r.habitacionNumero}</td>
                          <td>{r.entrada}</td>
                          <td>{r.salida}</td>
                          <td><span className="badge-status disponible">{r.estado}</span></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setFichaCliente(null)}>Cerrar Ficha</button>
              <button
                className="btn btn-gold"
                onClick={() => {
                  const target = fichaCliente;
                  setFichaCliente(null);
                  openModalEditar(target);
                }}
              >
                Editar Datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR INHABILITACIÓN */}
      {disableCliente && (
        <div className="modal-backdrop" onClick={() => setDisableCliente(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inhabilitar Cliente</h3>
              <button className="btn-close-modal" onClick={() => setDisableCliente(null)}>&times;</button>
            </div>
            <form onSubmit={handleConfirmInhabilitar}>
              <div className="modal-body">
                <p style={{ fontSize: 14, marginBottom: 14 }}>
                  ¿Confirma inhabilitar al cliente <strong>{disableCliente.nombre}</strong> ({disableCliente.documento})?
                </p>
                <label className="field-label">Motivo de la inhabilitación <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[
                    'Solicitud del propio cliente',
                    'Datos fiscales inactivos en SUNAT',
                    'Incumplimiento de normas del hotel',
                  ].map((mot) => (
                    <button
                      key={mot}
                      type="button"
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => {
                        setMotivoInhab(mot);
                        setMotivoErr('');
                      }}
                    >
                      {mot}
                    </button>
                  ))}
                </div>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Seleccione un motivo rápido arriba o escriba el detalle..."
                  value={motivoInhab}
                  onChange={(e) => setMotivoInhab(e.target.value)}
                />
                {motivoErr && <small className="field-msg-error">{motivoErr}</small>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDisableCliente(null)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Confirmar Inhabilitación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
