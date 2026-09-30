import React, { useState, useEffect } from 'react';
import { X, Settings, Zap, BookOpen } from 'lucide-react';
import { CATEGORIAS, CATALOGO_PROGRAMAS, INITIAL_PROG_FORM } from '../../constants/milesConfig';

export default function ProgramModal({ isOpen, onClose, editingProg, milesData }) {
  const { profiles, programas, setProgramas, activeTab, showToast } = milesData;
  const [formProg, setFormProg] = useState(INITIAL_PROG_FORM);
  const [modalTab, setModalTab] = useState('geral');

  useEffect(() => {
    if (editingProg) {
      setFormProg({ ...INITIAL_PROG_FORM, ...editingProg });
    } else {
      const activeProf = profiles.find(p => p.id === activeTab || p.name === activeTab);
      const defaultOwner = activeProf ? activeProf.name : (profiles[0]?.name || '');
      setFormProg({ ...INITIAL_PROG_FORM, owner: defaultOwner });
    }
  }, [editingProg, activeTab, profiles]);

  const handleSaveProgram = (e) => {
    e.preventDefault();
    const trimmedName = formProg.name.trim();
    if (!trimmedName) return;

    const isDuplicate = programas.some(
      p => p.owner === formProg.owner && p.name.toLowerCase() === trimmedName.toLowerCase() && p.id !== editingProg?.id
    );
    if (isDuplicate) {
      alert('Este titular já possui um programa cadastrado com este nome.');
      return;
    }

    const payload = {
      ...formProg,
      name: trimmedName,
      marketCpm: Number(formProg.marketCpm || 0),
      clubTier: formProg.hasClub ? formProg.clubTier : '',
      clubCost: formProg.hasClub ? Number(formProg.clubCost || 0) : 0,
      clubBasePoints: formProg.hasClub ? Number(formProg.clubBasePoints || 0) : 0,
      clubBonusPoints: formProg.hasClub ? Number(formProg.clubBonusPoints || 0) : 0,
      clubBonusDuration: formProg.hasClub ? Number(formProg.clubBonusDuration || 0) : 0,
      renewalDurationMonths: Number(formProg.renewalDurationMonths || 24),
    };

    if (editingProg) {
      setProgramas(prev => prev.map(p => (p.id === editingProg.id ? { ...p, ...payload } : p)));
      showToast('Programa atualizado com sucesso!');
    } else {
      setProgramas([...programas, { ...payload, id: `p_${Date.now()}` }]);
      showToast('Programa adicionado à carteira!');
    }
    onClose();
    setModalTab('geral');
  };

  const selectedCatalog = CATALOGO_PROGRAMAS.find(c => c.name === formProg.name) || { tiers: [] };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{editingProg ? 'Editar Programa' : 'Novo Programa'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl mb-6">
            <button onClick={() => setModalTab('geral')} type="button" className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${modalTab === 'geral' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}><BookOpen className="w-3.5 h-3.5"/> Geral</button>
            <button onClick={() => setModalTab('clube')} type="button" className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${modalTab === 'clube' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}><Zap className="w-3.5 h-3.5"/> Clube</button>
            <button onClick={() => setModalTab('regras')} type="button" className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${modalTab === 'regras' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}><Settings className="w-3.5 h-3.5"/> Regras</button>
          </div>

          <form id="progForm" onSubmit={handleSaveProgram} className="space-y-5">
            {modalTab === 'geral' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                {!editingProg && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Catálogo Rápido</label>
                    <div className="flex flex-wrap gap-2">
                      {CATALOGO_PROGRAMAS.map(item => (
                        <button key={item.id} type="button" onClick={() => setFormProg(prev => ({...prev, name: item.name, category: item.category, renewsOnActivity: item.renewsOnActivity}))} className="bg-slate-50 dark:bg-white/5 hover:bg-violet-50 text-slate-600 dark:text-slate-300 hover:text-violet-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-colors dark:border-white/10">{item.name}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Titular</label>
                    <select required value={formProg.owner} onChange={e => setFormProg({...formProg, owner: e.target.value})} disabled={editingProg} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 text-sm dark:border-slate-700 dark:text-white">
                      <option value="" disabled>Selecione...</option>
                      {profiles.map(p => (<option key={p.id} value={p.name}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Categoria</label>
                    <select value={formProg.category} onChange={e => setFormProg({...formProg, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 text-sm dark:border-slate-700 dark:text-white">{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Programa</label>
                    <input required type="text" value={formProg.name} onChange={e => setFormProg({...formProg, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 text-sm dark:border-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cotação Venda (R$)</label>
                    <input type="number" step="0.01" value={formProg.marketCpm} onChange={e => setFormProg({...formProg, marketCpm: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono dark:border-slate-700 dark:text-white" />
                  </div>
                </div>
              </div>
            )}

            {modalTab === 'clube' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={formProg.hasClub} onChange={e => setFormProg({...formProg, hasClub: e.target.checked})} className="peer sr-only" />
                    <div className="w-10 h-5 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Possui Clube Ativo?</span>
                </label>

                {!formProg.hasClub && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Data do Último Cancelamento (Quarentena)</label>
                    <input type="date" value={formProg.lastCancellationDate} onChange={e => setFormProg({...formProg, lastCancellationDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-sm dark:border-slate-700 dark:text-white" />
                  </div>
                )}
                {formProg.hasClub && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Nível do Clube (Opcional)</label>
                      <select value={formProg.clubTier} onChange={e => setFormProg({...formProg, clubTier: e.target.value})} className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 dark:text-white"><option value="">Selecione...</option>{selectedCatalog.tiers?.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Adesão</label><input required type="date" value={formProg.clubStartDate} onChange={e => setFormProg({...formProg, clubStartDate: e.target.value})} className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 dark:text-white" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Cancelamento</label><input type="date" value={formProg.clubEndDate} onChange={e => setFormProg({...formProg, clubEndDate: e.target.value})} className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 dark:text-white" /></div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Custo/Mês (R$)</label>
                      <input required type="number" step="0.01" value={formProg.clubCost} onChange={e => setFormProg({...formProg, clubCost: e.target.value})} className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm font-mono dark:border-slate-700 dark:text-white" />
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Pts Base</label><input required type="number" value={formProg.clubBasePoints} onChange={e => setFormProg({...formProg, clubBasePoints: e.target.value})} className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm font-mono dark:border-slate-700 dark:text-white" /></div>
                  </div>
                )}
              </div>
            )}

            {modalTab === 'regras' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <label className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-500/10 rounded-2xl border border-violet-100 dark:border-violet-500/20">
                  <input type="checkbox" checked={formProg.renewsOnActivity} onChange={e => setFormProg({...formProg, renewsOnActivity: e.target.checked})} className="w-4 h-4 text-violet-600 rounded border-violet-300 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-violet-900 dark:text-violet-300 block text-sm">Movimentação renova validade?</span>
                    {formProg.renewsOnActivity && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-bold text-violet-900 dark:text-violet-300">Meses p/ renovação:</span>
                        <input type="number" min="1" value={formProg.renewalDurationMonths} onChange={e => setFormProg({...formProg, renewalDurationMonths: e.target.value})} className="bg-white dark:bg-slate-900 border border-violet-200 rounded-lg px-3 py-1.5 text-xs w-24 outline-none font-mono dark:border-violet-500/30 dark:text-white" />
                      </div>
                    )}
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${formProg.hasClub ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/50 opacity-60'}`}>
                  <input type="checkbox" disabled={!formProg.hasClub} checked={formProg.pointsNeverExpireWithClub} onChange={e => setFormProg({...formProg, pointsNeverExpireWithClub: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-emerald-300 mt-0.5 disabled:cursor-not-allowed" />
                  <div className="flex-1">
                    <span className={`font-bold block text-sm ${formProg.hasClub ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-500'}`}>Clube isenta vencimento?</span>
                    <span className="text-xs font-medium block mt-1 text-slate-400">Ex: Azul VIP. Pontos não expiram enquanto ativo.</span>
                  </div>
                </label>
              </div>
            )}
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-white/5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm">Cancelar</button>
          <button type="submit" form="progForm" className="flex-1 px-4 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-sm text-sm hover:bg-violet-500">{editingProg ? 'Salvar Alterações' : 'Salvar Programa'}</button>
        </div>
      </div>
    </div>
  );
}