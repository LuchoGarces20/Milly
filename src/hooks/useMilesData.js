import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDateBR } from '../utils/helpers';
import { calculateProgramStats } from '../utils/mathEngine';

const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prof_${Date.now()}`;

export function useMilesData() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('milly_profiles');
      return saved ? JSON.parse(saved).map(p => typeof p === 'string' ? { id: generateId(), name: p } : p) : [];
    } catch { return []; }
  });
  
  const [activeTab, setActiveTab] = useState('Todos');
  const [programas, setProgramas] = useState(() => JSON.parse(localStorage.getItem('milly_programas') || '[]'));
  const [transacoes, setTransacoes] = useState(() => JSON.parse(localStorage.getItem('milly_transacoes') || '[]'));
  
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  // Escucha cambios de sesión de Supabase automáticamente
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    // Atualizamos a query para fazer "join" com a tabela de famílias e trazer o invite_code
    const { data } = await supabase
      .from('profiles')
      .select('*, families(name, invite_code)')
      .eq('id', userId)
      .single();
      
    if (data) {
      setUserProfile(data);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
  };

  useEffect(() => localStorage.setItem('milly_profiles', JSON.stringify(profiles)), [profiles]);
  useEffect(() => localStorage.setItem('milly_programas', JSON.stringify(programas)), [programas]);
  useEffect(() => localStorage.setItem('milly_transacoes', JSON.stringify(transacoes)), [transacoes]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  // CÁLCULO CONTABLE OPTIMIZADO - Mapea las transacciones 1 sola vez
  const statsPorPrograma = useMemo(() => {
    const txsByProg = transacoes.reduce((acc, tx) => {
      if (!acc[tx.programId]) acc[tx.programId] = [];
      acc[tx.programId].push(tx);
      return acc;
    }, {});

    return programas
      .map(prog => calculateProgramStats(prog, txsByProg[prog.id] || []))
      .sort((a, b) => b.balance - a.balance);
  }, [programas, transacoes]);

  const dashboardStats = useMemo(() => {
    if (activeTab === 'Todos') return statsPorPrograma;
    const activeProf = profiles.find(p => p.id === activeTab || p.name === activeTab);
    const activeName = activeProf ? activeProf.name : activeTab;
    return statsPorPrograma.filter(p => p.owner === activeName);
  }, [activeTab, statsPorPrograma, profiles]);

  const dashboardMetrics = useMemo(() => {
    const totalInvestment = dashboardStats.reduce((acc, curr) => acc + curr.currentPoolCost, 0);
    const totalBalanceThousands = dashboardStats.reduce((acc, curr) => acc + (curr.balance / 1000), 0);
    const weightedCpm = totalBalanceThousands > 0 ? totalInvestment / totalBalanceThousands : 0;
    const totalMarketValue = dashboardStats.reduce((acc, curr) => acc + curr.marketValue, 0);
    const globalProfit = totalMarketValue - totalInvestment;
    return { totalInvestment, totalMarketValue, globalProfit, weightedCpm };
  }, [dashboardStats]);

  const vencimentosGlobais = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dashboardStats.flatMap(prog => prog.expirationsAtivas)
      .map(v => {
        const dataVenc = new Date(v.date + 'T00:00:00');
        const daysLeft = Math.ceil((dataVenc - hoje) / (1000 * 60 * 60 * 24));
        return { ...v, daysLeft, formattedDate: formatDateBR(v.date) };
      })
      .filter(v => v.daysLeft >= 0 && v.daysLeft <= 365)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [dashboardStats]);

  const deleteProgram = (id) => {
    if (window.confirm('Excluir programa e todo o seu histórico de transações? Essa ação pode ser desfeita.')) {
      setProgramas(prev => prev.filter(p => p.id !== id));
      setTransacoes(prev => prev.filter(t => t.programId !== id));
      showToast('Programa excluído', 'success');
      return true;
    }
    return false;
  };

  const deleteTx = (id) => {
    if (String(id).startsWith('auto_')) return alert('Edite ou cancele o clube no cadastro do programa para alterar.');
    if (window.confirm('Excluir esta transação? O saldo do programa será recalculado.')) {
      setTransacoes(prev => prev.filter(t => t.id !== id));
      showToast('Transação excluída', 'success');
    }
  };

  return {
    session, userProfile, setUserProfile, signOut,
    isDarkMode, setIsDarkMode, profiles, setProfiles, programas, setProgramas, transacoes, setTransacoes,
    activeTab, setActiveTab, statsPorPrograma, dashboardStats, dashboardMetrics, vencimentosGlobais, deleteProgram, deleteTx, toast, setToast, showToast
  };
}