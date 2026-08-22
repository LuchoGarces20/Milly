import { useState, useMemo, useEffect } from 'react';
import { formatDateBR } from '../utils/helpers';
import { getAutoClubTxs } from '../utils/clubEngine';

export function useMilesData() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('Todos');
  const [programas, setProgramas] = useState([]);
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  const statsPorPrograma = useMemo(() => {
    return programas.map(prog => {
      const manualTxs = transacoes.filter(t => t.programId === prog.id);
      const autoTxs = getAutoClubTxs(prog);
      const allTxs = [...manualTxs, ...autoTxs].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      let balance = 0;
      let totalInvestment = 0;
      const entradas = [];
      let totalSaidas = 0;

      allTxs.forEach(t => {
        // MÁGICA DA OPÇÃO 2: Snapshot / Sobrescrita
        if (t.isSnapshot) {
          // Calcula quanto falta (ou sobra) para o saldo bater exatamente com o que o usuário declarou
          const diferenca = Number(t.amount) - balance;
          
          balance = Number(t.amount); // Força o saldo a ser a "verdade absoluta"
          totalInvestment += Number(t.investment || 0);

          if (diferenca > 0) {
            // Se faltou ponto (ex: declarou 50k, mas clubes do passado só deram 10k), joga a diferença no FIFO
            if (t.expirationDate && !t.neverExpires) {
              entradas.push({ amount: diferenca, date: t.expirationDate });
            }
          } else if (diferenca < 0) {
            // Se o clube gerou MAIS do que ele tem hoje (provavelmente ele gastou e não lançou), abate a diferença
            totalSaidas += Math.abs(diferenca);
          }
        } 
        // Fluxo Normal (Não-Snapshot)
        else if (t.type === 'Entrada') {
          balance += Number(t.amount);
          totalInvestment += Number(t.investment || 0);
          if (t.expirationDate && !t.neverExpires) {
            entradas.push({ amount: Number(t.amount), date: t.expirationDate });
          }
        } else {
          balance -= Number(t.amount);
          totalSaidas += Number(t.amount);
        }
      });

      const cpm = balance > 0 ? (totalInvestment / (balance / 1000)) : 0;
      const marketCpm = Number(prog.marketCpm || 0);
      const marketValue = (balance / 1000) * marketCpm;
      const profit = marketValue - (cpm * (balance / 1000));

      let expirationsAtivas = [];
      const isExemptByClub = prog.hasClub && prog.pointsNeverExpireWithClub && (!prog.clubEndDate || new Date(prog.clubEndDate) >= new Date());

      if (balance > 0 && !isExemptByClub) {
        if (prog.renewsOnActivity) {
          if (allTxs.length > 0) {
            const latestTx = allTxs[allTxs.length - 1];
            const expDate = new Date(latestTx.date);
            expDate.setMonth(expDate.getMonth() + Number(prog.renewalDurationMonths || 24));
            expirationsAtivas = [{
               amount: balance,
               date: expDate.toISOString().split('T')[0],
               program: prog.name,
               owner: prog.owner,
               isActivityDeadline: true
            }];
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

      return { ...prog, balance, cpm, marketValue, profit, expirationsAtivas, allTxs, isExemptByClub };
    }).sort((a, b) => b.balance - a.balance);
  }, [programas, transacoes]);

  const dashboardStats = useMemo(() => {
    return activeTab === 'Todos' ? statsPorPrograma : statsPorPrograma.filter(p => p.owner === activeTab);
  }, [activeTab, statsPorPrograma]);

  const dashboardMetrics = useMemo(() => {
    const totalInvestment = dashboardStats.reduce((acc, curr) => {
      const progInvest = curr.allTxs.reduce((sum, t) => sum + (t.type === 'Entrada' ? Number(t.investment || 0) : 0), 0);
      return acc + progInvest;
    }, 0);
    const totalBalanceThousands = dashboardStats.reduce((acc, curr) => acc + (curr.balance / 1000), 0);
    const weightedCpm = totalBalanceThousands > 0 ? (totalInvestment / totalBalanceThousands) : 0;
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
    deleteTx
  };
}