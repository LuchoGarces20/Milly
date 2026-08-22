import React from 'react';
import { ArrowLeft, Pencil, Trash2, Plus, TrendingUp, Zap, ShieldCheck, Orbit, Activity, Ghost, ArrowUpRight, ArrowDownRight, Radar, AlertTriangle, CheckCircle2, Clock, Medal, Target } from 'lucide-react';
import { formatCurrency, formatNumber, formatDateBR, getCategoryIcon } from '../../utils/helpers';
import { CATALOGO_PROGRAMAS } from '../../constants/milesConfig';

export default function ProgramView({ programId, milesData, onBack, onOpenProgModal, onOpenTxModal }) {
  const { statsPorPrograma, profiles, deleteProgram, deleteTx } = milesData;

  const progDetails = statsPorPrograma.find(p => p.id === programId);
  if (!progDetails) {
    onBack();
    return null;
  }

  const progTxs = [...progDetails.allTxs].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const alertasPrograma = progDetails.expirationsAtivas
    .map(v => {
      const dataVenc = new Date(v.date + 'T00:00:00');
      const diffTime = dataVenc - hoje;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...v, daysLeft, formattedDate: formatDateBR(v.date) };
    })
    .filter(v => v.daysLeft > 0 && v.daysLeft <= 365)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const handleDeleteProgClick = () => {
    if(deleteProgram(progDetails.id)) {
      onBack();
    }
  };

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
          <div className="p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:border-violet-300 dark:group-hover:border-violet-500/50 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Voltar ao Dashboard
        </button>
        <div className="flex gap-3">
          <button onClick={() => onOpenProgModal(progDetails)} className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Editar
          </button>
          <button onClick={handleDeleteProgClick} className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold shadow-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
          <button onClick={() => onOpenTxModal(progDetails.id, null)} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Transação
          </button>
        </div>
      </div>

      {quarantineDaysLeft > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 rounded-3xl flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-500" />
              <div>
                 <p className="text-amber-900 dark:text-amber-300 font-bold text-sm">Quarentena Ativa</p>
                 <p className="text-amber-700 dark:text-amber-400/80 text-xs font-medium">Você será elegível a bônus de adesão novamente em {formatDateBR(quarantineDate)}.</p>
              </div>
           </div>
           <div className="px-3 py-1.5 bg-white dark:bg-amber-900/40 rounded-xl border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black">
              Faltam {quarantineDaysLeft} dias
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${progDetails.owner === profiles.user1 ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20'}`}>
                Titular: {progDetails.owner}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                {getCategoryIcon(progDetails.category)} {progDetails.category}
              </span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{progDetails.name}</h2>
         </div>
         
         <div className="flex flex-wrap gap-4 relative z-10">
           {progDetails.hasClub && progDetails.clubTier && (
             <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-4 py-3 rounded-2xl flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                 <Medal className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-violet-700 dark:text-violet-500 tracking-wider">Nível do Clube</p>
                 <p className="text-sm font-bold text-violet-900 dark:text-violet-300">{progDetails.clubTier}</p>
               </div>
             </div>
           )}
           {progDetails.marketCpm > 0 && (
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-4 py-3 rounded-2xl flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                   <TrendingUp className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-500 tracking-wider">Valor no Balcão</p>
                   <p className="text-sm font-bold text-blue-900 dark:text-blue-300 font-mono">{formatCurrency(progDetails.marketCpm)}<span className="text-[10px]">/mil</span></p>
                 </div>
              </div>
           )}
           {progDetails.hasClub && (
             <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 rounded-2xl flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <Zap className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-500 tracking-wider">Clube Inteligente</p>
                 <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 font-mono">{formatCurrency(progDetails.clubCost)}/mês</p>
               </div>
             </div>
           )}
           {progDetails.isExemptByClub && (
             <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 rounded-2xl flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <ShieldCheck className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-500 tracking-wider">Status Validade</p>
                 <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Isento pelo Clube</p>
               </div>
             </div>
           )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">Saldo Atual</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{formatNumber(progDetails.balance)}</div>
        </div>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">Custo Base (CPM)</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{formatCurrency(progDetails.cpm)}</div>
        </div>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">Valor Total de Venda</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{formatCurrency(progDetails.marketValue)}</div>
        </div>
        <div className={`border rounded-3xl p-6 shadow-sm ${progDetails.profit >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'}`}>
          <div className={`text-sm font-bold mb-1 flex items-center gap-2 ${progDetails.profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
             {progDetails.profit >= 0 ? 'Lucro Potencial' : 'Prejuízo Potencial'}
          </div>
          <div className={`text-3xl font-black font-mono tracking-tight ${progDetails.profit >= 0 ? 'text-emerald-900 dark:text-emerald-300' : 'text-red-900 dark:text-red-300'}`}>
             {progDetails.profit > 0 ? '+' : ''}{formatCurrency(progDetails.profit)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            <Activity className="w-5 h-5 text-violet-500" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Extrato de Transações</h3>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[500px] space-y-3">
            {progTxs.length === 0 ? (
              <div className="text-center py-10">
                <Ghost className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma movimentação registrada.</p>
              </div>
            ) : (
              progTxs.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                      tx.type === 'Entrada' 
                         ? (tx.isSnapshot ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                          : tx.isAuto ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' 
                          : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400')
                        : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {tx.type === 'Entrada' ? (tx.isSnapshot ? <Target className="w-5 h-5"/> : tx.isAuto ? <Zap className="w-5 h-5"/> : <ArrowUpRight className="w-6 h-6" />) : <ArrowDownRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 dark:text-white text-lg font-mono">
                          {tx.type === 'Entrada' ? '+' : '-'}{formatNumber(tx.amount)}
                        </p>
                        {tx.isAuto && <span className="text-[10px] uppercase tracking-wider font-bold bg-violet-200 dark:bg-violet-500/30 text-violet-800 dark:text-violet-300 px-2 py-0.5 rounded-full">Automático</span>}
                        {tx.isSnapshot && <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">Marco Zero</span>}
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDateBR(tx.date)} {tx.description ? ` - ${tx.description}` : ''} {tx.type === 'Entrada' && tx.investment > 0 && `| Pago: ${formatCurrency(tx.investment)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onOpenTxModal(progDetails.id, tx)} className={`p-2 rounded-xl transition-colors ${tx.isAuto ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`} title={tx.isAuto ? "Transação Automática" : "Editar transação"} disabled={tx.isAuto}>
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => deleteTx(tx.id)} className={`p-2 rounded-xl transition-colors ${tx.isAuto ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'}`} title={tx.isAuto ? "Edite o clube para remover" : "Deletar transação"}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            <Radar className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Validade (Próx. 12 meses)</h3>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[500px] space-y-4">
            {progDetails.isExemptByClub && (
              <div className="text-center py-6 px-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-emerald-800 dark:text-emerald-300 text-sm font-bold">Validade Blindada</p>
                <p className="text-emerald-600/80 dark:text-emerald-400/80 text-xs mt-1 font-medium">Seu clube garante que os pontos não expiram.</p>
              </div>
            )}
            
            {!progDetails.isExemptByClub && alertasPrograma.map((venc, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900/50 shadow-sm relative overflow-hidden">
                {venc.daysLeft <= 30 && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
                {venc.daysLeft > 30 && venc.daysLeft <= 60 && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
                
                <div className="flex justify-between items-start mb-3">
                  <div className="font-black text-slate-900 dark:text-white text-lg font-mono">
                    {formatNumber(venc.amount)} <span className="text-sm text-slate-400 dark:text-slate-500 font-sans">pts</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
                    venc.daysLeft <= 30 ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' : 
                    venc.daysLeft <= 60 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 
                    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  }`}>
                    {venc.daysLeft} dias
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-50 dark:border-white/5 flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500">
                   {venc.isActivityDeadline ? (
                     <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                       <AlertTriangle className="w-3.5 h-3.5" /> Movimente para renovar até
                     </span>
                   ) : (
                     <span>Lote expira em:</span>
                   )}
                   <span className="text-slate-700 dark:text-slate-300">{venc.formattedDate}</span>
                </div>
              </div>
            ))}

            {!progDetails.isExemptByClub && alertasPrograma.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhum vencimento nos próximos 12 meses.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}