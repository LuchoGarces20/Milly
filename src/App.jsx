import React, { useState, Suspense, lazy } from 'react';
import { useMilesData } from './hooks/useMilesData';
import AuthView from './components/views/AuthView';
import Header from './components/layout/Header';
import ProgramModal from './components/modals/ProgramModal';
import TransactionModal from './components/modals/TransactionModal';
import ProfileModal from './components/modals/ProfileModal';
import OnboardingView from './components/views/OnboardingView';
import { CheckCircle2, X } from 'lucide-react';

// CODE SPLITTING NATIVO
const DashboardView = lazy(() => import('./components/views/DashboardView'));
const ProgramView = lazy(() => import('./components/views/ProgramView'));
const SimulatorView = lazy(() => import('./components/views/SimulatorView'));

export default function App() {
  const milesData = useMilesData();
  const { session, userProfile } = milesData;
  
  // Decide la vista inicial con base en los perfiles guardados
  const [currentView, setCurrentView] = useState(() => {
    const savedProfiles = JSON.parse(localStorage.getItem('milly_profiles') || '[]');
    return savedProfiles.length > 0 ? 'dashboard' : 'onboarding';
  });

  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [preselectedProgTx, setPreselectedProgTx] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Bloqueo de Autenticación: Muestra AuthView si no hay sesión
  if (!session || !userProfile) {
    return <AuthView onAuthComplete={(user, profile) => {
      milesData.setUserProfile(profile); // Libera el bloqueo
      
      // Auto-completa el perfil si no existe localmente
      if (milesData.profiles.length === 0) {
        milesData.setProfiles([{ id: profile.id, name: profile.name }]);
      }
      setCurrentView('dashboard'); // Envía al usuario directo al dashboard
    }} />;
  }

  if (currentView === 'onboarding') {
    return <OnboardingView milesData={milesData} onComplete={() => setCurrentView('dashboard')} />;
  }

  // Loader elegante mientras se descargan los chunks
  const SuspenseLoader = () => (
    <div className="flex justify-center items-center h-64 w-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300 relative">
      <Header milesData={milesData} currentView={currentView} onHomeClick={() => setCurrentView('dashboard')} onSimulatorClick={() => setCurrentView('simulator')} onOpenProfileModal={() => setIsProfileModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Suspense fallback={<SuspenseLoader />}>
          {currentView === 'dashboard' && (
            <DashboardView milesData={milesData} onOpenProgModal={(prog) => { setEditingProg(prog); setIsProgModalOpen(true); }} onOpenTxModal={(progId) => { setPreselectedProgTx(progId); setIsTxModalOpen(true); }} onSelectProgram={(id) => { setSelectedProgramId(id); setCurrentView('programView'); }} />
          )}
          {currentView === 'programView' && (
            <ProgramView programId={selectedProgramId} milesData={milesData} onBack={() => setCurrentView('dashboard')} onOpenProgModal={(prog) => { setEditingProg(prog); setIsProgModalOpen(true); }} onOpenTxModal={(progId, tx) => { setPreselectedProgTx(progId); setEditingTx(tx); setIsTxModalOpen(true); }} />
          )}
          {currentView === 'simulator' && (
            <SimulatorView milesData={milesData} />
          )}
        </Suspense>
      </main>

      <ProgramModal isOpen={isProgModalOpen} onClose={() => { setIsProgModalOpen(false); setEditingProg(null); }} editingProg={editingProg} milesData={milesData} />
      <TransactionModal isOpen={isTxModalOpen} onClose={() => { setIsTxModalOpen(false); setEditingTx(null); setPreselectedProgTx(null); }} editingTx={editingTx} preselectedProgramId={preselectedProgTx} isProgramView={currentView === 'programView'} milesData={milesData} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} milesData={milesData} />

      {milesData.toast.visible && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            {milesData.toast.message}
            <button onClick={() => milesData.setToast({visible: false})} className="ml-2"><X className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" /></button>
          </div>
        </div>
      )}
    </div>
  );
}