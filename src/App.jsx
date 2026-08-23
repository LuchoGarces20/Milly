import React, { useState } from 'react';
import { useMilesData } from './hooks/useMilesData';
import Header from './components/layout/Header';
import ProgramModal from './components/modals/ProgramModal';
import TransactionModal from './components/modals/TransactionModal';
import ProfileModal from './components/modals/ProfileModal';
import OnboardingView from './components/views/OnboardingView';
import DashboardView from './components/views/DashboardView';
import ProgramView from './components/views/ProgramView';
import SimulatorView from './components/views/SimulatorView';
import { CheckCircle2, X } from 'lucide-react'; // NOVO: Ícones para o Toast

export default function App() {
  const milesData = useMilesData();
  const [currentView, setCurrentView] = useState('onboarding');
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [preselectedProgTx, setPreselectedProgTx] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (currentView === 'onboarding') {
    return (
      <OnboardingView
        milesData={milesData}
        onComplete={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300 relative">
      <Header
         milesData={milesData}
         currentView={currentView}
         onHomeClick={() => setCurrentView('dashboard')}
         onSimulatorClick={() => setCurrentView('simulator')}
         onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {currentView === 'dashboard' && (
          <DashboardView
            milesData={milesData}
            onOpenProgModal={(prog) => { setEditingProg(prog); setIsProgModalOpen(true); }}
            onOpenTxModal={(progId) => { setPreselectedProgTx(progId); setIsTxModalOpen(true); }}
            onSelectProgram={(id) => { setSelectedProgramId(id); setCurrentView('programView'); }}
          />
        )}
        {currentView === 'programView' && (
          <ProgramView
            programId={selectedProgramId}
            milesData={milesData}
            onBack={() => setCurrentView('dashboard')}
            onOpenProgModal={(prog) => { setEditingProg(prog); setIsProgModalOpen(true); }}
            onOpenTxModal={(progId, tx) => { setPreselectedProgTx(progId); setEditingTx(tx); setIsTxModalOpen(true); }}
          />
        )}
        {currentView === 'simulator' && (
          <SimulatorView milesData={milesData} />
        )}
      </main>

      <ProgramModal isOpen={isProgModalOpen} onClose={() => { setIsProgModalOpen(false); setEditingProg(null); }} editingProg={editingProg} milesData={milesData} />
      <TransactionModal isOpen={isTxModalOpen} onClose={() => { setIsTxModalOpen(false); setEditingTx(null); setPreselectedProgTx(null); }} editingTx={editingTx} preselectedProgramId={preselectedProgTx} isProgramView={currentView === 'programView'} milesData={milesData} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} milesData={milesData} />

      {/* NOVO: TOAST FLUTUANTE */}
      {milesData.toast.visible && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            {milesData.toast.message}
            <button onClick={() => milesData.setToast({visible: false})} className="ml-2">
              <X className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}