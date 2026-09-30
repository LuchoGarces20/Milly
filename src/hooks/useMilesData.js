import { useState, useMemo, useEffect } from 'react';
import { formatDateBR } from '../utils/helpers';
import { getAutoClubTxs } from '../utils/clubEngine';

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

export function useMilesData() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 1. PERSISTÊNCIA LOCALSTORAGE
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('milly_profiles');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(p => (typeof p === 'string' ? { id: generateId(), name: p } : p));
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('Todos');

  const [programas, setProgramas] = useState(() => {
    const saved = localStorage.getItem('milly_programas');
    return saved ? JSON.parse(saved) : [];
  });

  const [transacoes, setTransacoes] = useState(() => {
    const saved = localStorage.getItem('milly_transacoes');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    localStorage.setItem('milly_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('milly_programas', JSON.stringify(programas));
  }, [programas]);

  useEffect(() => {
    localStorage.setItem('milly_transacoes', JSON.stringify(transacoes));
  }, [transacoes]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  // 2. CÁLCULO CONTÁBIL DE CPM (CUSTO MÉDIO PONDERADO)
  const statsPorPrograma = useMemo(() => {
    return programas.map(prog => {
      const manualTxs = transacoes.filter(t => t.programId === prog.id);
      const autoTxs = getAutoClubTxs(prog);
      const allTxs = [...manualTxs, ...autoTxs].sort((a, b) => new Date(a.date) - new Date(b.date));

      let balance = 0;
      let currentPoolCost = 0; // Custo do lote remanescente
      const entradas = [];
      let totalSaidas = 0;

      allTxs.forEach(t => {
        if (t.isSnapshot) {
          const diferenca = Number(t.amount) - balance;
          if (diferenca > 0) {
            balance = Number(t.amount);
            currentPoolCost += Number(t.investment || 0);
            if (t.expirationDate && !t.neverExpires) {
              entradas.push({ amount: diferenca, date: t.expirationDate });
            }
          } else if (diferenca < 0) {
            const saudaAmount = Math.abs(diferenca);
            const avgCpm = balance > 0 ? currentPoolCost / (balance / 1000) : 0;
            currentPoolCost = Math.max(0, currentPoolCost - (saudaAmount / 1000) * avgCpm);
            balance = Number(t.amount);
            totalSaidas += saudaAmount;
          }
        } else if (t.type === 'Entrada') {
          balance += Number(t.amount);
          currentPoolCost += Number(t.investment || 0);
          if (t.expirationDate && !t.neverExpires) {
            entradas.push({ amount: Number(t.amount), date: t.expirationDate });
          }
        } else {
          // Saída: Abate o custo médio proporcional do investimento ativo
          const saudaAmount = Number(t.amount);
          const avgCpm = balance > 0 ? currentPoolCost / (balance / 1000) : 0;
          currentPoolCost = Math.max(0, currentPoolCost - (saudaAmount / 1000) * avgCpm);
          balance = Math.max(0, balance - saudaAmount);
          totalSaidas += saudaAmount;
        }
      });

      const cpm = balance > 0 ? currentPoolCost / (balance / 1000) : 0;
      const marketCpm = Number(prog.marketCpm || 0);
      const marketValue = (balance / 1000) * marketCpm;
      const profit = marketValue - currentPoolCost;

      let expirationsAtivas = [];
      const isExemptByClub = prog.hasClub && prog.pointsNeverExpireWithClub && (!prog.clubEndDate || new Date(prog.clubEndDate) >= new Date());

      if (balance > 0 && !isExemptByClub) {
        if (prog.renewsOnActivity) {
          if (allTxs.length > 0) {
            const latestTx = allTxs[allTxs.length - 1];
            const expDate = new Date(latestTx.date);
            expDate.setMonth(expDate.getMonth() + Number(prog.renewalDurationMonths || 24));
            expirationsAtivas = [{ amount: balance, date: expDate.toISOString().split('T')[0], program: prog.name, owner: prog.owner, isActivityDeadline: true }];
          }
        } else {
          entradas.sort((a, b) => new Date(a.date) - new Date(b.date));
          let saidasPendentes = totalSaidas;
          entradas.forEach(lote => {
            if (saidasPendentes >= lote.amount) {
              saidasPendentes -= lote.amount;
            } else if (saidasPendentes > 0) {
              expirationsAtivas.push({ amount: lote.amount - saidasPendentes, date: lote.date, program: prog.name, owner: prog.owner, isActivityDeadline: false });
              saidasPendentes = 0;
            } else {
              expirationsAtivas.push({ amount: lote.amount, date: lote.date, program: prog.name, owner: prog.owner, isActivityDeadline: false });
            }
          });
        }
      }

      return { ...prog, balance, cpm, currentPoolCost, marketValue, profit, expirationsAtivas, allTxs, isExemptByClub };
    }).sort((a, b) => b.balance - a.balance);
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
    const clubCost = dashboardStats.filter(p => p.hasClub && (!p.clubEndDate || new Date(p.clubEndDate) >= new Date())).reduce((acc, curr) => acc + Number(curr.clubCost || 0), 0);

    return { totalInvestment, totalMarketValue, globalProfit, clubCost, weightedCpm };
  }, [dashboardStats]);

  const vencimentosGlobais = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dashboardStats.flatMap(prog => prog.expirationsAtivas)
      .map(v => {
        const dataVenc = new Date(v.date + 'T00:00:00');
        const diffTime = dataVenc - hoje;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...v, daysLeft, formattedDate: formatDateBR(v.date) };
      })
      .filter(v => v.daysLeft > 0 && v.daysLeft <= 365)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [dashboardStats]);

  const deleteProgram = (id) => {
    if (window.confirm('Excluir programa e todo o seu histórico de transações? Essa ação não pode ser desfeita.')) {
      setProgramas(prev => prev.filter(p => p.id !== id));
      setTransacoes(prev => prev.filter(t => t.programId !== id));
      showToast('Programa excluído', 'success');
      return true;
    }
    return false;
  };

  const deleteTx = (id) => {
    if (String(id).startsWith('auto_')) {
      alert('Esta é uma transação automática gerada pela sua assinatura de clube. Edite ou cancele o clube no cadastro do programa para alterar.');
      return;
    }
    if (window.confirm('Excluir esta transação? O saldo do programa será recalculado.')) {
      setTransacoes(prev => prev.filter(t => t.id !== id));
      showToast('Transação excluída', 'success');
    }
  };

  return {
    isDarkMode, setIsDarkMode,
    profiles, setProfiles,
    programas, setProgramas,
    transacoes, setTransacoes,
    activeTab, setActiveTab,
    statsPorPrograma,
    dashboardStats,
    dashboardMetrics,
    vencimentosGlobais,
    deleteProgram,
    deleteTx,
    toast, showToast
  };
}