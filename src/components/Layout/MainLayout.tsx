import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useHotel } from '../../context/HotelContext';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, removeToast } = useHotel();

  return (
    <div className="spa-layout" id="spaApp">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-area">
        <Topbar onToggleMobile={() => setSidebarOpen((prev) => !prev)} />
        <main className="dynamic-view-container">
          <Outlet />
        </main>
      </div>

      <div className="toasts-container">
        {toasts.map((t) => {
          const icons = { success: '✓', danger: '✕', warning: '!', info: 'ℹ' };
          return (
            <div key={t.id} className={`toast ${t.type}`}>
              <span className="toast-icon">{icons[t.type] || 'ℹ'}</span>
              <div className="toast-body">{t.message}</div>
              <button className="toast-close" onClick={() => removeToast(t.id)}>
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
