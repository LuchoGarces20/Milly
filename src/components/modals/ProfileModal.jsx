import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Copy, CheckCircle2 } from 'lucide-react';

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

export default function ProfileModal({ isOpen, onClose, milesData }) {
  const { profiles, setProfiles, setProgramas, setTransacoes, showToast, userProfile } = milesData;
  const [localProfiles, setLocalProfiles] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const mapped = profiles.map(p =>
        typeof p === 'string'
          ? { id: generateId(), name: p, originalName: p }
          : { ...p, originalName: p.name }
      );
      setLocalProfiles(mapped);
    }
  }, [isOpen, profiles]);

  const handleNameChange = (id, newName) => {
    setLocalProfiles(prev => prev.map(p => (p.id === id ? { ...p, name: newName } : p)));
  };

  const addProfile = () =>
    setLocalProfiles([...localProfiles, { id: generateId(), name: '', originalName: null }]);

  const removeProfile = (id) => {
    if (localProfiles.length > 1) setLocalProfiles(prev => prev.filter(p => p.id !== id));
  };

  const handleCopyCode = () => {
    if (userProfile?.families?.invite_code) {
      navigator.clipboard.writeText(userProfile.families.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Código copiado com sucesso!');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const validProfiles = [];
    const nameChanges = {};

    localProfiles.forEach(p => {
      const trimmed = p.name.trim();
      if (trimmed) {
        validProfiles.push({ id: p.id, name: trimmed });
        if (p.originalName && p.originalName !== trimmed) {
          nameChanges[p.originalName] = trimmed;
        }
      }
    });

    if (validProfiles.length === 0) {
      alert('É necessário ter pelo menos um titular.');
      return;
    }

    setProfiles(validProfiles);

    if (Object.keys(nameChanges).length > 0) {
      setProgramas(prev => prev.map(prog => (nameChanges[prog.owner] ? { ...prog, owner: nameChanges[prog.owner] } : prog)));
      setTransacoes(prev => prev.map(tx => (nameChanges[tx.owner] ? { ...tx, owner: nameChanges[tx.owner] } : tx)));
    }

    showToast('Perfis atualizados com sucesso!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 dark:border-white/5">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Gerenciar Titulares</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* CARTÃO DO CÓDIGO DE CONVITE */}
        {userProfile?.families?.invite_code && (
          <div className="mx-6 mt-6 p-4 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1">Código de Convite ({userProfile.families.name})</p>
              <p className="text-xl font-black text-violet-900 dark:text-violet-100 tracking-widest uppercase">{userProfile.families.invite_code}</p>
            </div>
            <button 
              type="button" 
              onClick={handleCopyCode} 
              title="Copiar código"
              className="p-3 bg-white dark:bg-[#0B0F19] text-violet-600 dark:text-violet-400 rounded-xl shadow-sm hover:scale-105 transition-all"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {localProfiles.map((p, idx) => (
              <div key={p.id} className="flex gap-2">
                <input required type="text" placeholder={`Titular ${idx + 1}`} value={p.name} onChange={(e) => handleNameChange(p.id, e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-violet-500 dark:text-white" />
                {localProfiles.length > 1 && (
                  <button type="button" onClick={() => removeProfile(p.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addProfile} className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors border border-dashed border-violet-200 dark:border-violet-500/30">
            <Plus className="w-4 h-4" /> Adicionar Titular Manual
          </button>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-sm hover:bg-violet-500 transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}