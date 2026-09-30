import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { getInitialTxForm } from '../../constants/milesConfig';

export default function TransactionModal({ isOpen, onClose, editingTx, preselectedProgramId, isProgramView, milesData }) {
  const { profiles, programas, transacoes, setTransacoes, activeTab } = milesData;
  const [formTx, setFormTx] = useState(getInitialTxForm());

  useEffect(() => {
    if (editingTx) {
      const prog = programas.find(p => p.id === editingTx.programId);
      setFormTx({
        owner: prog ? prog.owner : '',
        programId: editingTx.programId,
        type: editingTx.type,
        amount: editingTx.amount,
        investment: editingTx.investment || '',
        expirationDate: editingTx.expirationDate || '',
        neverExpires: editingTx.type === 'Entrada' && !editingTx.expirationDate,
        date: editingTx.date
      });
    } else {
      const initial = getInitialTxForm();
      if (preselectedProgramId) {
        const prog = programas.find(p => p.id === preselectedProgramId);
        if (prog) {
          initial.owner = prog.owner;
          initial.programId = preselectedProgramId;
        }
      } else if (activeTab !== 'Todos') {
        const activeProf = profiles.find(p => p.id === activeTab || p.name === activeTab);
        initial.owner = activeProf ? activeProf.name : activeTab;
      } else if (profiles.length > 0) {
        initial.owner = profiles[0].name;
      }
      setFormTx(initial);
    }
  }, [editingTx, preselectedProgramId, activeTab, programas, profiles]);

  const handleTxDateChange = (e) => {
    const newDate = e.target.value;
    setFormTx(prev => {
      const update = { date: newDate };
      if (prev.type === 'Entrada' && !prev.neverExpires) {
        const d = new Date(newDate);
        if (!isNaN(d.getTime())) {
          d.setFullYear(d.getFullYear() + 2);
          update.expirationDate = d.toISOString().split('T')[0];
        }
      }
      return { ...prev, ...update };
    });
  };

  const handleSaveTx = (e) => {
    e.preventDefault();
    const payload = {
      ...formTx,
      amount: Number(formTx.amount),
      investment: formTx.type === 'Entrada' && formTx.investment ? Number(formTx.investment) : 0,
      expirationDate: formTx.type === 'Entrada' && !formTx.neverExpires ? formTx.expirationDate : null,
      isAuto: false
    };
    delete payload.neverExpires;

    if (editingTx) {
      setTransacoes(prev => prev.map(t => (t.id === editingTx.id ? { ...t, ...payload } : t)));
    } else {
      setTransacoes([...transacoes, { ...payload, id: Date.now() }]);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
            {editingTx ? 'Editar Transação' : 'Lançar Transação'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSaveTx} className="p-6 space-y-5 overflow-y-auto">
          {programas.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-50" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Adicione um programa primeiro.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Titular</label>
                  <select required value={formTx.owner} onChange={e => setFormTx({...formTx, owner: e.target.value, programId: ''})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-violet-500 dark:text-white disabled:opacity-50" disabled={isProgramView || editingTx}>
                    <option value="" disabled>Selecione...</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Programa</label>
                  <select required value={formTx.programId} onChange={e => setFormTx({...formTx, programId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-violet-500 disabled:opacity-50 dark:text-white" disabled={isProgramView || editingTx}>
                    <option value="" disabled>Selecione...</option>
                    {programas.filter(p => p.owner === formTx.owner).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Movimento</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                  <button type="button" onClick={() => setFormTx({...formTx, type: 'Entrada'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formTx.type === 'Entrada' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Entrada</button>
                  <button type="button" onClick={() => setFormTx({...formTx, type: 'Saida'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formTx.type === 'Saida' ? 'bg-white dark:bg-slate-600 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Saída</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Qtd. Pontos</label>
                  <input required type="number" min="1" placeholder="Ex: 10000" value={formTx.amount} onChange={e => setFormTx({...formTx, amount: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold font-mono outline-none focus:border-violet-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Custo (R$)</label>
                  <input type="number" step="0.01" min="0" placeholder="0,00" value={formTx.investment} onChange={e => setFormTx({...formTx, investment: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold font-mono outline-none focus:border-violet-500 disabled:opacity-50 dark:text-white" disabled={formTx.type === 'Saida'}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Data Ocorrência</label>
                  <input required type="date" value={formTx.date} onChange={handleTxDateChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-violet-500 dark:text-white" />
                </div>
                {formTx.type === 'Entrada' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-amber-700 dark:text-amber-500">Expira em</label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={formTx.neverExpires} onChange={e => setFormTx({...formTx, neverExpires: e.target.checked, expirationDate: ''})} className="w-3.5 h-3.5 text-amber-600 rounded border-amber-300 dark:border-amber-500/50 outline-none focus:ring-1 focus:ring-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mt-0.5">Não expira</span>
                      </label>
                    </div>
                    {!formTx.neverExpires ? (
                      <input type="date" required value={formTx.expirationDate} onChange={e => setFormTx({...formTx, expirationDate: e.target.value})} className="w-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-amber-500" />
                    ) : (
                      <div className="w-full h-[42px] bg-amber-50/50 dark:bg-amber-500/5 border border-dashed border-amber-200 dark:border-amber-500/30 text-amber-700/70 dark:text-amber-500/70 rounded-xl px-4 py-2 text-sm font-bold flex items-center justify-center">
                        Vitalício
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-white/5 mt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
            <button type="submit" disabled={programas.length === 0} className="flex-1 px-4 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md text-sm hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {editingTx ? 'Salvar Alterações' : 'Salvar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}