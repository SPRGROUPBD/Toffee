
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { PlayerOverlay } from './components/PlayerOverlay';
import { HomeView } from './views/Home';
import { LocalView } from './views/Local';
import { SamplesView } from './views/Samples';
import { PlaylistView } from './views/Playlist';
import { SettingsView } from './views/Settings';
import { HomeIcon, PlayIcon, FolderIcon, QueueListIcon, CogIcon } from './components/Icons';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/local', label: 'Local', icon: PlayIcon }, // Using play icon for local as per screenshot
    { path: '/samples', label: 'Samples', icon: FolderIcon }, // Folder with star in screenshot, using normal folder
    { path: '/playlist', label: 'Playlist', icon: QueueListIcon },
    { path: '/settings', label: 'Settings', icon: CogIcon },
  ];

  return (
    <div className="flex justify-around items-center bg-white border-t border-slate-200 pb-safe pt-2 px-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center p-2 min-w-[64px]"
          >
            <div className={`p-1.5 rounded-full mb-1 transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'text-indigo-900' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const Layout = () => {
  return (
    <div className="flex justify-center h-screen bg-slate-100">
      {/* Mobile container constraint for desktop viewing */}
      <div className="w-full max-w-md bg-white h-full flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/local" element={<LocalView />} />
            <Route path="/samples" element={<SamplesView />} />
            <Route path="/playlist" element={<PlaylistView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
        
        {/* Full Screen Player Overlay */}
        <PlayerOverlay />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout />
      </HashRouter>
    </AppProvider>
  );
}
