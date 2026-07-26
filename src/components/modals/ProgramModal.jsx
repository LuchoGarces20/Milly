import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORIAS, CATALOGO_PROGRAMAS, INITIAL_PROG_FORM } from '../../constants/milesConfig';

export default function ProgramModal({ isOpen, onClose, editingProg, milesData }) {
  const { profiles, programas, setProgramas, activeTab } = milesData;
  const [formProg, setFormProg] = useState(INITIAL_PROG_FORM);

  useEffect(() => {
    if (editingProg) {
      setFormProg({
        owner: editingProg.owner,
        name: editingProg.name,
        category: editingProg.category,
        marketCpm: editingProg.marketCpm || '',
        hasClub: editingProg.hasClub,
        clubTier: editingProg.clubTier || '',
        lastCancellationDate: editingProg.lastCancellationDate || '',
        clubStartDate: editingProg.clubStartDate || '',
        clubEndDate: editingProg.clubEndDate || '',
        billingFrequency: editingProg.billingFrequency || 'Mensal',
        clubCost: editingProg.clubCost || '',
        clubBasePoints: editingProg.clubBasePoints || '',
        clubBonusPoints: editingProg.clubBonusPoints || '',
        clubBonusDuration: editingProg.clubBonusDuration || '',
        renewsOnActivity: editingProg.renewsOnActivity,
        renewalDurationMonths: editingProg.renewalDurationMonths || 24,
        pointsNeverExpireWithClub: editingProg.pointsNeverExpireWithClub || false
      });
    } else {
      const defaultOwner = activeTab !== 'Todos' ? activeTab : (profiles[0] || '');
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
      lastCancellationDate: !formProg.hasClub ? formProg.lastCancellationDate : '',
      clubCost: formProg.hasClub ? Number(formProg.clubCost || 0) : 0,
      clubBasePoints: formProg.hasClub ? Number(formProg.clubBasePoints || 0) : 0,
      clubBonusPoints: formProg.hasClub ? Number(formProg.clubBonusPoints || 0) : 0,
      clubBonusDuration: formProg.hasClub ? Number(formProg.clubBonusDuration || 0) : 0,
      clubStartDate: formProg.hasClub ? formProg.clubStartDate : '',
      clubEndDate: formProg.hasClub ? formProg.clubEndDate : '',
      billingFrequency: formProg.hasClub ? formProg.billingFrequency : 'Mensal',
      renewalDurationMonths: Number(formProg.renewalDurationMonths || 24),
      pointsNeverExpireWithClub: formProg.pointsNeverExpireWithClub
    };

    if (editingProg) {
      setProgramas(prev => prev.map(p => p.id === editingProg.id ? { ...p, ...payload } : p));
    } else {
      setProgramas([...programas, { ...payload, id: `p_${Date.now()}` }]);
    }
    onClose();
  };

  const selectedCatalog = CATALOGO_PROGRAMAS.find(c => c.name === formProg.name) || { tiers: [] };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
            {editingProg ? 'Editar Programa' : 'Novo Programa'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-6">
          {!editingProg && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-wider">Catálogo Rápido</label>
              <div className="flex flex-wrap gap-2">
                {CATALOGO_PROGRAMAS.map(item => (
                  <button key={item.id} type="button" onClick={() => setFormProg(prev => ({...prev, name: item.name, category: item.category, renewsOnActivity: item.renewsOnActivity, renewalDurationMonths: item.renewalDurationMonths || 24}))}
                    className="bg-slate-50 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/20 text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-transparent transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form id="progForm" onSubmit={handleSaveProgram} className={`space-y-5 ${!editingProg ? 'border-t border-slate-100 dark:border-white/5 pt-6' : ''}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Titular</label>
                <select required value={formProg.owner} onChange={e => setFormProg({...formProg, owner: e.target.value})} disabled={editingProg} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-violet-500 dark:text-white disabled:opacity-50">
                  <option value="" disabled>Selecione...</option>
                  {profiles.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Categoria</label>
                <select value={formProg.category} onChange={e => setFormProg({...formProg, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-violet-500 dark:text-white">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Programa</label>
                <input required type="text" value={formProg.name} onChange={e => setFormProg({...formProg, name: e.target.value.trimStart()})} placeholder="Ex: Livelo..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-violet-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cotação Venda (R$)</label>
                <input type="number" step="0.01" min="0" placeholder="Ex: 15.00" value={formProg.marketCpm} onChange={e => setFormProg({...formProg, marketCpm: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium font-mono outline-none focus:border-violet-500 dark:text-white" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={formProg.hasClub} onChange={e => setFormProg({...formProg, hasClub: e.target.checked})} className="peer sr-only" />
                  <div className="w-10 h-5 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Possui Clube Ativo?</span>
              </label>
              
              {!formProg.hasClub && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Data do Último Cancelamento (Quarentena)</label>
                  <input type="date" value={formProg.lastCancellationDate} onChange={e => setFormProg({...formProg, lastCancellationDate: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 dark:text-white" />
                  <p className="text-[10px] text-slate-400 mt-1">Deixe em branco se nunca assinou clube neste programa.</p>
                </div>
              )}

              {formProg.hasClub && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Nível do Clube (Opcional)</label>
                    <select value={formProg.clubTier} onChange={e => setFormProg({...formProg, clubTier: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 dark:text-white">
                      <option value="">Selecione o plano...</option>
                      {selectedCatalog.tiers?.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Data de Adesão</label>
                    <input required type="date" value={formProg.clubStartDate} onChange={e => setFormProg({...formProg, clubStartDate: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Cancelamento (Opcional)</label>
                    <input type="date" value={formProg.clubEndDate} onChange={e => setFormProg({...formProg, clubEndDate: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Modalidade</label>
                    <select required value={formProg.billingFrequency} onChange={e => setFormProg({...formProg, billingFrequency: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 dark:text-white">
                      <option value="Mensal">Mensal</option>
                      <option value="Anual à Vista">Anual à Vista</option>
                      <option value="Anual Parcelado">Anual Parcelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Custo/Mês (R$)</label>
                    <input required type="number" step="0.01" min="0" placeholder="0,00" value={formProg.clubCost} onChange={e => setFormProg({...formProg, clubCost: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-violet-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Pts Base/mês</label>
                    <input required type="number" min="0" placeholder="Ex: 1000" value={formProg.clubBasePoints} onChange={e => setFormProg({...formProg, clubBasePoints: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-violet-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Pts Bônus/mês</label>
                    <input type="number" min="0" placeholder="Ex: 500" value={formProg.clubBonusPoints} onChange={e => setFormProg({...formProg, clubBonusPoints: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-violet-500 dark:text-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Duração do Bônus (Meses)</label>
                    <input type="number" min="0" placeholder="Ex: 6" value={formProg.clubBonusDuration} onChange={e => setFormProg({...formProg, clubBonusDuration: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 dark:text-white disabled:opacity-50" disabled={!formProg.clubBonusPoints || formProg.clubBonusPoints === '0'}/>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-500/10 rounded-2xl border border-violet-100 dark:border-violet-500/20 transition-colors">
                <input type="checkbox" checked={formProg.renewsOnActivity} onChange={e => setFormProg({...formProg, renewsOnActivity: e.target.checked})} className="w-4 h-4 text-violet-600 rounded border-violet-300 mt-0.5 cursor-pointer" />
                <div className="flex-1">
                  <span className="font-bold text-violet-900 dark:text-violet-300 block text-sm cursor-pointer">Movimentação renova validade?</span>
                  <span className="text-xs text-violet-700/80 dark:text-violet-400/80 font-medium block mt-1 cursor-pointer">Ao usar milhas, todo o saldo existente é prorrogado.</span>
                  
                  {formProg.renewsOnActivity && (
                    <div className="mt-3 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                      <span className="text-xs font-bold text-violet-900 dark:text-violet-300">Meses p/ renovação:</span>
                      <input type="number" min="1" value={formProg.renewalDurationMonths} onChange={e => setFormProg({...formProg, renewalDurationMonths: e.target.value})} className="bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-500/30 text-violet-900 dark:text-violet-100 rounded-lg px-3 py-1.5 text-xs w-24 outline-none font-mono focus:border-violet-500 transition-colors" />
                    </div>
                  )}
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${formProg.hasClub ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-60'}`}>
                <input type="checkbox" disabled={!formProg.hasClub} checked={formProg.pointsNeverExpireWithClub} onChange={e => setFormProg({...formProg, pointsNeverExpireWithClub: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-emerald-300 mt-0.5 cursor-pointer disabled:cursor-not-allowed" />
                <div className="flex-1">
                  <span className={`font-bold block text-sm ${formProg.hasClub ? 'text-emerald-900 dark:text-emerald-300 cursor-pointer' : 'text-slate-500'}`}>Clube isenta vencimento?</span>
                  <span className={`text-xs font-medium block mt-1 ${formProg.hasClub ? 'text-emerald-700/80 dark:text-emerald-400/80 cursor-pointer' : 'text-slate-400'}`}>Ex: Azul VIP. Pontos não expiram enquanto clube estiver ativo.</span>
                </div>
              </label>
            </div>
          </form>
        </div>
        
        <div className="p-5 border-t border-slate-100 dark:border-white/5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
          <button type="submit" form="progForm" className="flex-1 px-4 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md text-sm hover:bg-violet-500 transition-colors">
            {editingProg ? 'Salvar Alterações' : 'Salvar Programa'}
          </button>
        </div>
      </div>
    </div>
  );
}