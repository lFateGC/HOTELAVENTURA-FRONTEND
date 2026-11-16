/**
 * MÓDULO 1: Gestión de Usuarios y Personal (Dueño / Admin)
 * Responsable: Kenny Garay (Rama: Kenny)
 */
import React, { useState } from 'react';
import { useHotel, type RolLegado, type UsuarioHotel } from '../../context/HotelContext';

export const UsuariosPage: React.FC = () => {
  const { users, setUsers, currentUser, logAuditoria, showToast } = useHotel();

  const [showNewModal, setShowNewModal] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<UsuarioHotel | null>(null);
  const [disableModalUser, setDisableModalUser] = useState<UsuarioHotel | null>(null);

  const [nom, setNom] = useState('');
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [conf, setConf] = useState('');
  const [rolInicial, setRolInicial] = useState<RolLegado>('Recepcionista');
  const [formErr, setFormErr] = useState('');

  const [nuevoRol, setNuevoRol] = useState<RolLegado>('Recepcionista');
  const [motivoInhab, setMotivoInhab] = useState('');
  const [motivoErr, setMotivoErr] = useState('');

  const handleCrearUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    if (!nom.trim() || !login.trim() || !pass.trim() || !conf.trim()) {
      setFormErr('Todos los campos marcados con * son obligatorios.');
      return;
    }
    if (!/^[a-zA-Z0-9]{4,20}$/.test(login.trim())) {
      setFormErr('El usuario debe tener entre 4 y 20 caracteres alfanuméricos sin espacios.');
      return;
    }
    if (pass.length < 8) {
      setFormErr('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (pass !== conf) {
      setFormErr('Las contraseñas no coinciden.');
      return;
    }
    if (users.some((u) => u.usuario.toLowerCase() === login.trim().toLowerCase())) {
      setFormErr('El nombre de usuario ya está en uso.');
      return;
    }

    const nuevo: UsuarioHotel = {
      id: users.length + 1,
      nombre: nom.trim(),
      usuario: login.trim(),
      passwordHash: pass,
      rol: rolInicial,
      estado: 'Activo',
    };
    setUsers((prev) => [...prev, nuevo]);
    logAuditoria('Usuarios', 'Creación de Usuario', `Registrado usuario "${nuevo.usuario}" (${nuevo.nombre}) con rol ${nuevo.rol}.`);
    showToast('Usuario creado con éxito', 'success');
    setShowNewModal(false);
    setNom('');
    setLogin('');
    setPass('');
    setConf('');
  };

  const handleCambiarRol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;

    if (roleModalUser.rol === 'Administrador' && nuevoRol !== 'Administrador') {
      const adminActivos = users.filter((u) => u.rol === 'Administrador' && u.estado === 'Activo').length;
      if (adminActivos <= 1) {
        showToast('Debe existir al menos un Administrador activo en el hotel', 'danger');
        return;
      }
    }

    const rolAnterior = roleModalUser.rol;
    setUsers((prev) => prev.map((u) => (u.id === roleModalUser.id ? { ...u, rol: nuevoRol } : u)));
    logAuditoria('Usuarios', 'Asignación de Rol', `Cambiado rol de "${roleModalUser.usuario}" de ${rolAnterior} a ${nuevoRol}.`);
    showToast('Rol asignado con éxito', 'success');
    setRoleModalUser(null);
  };

  const handleInhabilitar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableModalUser) return;
    if (motivoInhab.trim().length < 10) {
      setMotivoErr('El motivo debe tener al menos 10 caracteres.');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === disableModalUser.id ? { ...u, estado: 'Inactivo' } : u)));
    logAuditoria('Usuarios', 'Inhabilitación de Usuario', `Inhabilitado usuario "${disableModalUser.usuario}". Motivo: ${motivoInhab.trim()}`);
    showToast('Usuario inhabilitado correctamente', 'success');
    setDisableModalUser(null);
    setMotivoInhab('');
    setMotivoErr('');
  };

  const handleHabilitar = (u: UsuarioHotel) => {
    setUsers((prev) => prev.map((usr) => (usr.id === u.id ? { ...usr, estado: 'Activo' } : usr)));
    logAuditoria('Usuarios', 'Habilitación de Usuario', `Usuario "${u.usuario}" reactivado.`);
    showToast('Usuario habilitado correctamente', 'success');
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Personal y Usuarios</h1>
        <p className="view-subtitle">Gestión de cuentas de empleados, roles de acceso y estado de personal</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--wine-900)' }}>
            Cuentas de Personal
          </h3>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Registro de usuarios, asignación de roles e inhabilitación de cuentas.
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowNewModal(true)}>
          Nuevo Usuario
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombres y Apellidos</th>
                <th>Usuario</th>
                <th>Rol Asignado</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.nombre}</strong></td>
                  <td><code>{u.usuario}</code></td>
                  <td>
                    <span className={`badge-status ${u.rol === 'Administrador' ? 'reservada' : u.rol === 'Personal de Limpieza' ? 'limpieza' : 'disponible'}`}>
                      {u.rol === 'Administrador' ? 'Dueño / Admin' : u.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${u.estado === 'Activo' ? 'disponible' : 'ocupada'}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {u.estado === 'Activo' ? (
                        <>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setRoleModalUser(u);
                              setNuevoRol(u.rol);
                            }}
                          >
                            Cambiar Rol
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              if (currentUser.id === u.id) {
                                showToast('No puede inhabilitar su propio usuario conectado', 'danger');
                                return;
                              }
                              setDisableModalUser(u);
                              setMotivoInhab('');
                              setMotivoErr('');
                            }}
                          >
                            Inhabilitar
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-gold" onClick={() => handleHabilitar(u)}>
                          Habilitar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Usuario */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Cuenta de Empleado</h3>
              <button className="btn-close-modal" onClick={() => setShowNewModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCrearUsuario}>
              <div className="modal-body">
                {formErr && (
                  <div className="banner danger">
                    <span className="banner-icon">✕</span>
                    <div className="banner-body">{formErr}</div>
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Nombres y Apellidos <span className="req">*</span></label>
                    <input type="text" className="form-input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Máximo 60 caracteres" maxLength={60} />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Nombre de Usuario <span className="req">*</span></label>
                    <input type="text" className="form-input" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="4 a 20 caracteres alfanuméricos sin espacios" maxLength={20} />
                  </div>
                  <div>
                    <label className="field-label">Contraseña <span className="req">*</span></label>
                    <input type="password" className="form-input" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mínimo 8 caracteres" />
                  </div>
                  <div>
                    <label className="field-label">Confirmar Contraseña <span className="req">*</span></label>
                    <input type="password" className="form-input" value={conf} onChange={(e) => setConf(e.target.value)} placeholder="Repita la contraseña" />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Rol Operativo <span className="req">*</span></label>
                    <select className="form-select" value={rolInicial} onChange={(e) => setRolInicial(e.target.value as RolLegado)}>
                      <option value="Recepcionista">Recepcionista</option>
                      <option value="Personal de Limpieza">Personal de Limpieza</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Empleado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Rol */}
      {roleModalUser && (
        <div className="modal-backdrop" onClick={() => setRoleModalUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Asignar Rol a {roleModalUser.usuario}</h3>
              <button className="btn-close-modal" onClick={() => setRoleModalUser(null)}>&times;</button>
            </div>
            <form onSubmit={handleCambiarRol}>
              <div className="modal-body">
                <p style={{ fontSize: 13, marginBottom: 12 }}>
                  Modificando permisos de acceso para: <strong>{roleModalUser.nombre}</strong> (<code>{roleModalUser.usuario}</code>)
                </p>
                <label className="field-label">Seleccionar Nuevo Rol <span className="req">*</span></label>
                <select className="form-select" value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value as RolLegado)}>
                  <option value="Administrador">Administrador / Dueño (Todos los módulos)</option>
                  <option value="Recepcionista">Recepcionista (Reservas, Caja, Inventario)</option>
                  <option value="Personal de Limpieza">Personal de Limpieza (Housekeeping e Incidentes)</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRoleModalUser(null)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Rol</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Inhabilitar Usuario */}
      {disableModalUser && (
        <div className="modal-backdrop" onClick={() => setDisableModalUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inhabilitar Usuario {disableModalUser.usuario}</h3>
              <button className="btn-close-modal" onClick={() => setDisableModalUser(null)}>&times;</button>
            </div>
            <form onSubmit={handleInhabilitar}>
              <div className="modal-body">
                <p style={{ fontSize: 14, marginBottom: 14 }}>
                  ¿Confirma inhabilitar la cuenta del usuario <strong>{disableModalUser.usuario}</strong> ({disableModalUser.nombre})?
                </p>
                <label className="field-label">Motivo de la inhabilitación <span className="req">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Mínimo 10 caracteres..."
                  value={motivoInhab}
                  onChange={(e) => setMotivoInhab(e.target.value)}
                />
                {motivoErr && <small className="field-msg-error">{motivoErr}</small>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDisableModalUser(null)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Confirmar Inhabilitación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
