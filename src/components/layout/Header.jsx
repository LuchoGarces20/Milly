// src/components/layout/Header.jsx
import React from 'react';
import { Orbit, Sun, Moon, Pencil } from 'lucide-react';

export default function Header({ milesData, currentView, onHomeClick, onSimulatorClick, onOpenProfileModal }) {
  const { profiles, isDarkMode, setIsDarkMode } = milesData;

  const renderProfileBadge = () => {
    if (!profiles || profiles.length === 0) return 'Titulares';
    if (profiles.length === 1) return typeof profiles[0] === 'string' ? profiles[0] : profiles[0].name;
    if (profiles.length === 2) {
      const p1 = typeof profiles[0] === 'string' ? profiles[0] : profiles[0].name;
      const p2 = typeof profiles[1] === 'string' ? profiles[1] : profiles[1].name;
      return `${p1} & ${p2}`;
    }
    return `${profiles.length} Titulares`;
  };

  return (
    <header className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 z-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO BRANDING CLEAN */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onHomeClick}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Orbit className="w-5 h-5 text-white" />
            </div>
            {/* Texto limpo sem subtítulo */}
            <h1 className="text-2xl font-black tracking-tight dark:text-white leading-none">Milly</h1>
          </div>

          {/* NAVEGAÇÃO PRINCIPAL */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
               onClick={onHomeClick}
               className={`text-sm font-bold transition-colors ${currentView === 'dashboard' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
               onClick={onSimulatorClick}
               className={`text-sm font-bold transition-colors ${currentView === 'simulator' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              Simulador
            </button>
          </nav>
        </div>

        {/* ACOES E PERFIL */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenProfileModal}
            title="Gerenciar Titulares"
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors hidden sm:flex"
          >
            <span>{renderProfileBadge()}</span>
            <Pencil className="w-3 h-3 opacity-60" />
          </button>
          
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400">
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </header>
  );
}