import React, { useState } from 'react';
import { Orbit, Sun, Moon, ChevronRight, User, Users, UsersRound, Plus, X, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { CATALOGO_PROGRAMAS, INITIAL_PROG_FORM } from '../../constants/milesConfig';

export default function OnboardingView({ milesData, onComplete }) {
  const { isDarkMode, setIsDarkMode, setProfiles, programas, setProgramas, transacoes, setTransacoes } = milesData;
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null);
  const [names, setNames] = useState(['']);
  const [initialSetups, setInitialSetups] = useState([]);

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'single') setNames(['']);
    if (selectedMode === 'couple') setNames(['', '']);
    if (selectedMode === 'family') setNames(['', '', '']);
  };

  const handleNameChange = (index, value) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const submitStep1 = (e) => {
    e.preventDefault();
    const validNames = names.map(n => n.trim()).filter(n => n !== '');
    if (validNames.length > 0) {
      setProfiles(validNames);
      setStep(2);
    }
  };

  const toggleProgramSetup = (catalogItem) => {
    const exists = initialSetups.find(s => s.catalog.id === catalogItem.id);
    if (exists) {
      setInitialSetups(prev => prev.filter(s => s.catalog.id !== catalogItem.id));
    } else {
      setInitialSetups([...initialSetups, {
        id: Date.now() + Math.random(),
        catalog: catalogItem,
        owner: names[0] || '',
        balance: '',
        marketCpm: catalogItem.defaultMarketCpm || '',
        investment: '0'
      }]);
    }
  };

  const updateSetup = (id, field, value) => {
    setInitialSetups(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const submitStep2 = (e) => {
    e?.preventDefault();
    if (initialSetups.length > 0) {
      const newPrograms = [];
      const newTxs = [];
      const timestamp = Date.now();
      
      initialSetups.forEach((setup, i) => {
        const progId = `p_${timestamp}_${i}`;
        newPrograms.push({
          ...INITIAL_PROG_FORM,
          id: progId,
          name: setup.catalog.name,
          category: setup.catalog.category,
          renewsOnActivity: setup.catalog.renewsOnActivity,
          renewalDurationMonths: setup.catalog.renewalDurationMonths || 24,
          owner: setup.owner,
          marketCpm: Number(setup.marketCpm || 0)
        });
        
        if (Number(setup.balance) > 0) {
          const exp = new Date();
          exp.setFullYear(exp.getFullYear() + 2);
          newTxs.push({
            id: `tx_${timestamp}_${i}`,
            programId: progId,
            owner: setup.owner,
            type: 'Entrada',
            amount: Number(setup.balance),
            investment: Number(setup.investment || 0),
            date: new Date().toISOString().split('T')[0],
            expirationDate: exp.toISOString().split('T')[0],
            isAuto: false,
            isSnapshot: true, // <-- FLAG ADICIONADA: Diz pro sistema que este valor é a verdade absoluta
            description: 'Saldo Inicial (Marco Zero)'
          });
        }
      });
      setProgramas([...programas, ...newPrograms]);
      setTransacoes([...transacoes, ...newTxs]);
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-sans transition-colors duration-500">
      <div className="absolute top-6 right-6">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 rounded-full bg-white dark:bg-white/5 shadow-sm text-slate-600 dark:text-slate-300 hover:scale-110 transition-all border border-slate-200 dark:border-white/10">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      <div className="relative w-full max-w-2xl">
        <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl w-full rounded-[2.5rem] shadow-2xl p-8 border border-slate-200 dark:border-white/10 relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Orbit className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight">Bem-vindo à Milly</h1>
          
          {step === 1 && (
            <div className="animate-in slide-in-from-left-4 duration-300">
              {!mode ? (
                <>
                  <p className="text-center text-slate-500 dark:text-slate-400 mb-8 font-medium">Como você planeja usar a plataforma?</p>
                  <div className="space-y-3">
                    <button onClick={() => handleModeSelect('single')} className="w-full flex items-center gap-4 p-5 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all group text-left">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 rounded-2xl flex items-center justify-center transition-colors"><User className="w-6 h-6" /></div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Apenas para mim</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Gestão individual de milhas</p>
                      </div>
                    </button>
                    <button onClick={() => handleModeSelect('couple')} className="w-full flex items-center gap-4 p-5 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all group text-left">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 rounded-2xl flex items-center justify-center transition-colors"><Users className="w-6 h-6" /></div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Para um Casal</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Unir o patrimônio de duas pessoas</p>
                      </div>
                    </button>
                    <button onClick={() => handleModeSelect('family')} className="w-full flex items-center gap-4 p-5 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all group text-left">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 rounded-2xl flex items-center justify-center transition-colors"><UsersRound className="w-6 h-6" /></div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Família / Grupo</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Gerenciar 3 ou mais titulares</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={submitStep1} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <p className="text-center text-slate-500 dark:text-slate-400 mb-6 font-medium">
                    {mode === 'single' ? 'Qual é o seu nome?' : 'Quem são os titulares das contas?'}
                  </p>
                  
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto p-1">
                    {names.map((name, index) => (
                      <div key={index} className="relative">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Titular {index + 1}</label>
                        <div className="flex gap-3">
                          <input required type="text" placeholder={index === 0 ? "Ex: João" : "Nome"} value={name} onChange={e => handleNameChange(index, e.target.value)} className="flex-1 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-violet-500 transition-all dark:text-white font-medium" />
                          {mode === 'family' && names.length > 2 && (
                            <button type="button" onClick={() => setNames(names.filter((_, i) => i !== index))} className="px-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"><X className="w-5 h-5" /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {mode === 'family' && (
                    <button type="button" onClick={() => setNames([...names, ''])} className="w-full py-4 flex items-center justify-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 border border-dashed border-violet-200 dark:border-violet-500/30 rounded-2xl hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors">
                      <Plus className="w-4 h-4" /> Adicionar titular
                    </button>
                  )}
                  <div className="flex gap-3 mt-8">
                    <button type="button" onClick={() => setMode(null)} className="px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Voltar</button>
                    <button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all">
                      Avançar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <p className="text-center text-slate-500 dark:text-slate-400 mb-6 font-medium">Selecione os programas que você utiliza hoje:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {CATALOGO_PROGRAMAS.map(item => {
                  const isSelected = initialSetups.some(s => s.catalog.id === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleProgramSetup(item)}
                      className={`p-4 rounded-3xl border text-center transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden ${isSelected ? 'bg-violet-50 border-violet-500 dark:bg-violet-500/10 dark:border-violet-500' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/50'}`}
                    >
                      {isSelected && <div className="absolute top-2 right-2 text-violet-600"><CheckCircle2 className="w-4 h-4" /></div>}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? 'text-violet-900 dark:text-violet-100' : 'text-slate-600 dark:text-slate-300'}`}>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {initialSetups.length > 0 && (
                <div className="space-y-4 mb-6 max-h-[35vh] overflow-y-auto p-1">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Configuração Rápida (Opcional)</p>
                  {initialSetups.map((setup) => (
                    <div key={setup.id} className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-violet-200 dark:border-violet-500/20 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-violet-500" /> {setup.catalog.name}
                        </span>
                        {names.length > 1 && (
                           <select value={setup.owner} onChange={(e) => updateSetup(setup.id, 'owner', e.target.value)} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold outline-none text-violet-700 dark:text-violet-400 focus:border-violet-500">
                              {names.map(n => <option key={n} value={n}>{n}</option>)}
                           </select>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          {/* Label alterada para ficar mais clara e amigável */}
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Saldo Total Hoje</label>
                          <input type="number" placeholder="0" value={setup.balance} onChange={(e) => updateSetup(setup.id, 'balance', e.target.value)} className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold outline-none focus:border-violet-500 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Custo Total (R$)</label>
                          <input type="number" step="0.01" placeholder="0,00" value={setup.investment} onChange={(e) => updateSetup(setup.id, 'investment', e.target.value)} className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold outline-none focus:border-violet-500 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Cotação Ref. (R$)</label>
                          <input type="number" step="0.01" placeholder="0,00" value={setup.marketCpm} onChange={(e) => updateSetup(setup.id, 'marketCpm', e.target.value)} className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold outline-none focus:border-violet-500 dark:text-white text-violet-600 dark:text-violet-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-8 border-t border-slate-100 dark:border-white/10 pt-6">
                <button type="button" onClick={() => submitStep2()} className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold rounded-2xl text-sm hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  Pular configuração
                </button>
                <button type="button" onClick={submitStep2} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all">
                  Acessar Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}