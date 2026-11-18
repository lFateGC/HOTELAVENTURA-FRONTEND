/**
 * MÓDULO 1: Autenticación y Seguridad (Login Sofisticado de 2 Columnas)
 * Responsable: Kenny Garay (Rama: Kenny)
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel, type UsuarioHotel } from '../../context/HotelContext';
import { authService } from '../../services/authService';

export const LoginPage: React.FC = () => {
  const { users, setCurrentUser, logAuditoria, showToast } = useHotel();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('admin');
  const [password, setPassword] = useState('Admin123');
  const [showPass, setShowPass] = useState(false);
  const [usuarioError, setUsuarioError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const enterSPA = async (userObj: UsuarioHotel) => {
    setCurrentUser(userObj);
    try {
      await authService.login({ username: userObj.usuario, password: userObj.passwordHash || 'Admin123' });
    } catch {
      // Token opcional si ya validó usuario en BD
    }
    logAuditoria(
      'Acceso',
      'Inicio de Sesión',
      `Usuario "${userObj.usuario}" (${userObj.rol}) ingresó al sistema.`
    );
    showToast(`Bienvenido a Hotel Aventura, ${userObj.usuario}`, 'success');
    navigate('/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsuarioError('');
    setPasswordError('');

    const usrVal = usuario.trim();
    const passVal = password.trim();

    if (!usrVal) {
      setUsuarioError('El campo Usuario es obligatorio.');
      return;
    }
    if (!passVal) {
      setPasswordError('El campo Contraseña es obligatorio.');
      return;
    }

    try {
      const authRes = await authService.login({ username: usrVal, password: passVal });
      const userFromDb = users.find((u) => u.usuario.toLowerCase() === authRes.username.toLowerCase());
      const rolFront = authRes.roles?.includes('ADMIN')
        ? 'Administrador'
        : authRes.roles?.includes('HOUSEKEEPING')
        ? 'Personal de Limpieza'
        : 'Recepcionista';

      const loggedUser: UsuarioHotel = userFromDb || {
        id: authRes.id,
        nombre: authRes.nombreCompleto || authRes.username,
        usuario: authRes.username,
        passwordHash: passVal,
        rol: rolFront,
        estado: 'Activo',
      };
      setCurrentUser(loggedUser);
      logAuditoria('Acceso', 'Inicio de Sesión', `Usuario "${loggedUser.usuario}" (${loggedUser.rol}) ingresó al sistema.`);
      showToast(`Bienvenido a Hotel Aventura, ${loggedUser.nombre}`, 'success');
      navigate('/home');
      return;
    } catch {
      const userFound = users.find((u) => u.usuario.toLowerCase() === usrVal.toLowerCase());
      if (!userFound || userFound.passwordHash !== passVal) {
        setPasswordError('Usuario o contraseña incorrectos (verifique que el servidor Backend esté activo).');
        showToast('Credenciales inválidas o servidor Backend desconectado', 'danger');
        return;
      }
      if (userFound.estado === 'Inactivo') {
        setUsuarioError('Usuario inhabilitado. Contacte al Administrador.');
        showToast('Usuario inhabilitado. Contacte al Administrador', 'danger');
        return;
      }
      enterSPA(userFound);
    }
  };

  return (
    <main className="login-container" id="loginContainer">
      <section className="image-panel">
        <div className="image-overlay"></div>
        <div className="image-content">
          <span className="image-label">HOTEL AVENTURA</span>
          <p>
            Gestión de reservas, recepción
            <br />y control de habitaciones.
          </p>
          <div className="image-sub-brand">
            <span>SISTEMA DE GESTIÓN HOTELERA</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-content">
          <div className="hotel-logo">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #16a34a, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
              HA
            </div>
          </div>

          <header className="login-header">
            <h1>Hotel Aventura</h1>
            <p>Acceso al sistema</p>
          </header>

          <form id="loginForm" className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="usuario">
                Usuario <span className="req">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  id="usuario"
                  placeholder="Ingrese su usuario"
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
              <small id="usuarioError" className="field-error">
                {usuarioError}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Contraseña <span className="req">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="10" width="14" height="10" rx="2"></rect>
                    <path d="M8 10V7 C8 4.8 9.8 3 12 3 C14.2 3 16 4.8 16 7 V10"></path>
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="password"
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  id="togglePassword"
                  className="password-toggle"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label="Mostrar contraseña"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12 C2 12 5 4 12 4 C19 4 22 12 22 12 C22 12 19 20 12 20 C5 20 2 12 2 12Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <small id="passwordError" className="field-error">
                {passwordError}
              </small>
            </div>

            <div className="login-options">
              <label className="remember-option" id="rememberLabel">
                <input type="checkbox" id="remember" defaultChecked />
                <span className="custom-checkbox"></span>
                <span>Recordar sesión</span>
              </label>
            </div>

            <button type="submit" id="loginButton" className="login-button">
              <span>Iniciar Sesión</span>
            </button>

            <div className="demo-access-box">
              <span>Perfiles de prueba:</span>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="btn-demo-quick"
                  onClick={() => enterSPA(users.find((u) => u.rol === 'Administrador') || users[0])}
                >
                  Administrador
                </button>
                <button
                  type="button"
                  className="btn-demo-quick"
                  onClick={() => enterSPA(users.find((u) => u.rol === 'Recepcionista') || users[1])}
                >
                  Recepción
                </button>
                <button
                  type="button"
                  className="btn-demo-quick"
                  onClick={() =>
                    enterSPA(users.find((u) => u.rol === 'Personal de Limpieza') || users[2])
                  }
                >
                  Limpieza
                </button>
                <button
                  type="button"
                  className="btn-demo-quick"
                  onClick={() => navigate('/portal')}
                >
                  Portal Cliente
                </button>
              </div>
            </div>
          </form>

          <div className="login-footer">
            <span></span>
            <p>Hotel Aventura</p>
            <span></span>
          </div>
        </div>
      </section>
    </main>
  );
};
