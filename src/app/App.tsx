import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider } from '../context/HotelContext';
import { MainLayout } from '../components/Layout/MainLayout';

// Módulo 1: Kenny Garay (Rama: Kenny)
import { LoginPage } from '../pages/Login/LoginPage';
import { UsuariosPage } from '../pages/Usuarios/UsuariosPage';
import { AuditoriaPage } from '../pages/Auditoria/AuditoriaPage';

// Módulo 2: Erik Barrera (Rama: Erik)
import { HomePage } from '../pages/Home/HomePage';
import { HuespedesPage } from '../pages/Huespedes/HuespedesPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { PortalClientePage } from '../pages/Portal/PortalClientePage';

// Módulo 3: David Asto (Rama: David)
import { RackPage } from '../pages/Rack/RackPage';
import { ReservasPage } from '../pages/Reservas/ReservasPage';
import { EstanciasPage } from '../pages/CheckIn/EstanciasPage';

// Módulo 4: Héctor Urbano (Rama: Hector)
import { OperacionesPage } from '../pages/Operaciones/OperacionesPage';

// Módulo 5: Eliseo Mariño (Rama: Eliseo)
import { InventarioPage } from '../pages/POS/InventarioPage';
import { POSPage } from '../pages/POS/POSPage';

export const App: React.FC = () => {
  return (
    <HotelProvider>
      <BrowserRouter>
        <Routes>
          {/* Acceso y Portal Web del Cliente */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal" element={<PortalClientePage />} />

          {/* Sistema Integral Administrativo y Operativo (11 Vistas del Legacy) */}
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

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </HotelProvider>
  );
};

export default App;
