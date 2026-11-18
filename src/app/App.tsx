import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider } from '../context/HotelContext';
import { MainLayout } from '../components/Layout/MainLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Pantalla de carga con branding oficial de Hotel Aventura
const LoadingFallback: React.FC = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 32,
      fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    }}
  >
    <div
      style={{
        width: 46,
        height: 46,
        border: '3px solid rgba(22, 163, 74, 0.2)',
        borderTopColor: '#16a34a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <div style={{ textAlign: 'center' }}>
      <strong style={{ fontSize: 14, color: '#0f172a', display: 'block', letterSpacing: 0.3 }}>
        HOTEL AVENTURA
      </strong>
      <span style={{ fontSize: 12, color: '#64748b' }}>
        Cargando módulo...
      </span>
    </div>
  </div>
);

// Módulo 1: Kenny Garay (Rama: Kenny) - Autenticación, Usuarios y Auditoría
const LoginPage = lazy(() =>
  import('../pages/Login/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const UsuariosPage = lazy(() =>
  import('../pages/Usuarios/UsuariosPage').then((m) => ({ default: m.UsuariosPage }))
);
const AuditoriaPage = lazy(() =>
  import('../pages/Auditoria/AuditoriaPage').then((m) => ({ default: m.AuditoriaPage }))
);

// Módulo 2: Erik Barrera (Rama: Erik) - Portal, Huéspedes, Dashboard y Home
const HomePage = lazy(() =>
  import('../pages/Home/HomePage').then((m) => ({ default: m.HomePage }))
);
const HuespedesPage = lazy(() =>
  import('../pages/Huespedes/HuespedesPage').then((m) => ({ default: m.HuespedesPage }))
);
const DashboardPage = lazy(() =>
  import('../pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const PortalClientePage = lazy(() =>
  import('../pages/Portal/PortalClientePage').then((m) => ({ default: m.PortalClientePage }))
);

// Módulo 3: David Asto (Rama: David) - Rack, Reservas y Estancias
const RackPage = lazy(() =>
  import('../pages/Rack/RackPage').then((m) => ({ default: m.RackPage }))
);
const ReservasPage = lazy(() =>
  import('../pages/Reservas/ReservasPage').then((m) => ({ default: m.ReservasPage }))
);
const EstanciasPage = lazy(() =>
  import('../pages/CheckIn/EstanciasPage').then((m) => ({ default: m.EstanciasPage }))
);

// Módulo 4: Héctor Urbano (Rama: Hector) - Operaciones, Ama de Llaves y Mantenimiento
const OperacionesPage = lazy(() =>
  import('../pages/Operaciones/OperacionesPage').then((m) => ({ default: m.OperacionesPage }))
);

// Módulo 5: Eliseo Mariño (Rama: Eliseo) - POS y Control de Inventario
const InventarioPage = lazy(() =>
  import('../pages/POS/InventarioPage').then((m) => ({ default: m.InventarioPage }))
);
const POSPage = lazy(() =>
  import('../pages/POS/POSPage').then((m) => ({ default: m.POSPage }))
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HotelProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Acceso y Portal Web del Cliente */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/portal" element={<PortalClientePage />} />

              {/* Sistema Integral Administrativo y Operativo (11 Vistas) */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<HomePage />} />
                <Route path="huespedes" element={<HuespedesPage />} />
                <Route path="rack" element={<RackPage />} />
                <Route path="reservas" element={<ReservasPage />} />
                <Route path="estancias" element={<EstanciasPage />} />
                <Route path="operaciones" element={<OperacionesPage />} />
                <Route path="inventario" element={<InventarioPage />} />
                <Route path="pos" element={<POSPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="usuarios" element={<UsuariosPage />} />
                <Route path="auditoria" element={<AuditoriaPage />} />
              </Route>

              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </HotelProvider>
    </ErrorBoundary>
  );
};

export default App;
