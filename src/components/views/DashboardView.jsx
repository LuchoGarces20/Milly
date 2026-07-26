import React, { useMemo } from 'react';
import { Plus, Activity, Wallet, PieChart, TrendingUp, TrendingDown, Ghost, Zap, ShieldCheck, ChevronRight, Radar, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import { formatCurrency, formatNumber, getCategoryIcon } from '../../utils/helpers';
import { CATALOGO_PROGRAMAS } from '../../constants/milesConfig';

export default function DashboardView({ milesData, onOpenProgModal, onOpenTxModal, onSelectProgram }) {
  const { profiles, activeTab, setActiveTab, dashboardStats, dashboardMetrics, vencimentosGlobais, transacoes } = milesData;

  // Lógica do Otimizador de Conta Família
  const familyPools = useMemo(() => {
    if (profiles.length <= 1) return [];
    const pools = [];
    
    CATALOGO_PROGRAMAS.filter(c => c.familyPoolAvailable).forEach(catalog => {
      const progs = dashboardStats.filter(p => p.name === catalog.name);
      // Se encontrou esse programa para mais de 1 titular e o saldo total é relevante
      if (progs.length > 1) {
        const total = progs.reduce((acc, p) => acc + p.balance, 0);
        if (total > 0) pools.push({ name: catalog.name, total, progs });
      }
    });
    return pools;
  }, [dashboardStats, profiles]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="inline-flex bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto max-w-full shadow-sm">
          {['Todos', ...profiles].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab ? 'bg-slate-100 dark:bg-white/10 text-violet-700 dark:text-violet-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'Todos' ? 'Visão Geral' : tab}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => onOpenProgModal(null)} className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Programa
          </button>
          <button onClick={() => onOpenTxModal(null)} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md shadow-violet-500/20 transition-all flex items-center gap-2">
            <Activity className="w-4 h-4" /> Lançar Transação
          </button>
        </div>
      </div>

      {/* --- NOVO: ALERTA DE CONTA FAMÍLIA --- */}
      {familyPools.length > 0 && activeTab === 'Todos' && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-center gap-6 justify-between animate-in slide-in-from-bottom-2">
           <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                 <Users className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="font-extrabold text-lg">Otimização de Família Disponível!</h4>
                 <p className="text-violet-100 text-sm mt-0.5">Detectamos programas na sua carteira que permitem unir pontos de diferentes titulares de graça.</p>
              </div>
           </div>
           <div className="flex gap-2 w-full md:w-auto">
             {familyPools.map(pool => (
                <div key={pool.name} className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-white text-sm">
                   <span className="font-bold">{pool.name}:</span> {formatNumber(pool.total)} pts
                </div>
             ))}
           </div>
        </div>
      )}
      {/* ------------------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden group flex flex-col justify-center">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-violet-500" /> Patrimônio Consolidado
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{formatCurrency(dashboardMetrics.totalMarketValue)}</div>
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">Valor de liquidação a mercado</div>
        </div>
        
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden group flex flex-col justify-center">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" /> Investimento Histórico
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{formatCurrency(dashboardMetrics.totalInvestment)}</div>
          {dashboardMetrics.clubCost > 0 && (
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              Inclui <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(dashboardMetrics.clubCost)}/mês</span> em clubes
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden group flex flex-col justify-center">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-500" /> CPM Médio da Carteira
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{formatCurrency(dashboardMetrics.weightedCpm)}</div>
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">Custo global por 1.000 pontos</div>
        </div>
        
        <div className={`backdrop-blur-xl border rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden group flex flex-col justify-center ${dashboardMetrics.globalProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'}`}>
          <div className={`text-sm font-bold mb-2 flex items-center gap-2 ${dashboardMetrics.globalProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {dashboardMetrics.globalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {dashboardMetrics.globalProfit >= 0 ? 'Resultado Potencial' : 'Prejuízo Potencial'}
          </div>
          <div className={`text-3xl font-black font-mono tracking-tight ${dashboardMetrics.globalProfit >= 0 ? 'text-emerald-900 dark:text-emerald-300' : 'text-red-900 dark:text-red-300'}`}>
            {dashboardMetrics.globalProfit > 0 ? '+' : ''}{formatCurrency(dashboardMetrics.globalProfit)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {dashboardStats.length === 0 && (
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/10 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Ghost className="w-10 h-10 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Seu radar está vazio</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Adicione contas de milhas ou programas de fidelidade para começar o rastreamento.</p>
              <button onClick={() => onOpenProgModal(null)} className="px-6 py-3 bg-violet-600/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 hover:bg-violet-600/20 dark:hover:bg-violet-500/30 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 mx-auto">
                <Plus className="w-4 h-4" /> Cadastrar Programa
              </button>
            </div>
          )}

          {dashboardStats.length > 0 && (
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="px-6 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]"></div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight">
                    {activeTab === 'Todos' ? 'Todas as Contas' : `Contas de ${activeTab}`}
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white dark:bg-transparent text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <tr className="border-b border-slate-100 dark:border-white/5">
                      {activeTab === 'Todos' && <th className="px-6 py-4">Titular</th>}
                      <th className="px-6 py-4">Programa</th>
                      <th className="px-6 py-4 text-center">Clube/Regra</th>
                      <th className="px-6 py-4 text-right">Saldo</th>
                      <th className="px-6 py-4 text-right">CPM (R$)</th>
                      <th className="px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {dashboardStats.map((prog) => (
                      <tr key={prog.id} onClick={() => onSelectProgram(prog.id)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        {activeTab === 'Todos' && (
                          <td className="px-6 py-5">
                            <span className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                              {prog.owner}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-5">
                          <div className="font-extrabold text-slate-900 dark:text-white text-base">{prog.name}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                            {getCategoryIcon(prog.category)} {prog.category}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {prog.hasClub && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                <Zap className="w-3 h-3" /> Clube
                              </span>
                            )}
                            {prog.isExemptByClub && (
                               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20" title="Validade blindada pelo clube">
                                 <ShieldCheck className="w-3 h-3" /> Blindado
                               </span>
                            )}
                            {!prog.hasClub && !prog.isExemptByClub && <span className="text-slate-300 dark:text-slate-600 font-bold">-</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="font-black text-slate-900 dark:text-white text-lg font-mono tracking-tight">{formatNumber(prog.balance)}</div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="font-bold text-slate-700 dark:text-slate-300 text-base font-mono tracking-tight">{formatCurrency(prog.cpm)}</div>
                          {prog.profit !== 0 && (
                             <div className={`text-[10px] font-bold uppercase mt-1 tracking-wider ${prog.profit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                               {prog.profit > 0 ? 'Lucro' : 'Prejuízo'}
                             </div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-violet-600 dark:group-hover:text-violet-400 mx-auto transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Radar className="w-5 h-5 text-amber-500" />
              Vencimentos <span className="text-xs font-medium text-slate-400 dark:text-slate-500">(Próx. 12m)</span>
            </h3>
          </div>
          
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {vencimentosGlobais.map((venc, idx) => (
              <div key={idx} className="group p-5 rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm hover:border-violet-300 dark:hover:border-violet-500/50 transition-all relative overflow-hidden">
                {venc.daysLeft <= 30 && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>}
                {venc.daysLeft > 30 && venc.daysLeft <= 60 && <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-black text-slate-900 dark:text-white text-lg font-mono">{formatNumber(venc.amount)} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans uppercase tracking-wider">pts</span></div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      {venc.program} <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span> {venc.owner}
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                    venc.daysLeft <= 30 ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' : 
                    venc.daysLeft <= 60 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 
                    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  }`}>
                    {venc.daysLeft} dias
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                   {venc.isActivityDeadline ? (
                       <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                         <AlertTriangle className="w-3.5 h-3.5" /> Movimente p/ renovar
                       </span>
                    ) : (
                       <span>Data limite:</span>
                    )}
                   <span className="text-slate-700 dark:text-slate-300">{venc.formattedDate}</span>
                </div>
              </div>
            ))}
            {vencimentosGlobais.length === 0 && transacoes.length > 0 && (
               <div className="text-center py-10 px-4">
                 <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-200 dark:border-emerald-500/20">
                   <CheckCircle2 className="w-7 h-7" />
                 </div>
                 <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">Céu de brigadeiro!</p>
                 <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Nenhum perigo de expiração em menos de 1 ano.</p>
               </div>
            )}
            
            {transacoes.length === 0 && (
              <div className="text-center py-10 px-4 text-slate-400 dark:text-slate-600 text-sm font-medium border border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
                Lance transações para rastrear validade.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}