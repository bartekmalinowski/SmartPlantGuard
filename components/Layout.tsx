// src/components/Layout.tsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HomeIcon, HistoryIcon, SettingsIcon, LeafIcon } from './icons';
import { useDeviceData } from '../contexts/DeviceContext'; // Importujemy nasz hook

const Layout = () => {
  const { liveData } = useDeviceData(); // Pobieramy dane globalnie

  const isLowWater = liveData && liveData.water_level_cm > liveData.settings.waterLevelThreshold;

  const navLinkClasses = ({ isActive }) =>
    `flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-colors duration-200 ${
      isActive
        ? 'bg-aurora-primary/10 text-aurora-primary'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`;

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'rgba(31, 41, 55, 0.8)', color: '#e5e7eb', border: '1px solid var(--aurora-border)', backdropFilter: 'blur(8px)' } }} />
      
      {/* GLOBALNY BANER ALARMOWY */}
      {isLowWater && (
        <div className="fixed top-0 left-0 w-full bg-red-500/90 text-white text-center py-2 z-50 shadow-lg animate-pulse">
          Warning: Water tank level is low. Please refill!
        </div>
      )}

      <div className="flex flex-col md:flex-row min-h-screen font-sans">
        <aside className="w-full md:w-24 lg:w-64 bg-gray-900/50 border-r border-aurora-border p-4 flex flex-col items-center lg:items-stretch">
          <div className="flex items-center justify-center lg:justify-start gap-3 h-16 text-aurora-primary shrink-0">
            <LeafIcon className="w-8 h-8"/>
            <span className="text-xl font-bold text-gray-200 hidden lg:block">SmartPlantGuard</span>
          </div>
          <nav className="mt-8">
            <ul className="flex flex-row md:flex-col justify-around md:justify-start gap-2">
              <li><NavLink to="/" className={navLinkClasses}>
                <HomeIcon className="w-6 h-6 shrink-0" /><span className="text-xs lg:text-base hidden lg:block">Dashboard</span>
              </NavLink></li>
              <li><NavLink to="/history" className={navLinkClasses}>
                <HistoryIcon className="w-6 h-6 shrink-0" /><span className="text-xs lg:text-base hidden lg:block">History</span>
              </NavLink></li>
              <li><NavLink to="/settings" className={navLinkClasses}>
                <SettingsIcon className="w-6 h-6 shrink-0" /><span className="text-xs lg:text-base hidden lg:block">Settings</span>
              </NavLink></li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;