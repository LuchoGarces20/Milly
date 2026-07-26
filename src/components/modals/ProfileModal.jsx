import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, milesData }) {
  const { profiles, setProfiles, programas, setProgramas, transacoes, setTransacoes } = milesData;
  const [localProfiles, setLocalProfiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLocalProfiles(profiles.map(p => ({ id: Date.now() + Math.random(), name: p, originalName: p })));
    }
  }, [isOpen, profiles]);

  const handleNameChange = (id, newName) => {
    setLocalProfiles(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const addProfile = () => {
    setLocalProfiles([...localProfiles, { id: Date.now(), name: '', originalName: null }]);
  };

  const removeProfile = (id) => {
    if (localProfiles.length > 1) {
      setLocalProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const validProfiles = [];
    const nameChanges = {};

    localProfiles.forEach(p => {
      const trimmed = p.name.trim();
      if (trimmed) {
        validProfiles.push(trimmed);
        if (p.originalName && p.originalName !== trimmed) {
          nameChanges[p.originalName] = trimmed;
        }
      }
    });

    if (validProfiles.length === 0) {
      alert("É necessário ter pelo menos um titular.");
      return;
    }

    setProfiles(validProfiles);

    // Cascata de atualização: se o nome mudou, altera nos programas e transações
    if (Object.keys(nameChanges).length > 0) {
      setProgramas(prev => prev.map(prog => 
        nameChanges[prog.owner] ? { ...prog, owner: nameChanges[prog.owner] } : prog
      ));
      setTransacoes(prev => prev.map(tx => 
        nameChanges[tx.owner] ? { ...tx, owner: nameChanges[tx.owner] } : tx
      ));
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Gerenciar Titulares</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {localProfiles.map((p, idx) => (
              <div key={p.id} className="flex gap-2">
                <input
                  required
                  type="text"
                  placeholder={`Titular ${idx + 1}`}
                  value={p.name}
                  onChange={(e) => handleNameChange(p.id, e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-violet-500 dark:text-white"
                />
                {localProfiles.length > 1 && (
                  <button type="button" onClick={() => removeProfile(p.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addProfile} className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors border border-dashed border-violet-200 dark:border-violet-500/30">
            <Plus className="w-4 h-4" /> Adicionar Titular
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