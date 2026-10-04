import React, { useMemo } from 'react';
import { ArrowLeft, Pencil, Trash2, Plus, Zap, Activity, Ghost, ArrowUpRight, ArrowDownRight, Radar, CheckCircle2, Tag } from 'lucide-react';
import { formatCurrency, formatNumber, formatDateBR, getCategoryIcon } from '../../utils/helpers';
import { CATALOGO_PROGRAMAS } from '../../constants/milesConfig';

export default function ProgramView({ programId, milesData, onBack, onOpenProgModal, onOpenTxModal }) {
  const { statsPorPrograma, deleteProgram, deleteTx } = milesData;
  
  // Pegamos os dados já calculados do motor global (Otimização)
  const progDetails = statsPorPrograma.find(p => p.id === programId);

  if (!progDetails) {
    onBack();
    return null;
  }

  const handleDeleteProgClick = () => {
    if (deleteProgram(progDetails.id)) onBack();
  };

  // Agrupamento de Transações Estilo Extrato Bancário (Corrigido com Map)
  const groupedTxs = useMemo(() => {
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const groupsMap = new Map();

    progDetails.allTxs.forEach((tx) => {
      // Força a meia-noite local para evitar pular de mês no timezone
      const dateObj = new Date(tx.date + 'T00:00:00');
      const monthYear = capitalize(dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
      
      if (!groupsMap.has(monthYear)) {
        groupsMap.set(monthYear, { txs: [], totalIn: 0, totalOut: 0 });
      }
      
      const group = groupsMap.get(monthYear);
      // Inverte o array empurrando para o topo para ficar cronologicamente descendente no mês
      group.txs.unshift(tx);
      
      if (tx.type === 'Entrada') group.totalIn += Number(tx.amount);
      else group.totalOut += Number(tx.amount);
    });

    // Retorna as entradas invertidas para que o mês mais recente fique no topo
    return Array.from(groupsMap.entries()).reverse();
  }, [progDetails.allTxs]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const alertasPrograma = progDetails.expirationsAtivas
    .map(v => {
      const daysLeft = Math.ceil((new Date(v.date + 'T00:00:00') - hoje) / (1000 * 60 * 60 * 24));
      return { ...v, daysLeft, formattedDate: formatDateBR(v.date) };
    })
    .filter(v => v.daysLeft >= 0 && v.daysLeft <= 365) // Correção: >= 0
    .sort((a, b) => a.daysLeft - b.daysLeft);

  let quarantineDaysLeft = 0;
  let quarantineDate = null;
  const catalogInfo = CATALOGO_PROGRAMAS.find(c => c.name === progDetails.name);

  if (!progDetails.hasClub && progDetails.lastCancellationDate && catalogInfo?.quarantineMonths > 0) {
    const cancelDate = new Date(progDetails.lastCancellationDate + 'T00:00:00');
    cancelDate.setMonth(cancelDate.getMonth() + catalogInfo.quarantineMonths);
    const diff = cancelDate - hoje;
    if (diff > 0) {
      quarantineDaysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      quarantineDate = cancelDate.toISOString().split('T')[0];
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button onClick={onBack} className="group flex items-center gap-2 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 font-bold transition-colors w-fit">
          <div className="p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm transition-all"><ArrowLeft className="w-4 h-4" /></div>
          Voltar ao Dashboard
        </button>
        <div className="flex gap-3">
          <button onClick={() => onOpenProgModal(progDetails)} className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"><Pencil className="w-4 h-4" /> Editar</button>
          <button onClick={handleDeleteProgClick} className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold shadow-sm hover:bg-red-50 transition-all flex items-center gap-2"><Trash2 className="w-4 h-4" /> Excluir</button>
          <button onClick={() => onOpenTxModal(progDetails.id, null)} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Transação</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">Titular: {progDetails.owner}</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">{getCategoryIcon(progDetails.category)} {progDetails.category}</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{progDetails.name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="text-sm font-bold text-slate-500 mb-1">Saldo Atual</div>
          <div className="text-3xl font-black font-mono tracking-tight">{formatNumber(progDetails.balance)}</div>
        </div>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="text-sm font-bold text-slate-500 mb-1">Custo Base (CPM)</div>
          <div className="text-3xl font-black font-mono tracking-tight">{formatCurrency(progDetails.cpm)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            <Activity className="w-5 h-5 text-violet-500" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Extrato Analítico</h3>
          </div>
          <div className="p-6 overflow-y-auto max-h-[600px] space-y-6">
            {groupedTxs.length === 0 ? (
              <div className="text-center py-10"><Ghost className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 font-medium">Nenhuma movimentação registrada.</p></div>
            ) : (
              groupedTxs.map(([monthYear, data]) => (
                <div key={monthYear} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{monthYear}</h4>
                    <div className="flex gap-3 text-xs font-bold font-mono">
                      <span className="text-emerald-500">+{formatNumber(data.totalIn)}</span>
                      <span className="text-red-500">-{formatNumber(data.totalOut)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data.txs.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'Entrada' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-100 dark:bg-red-500/10 text-red-600'}`}>
                            {tx.type === 'Entrada' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-black text-lg font-mono text-slate-900 dark:text-white">{tx.type === 'Entrada' ? '+' : '-'}{formatNumber(tx.amount)}</p>
                              {tx.tag && tx.tag !== 'Outros' && (
                                <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"><Tag className="w-2.5 h-2.5"/> {tx.tag}</span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDateBR(tx.date)} {tx.description ? `— ${tx.description}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => onOpenTxModal(progDetails.id, tx)} className="p-2 text-slate-400 hover:text-blue-600" disabled={tx.isAuto}><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteTx(tx.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* VENCIMENTOS COM GRÁFICO INLINE CSS */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            <Radar className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Validade (Próx. 12m)</h3>
          </div>
          <div className="p-6 overflow-y-auto max-h-[600px] space-y-4">
            {alertasPrograma.map((venc, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900/50 shadow-sm relative overflow-hidden">
                
                {/* GRÁFICO INLINE MATEMÁTICO */}
                <div className="absolute top-0 left-0 h-1.5 transition-all duration-1000 ease-out bg-slate-200 dark:bg-slate-800 w-full">
                  <div 
                    className="h-full rounded-r-full" 
                    style={{ 
                      width: `${Math.min((venc.daysLeft / 365) * 100, 100)}%`,
                      backgroundColor: venc.daysLeft <= 30 ? '#ef4444' : venc.daysLeft <= 60 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>

                <div className="flex justify-between items-start mt-2 mb-3">
                  <div className="font-black text-slate-900 dark:text-white text-lg font-mono">
                    {formatNumber(venc.amount)} <span className="text-sm text-slate-400 font-sans">pts</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg border text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {venc.daysLeft} dias
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-50 dark:border-white/5 flex justify-between text-xs font-bold text-slate-400">
                  <span>Lote expira em:</span>
                  <span className="text-slate-700 dark:text-slate-300">{venc.formattedDate}</span>
                </div>
              </div>
            ))}
            {alertasPrograma.length === 0 && (
              <div className="text-center py-6"><CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" /><p className="text-slate-500 text-sm font-medium">Nenhum vencimento nos próximos 12 meses.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}