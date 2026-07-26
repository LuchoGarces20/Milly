import React, { useState } from 'react';
import { Zap, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { CATALOGO_PROGRAMAS } from '../../constants/milesConfig';

export default function SimulatorView({ milesData }) {
  const { dashboardStats } = milesData;
  
  const [simOriginId, setSimOriginId] = useState('');
  const [simDestId, setSimDestId] = useState('');
  const [simAmount, setSimAmount] = useState('');
  const [simBonus, setSimBonus] = useState('80');

  const originProg = dashboardStats.find(p => p.id === simOriginId);
  const destCatalog = CATALOGO_PROGRAMAS.find(p => p.id === simDestId);

  const simAmountNum = Number(simAmount) || 0;
  const simBonusNum = Number(simBonus) || 0;

  const originCpm = originProg ? originProg.cpm : 0;
  const originTotalCost = (simAmountNum / 1000) * originCpm;
  const destAmountNum = simAmountNum * (1 + simBonusNum / 100);
  const destCpm = destAmountNum > 0 ? (originTotalCost / (destAmountNum / 1000)) : 0;
  
  const destMarketCpm = destCatalog ? destCatalog.defaultMarketCpm : 0;
  const destMarketValue = (destAmountNum / 1000) * destMarketCpm;
  const simProfit = destMarketValue - originTotalCost;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-[#0B0F19] min-h-[80vh] rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <ArrowRightLeft className="w-96 h-96 text-white" />
        </div>
        
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-400" /> Simulador de Transferência
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Projete transferências bonificadas, dilution de CPM e lucro potencial em tempo real.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 relative z-10 flex-grow">
          {/* Coluna de Controles */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-5">
              <div>
                <label className="block text-xs font-bold text-violet-300 uppercase tracking-wider mb-2">Origem (Sua Carteira)</label>
                <select value={simOriginId} onChange={e => setSimOriginId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-400 transition-colors">
                  <option value="">Selecionar Origem...</option>
                  {dashboardStats.map(p => <option key={p.id} value={p.id}>{p.name} ({p.owner})</option>)}
                </select>
                {originProg && (
                  <p className="text-xs text-slate-400 mt-2 font-mono">CPM Origem: {formatCurrency(originCpm)} | Saldo: {formatNumber(originProg.balance)}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-violet-300 uppercase tracking-wider mb-2">Destino (Catálogo)</label>
                <select value={simDestId} onChange={e => setSimDestId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-400 transition-colors">
                  <option value="">Selecionar Destino...</option>
                  {CATALOGO_PROGRAMAS.map(p => <option key={p.id} value={p.id}>{p.name} (CPM Ref: {formatCurrency(p.defaultMarketCpm)})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-violet-300 uppercase tracking-wider mb-2">Pontos para Enviar</label>
                  <input type="number" placeholder="Ex: 50000" value={simAmount} onChange={e => setSimAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white outline-none focus:border-violet-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-violet-300 uppercase tracking-wider mb-2">Bônus (%)</label>
                  <input type="number" placeholder="Ex: 80" value={simBonus} onChange={e => setSimBonus(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white outline-none focus:border-violet-400 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna de Resultados (OLED/Premium Display) */}
          <div className="w-full lg:w-2/3 flex flex-col justify-center">
             {simOriginId && simDestId && simAmountNum > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-violet-900/40 to-black/60 p-8 rounded-3xl border border-violet-500/20 backdrop-blur-md">
                    <p className="text-sm font-bold text-violet-300/70 mb-2 uppercase tracking-wider">Custo Efetivo Origem</p>
                    <p className="text-4xl font-black font-mono text-white">{formatCurrency(originTotalCost)}</p>
                    <div className="mt-4 pt-4 border-t border-white/5">
                       <p className="text-xs text-slate-400">Total investido nestes {formatNumber(simAmountNum)} pontos baseados no seu CPM médio ponderado.</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-900/40 to-black/60 p-8 rounded-3xl border border-indigo-500/20 backdrop-blur-md">
                    <p className="text-sm font-bold text-indigo-300/70 mb-2 uppercase tracking-wider">Acúmulo no Destino</p>
                    <p className="text-4xl font-black font-mono text-amber-400">+{formatNumber(destAmountNum)}</p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                       <p className="text-xs text-slate-400">Novo CPM Diluído:</p>
                       <p className="text-sm font-bold font-mono text-white">{formatCurrency(destCpm)}</p>
                    </div>
                  </div>

                  <div className={`md:col-span-2 p-8 rounded-3xl border backdrop-blur-md flex items-center justify-between ${simProfit > 0 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                    <div>
                      <p className={`text-sm uppercase font-bold tracking-wider mb-2 flex items-center gap-2 ${simProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <TrendingUp className="w-5 h-5" /> Resultado Potencial da Operação
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">Considerando a venda imediata a mercado no balcão por {formatCurrency(destMarketCpm)} o milheiro.</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-5xl font-black font-mono tracking-tighter ${simProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {simProfit > 0 ? '+' : ''}{formatCurrency(simProfit)}
                      </p>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/10 rounded-3xl p-12 text-center text-slate-500">
                  <ArrowRightLeft className="w-16 h-16 opacity-20 mb-4" />
                  <p className="font-bold text-lg text-slate-300">Aguardando Parâmetros</p>
                  <p className="text-sm mt-2 max-w-sm">Selecione os programas de origem e destino, além da pontuação, para calcular a operação matemática.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}