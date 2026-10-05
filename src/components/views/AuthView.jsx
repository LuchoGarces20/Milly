import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Orbit, Mail, Lock, User, Users, Key, ArrowRight, ChevronRight } from 'lucide-react';

export default function AuthView({ onAuthComplete }) {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState('auth'); // 'auth' ou 'family_setup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Family states
  const [setupMode, setSetupMode] = useState(null); // 'create' ou 'join'
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Verifica se o utilizador já tem um perfil configurado
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        if (profile && profile.family_id) {
          onAuthComplete(user, profile);
        } else {
          setStep('family_setup');
        }
      } else {
        const { data: authData, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setStep('family_setup');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFamilySetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let finalFamilyId = null;

      if (setupMode === 'create') {
        const { data: newFamily, error: famError } = await supabase
          .from('families')
          .insert([{ name: familyName }])
          .select()
          .single();
        if (famError) throw famError;
        finalFamilyId = newFamily.id;
      } else if (setupMode === 'join') {
        const { data: existingFamily, error: findError } = await supabase
          .from('families')
          .select('id')
          .eq('invite_code', inviteCode)
          .single();
        if (findError || !existingFamily) throw new Error('Código de convite inválido.');
        finalFamilyId = existingFamily.id;
      }

      // Cria ou atualiza o perfil do utilizador
      const profileData = { id: user.id, name: name, family_id: finalFamilyId };
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .upsert([profileData])
        .select()
        .single();
      
      if (profError) throw profError;
      
      onAuthComplete(user, profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center p-4 transition-colors duration-500">
      <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-200 dark:border-white/10 relative z-10">
        
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Orbit className="w-8 h-8 text-white" />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        {step === 'auth' && (
          <form onSubmit={handleAuth} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-2xl font-extrabold text-center mb-6 text-slate-900 dark:text-white">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                <input 
                  id="email"
                  name="email"
                  autoComplete="email"
                  required 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:border-violet-500 font-medium transition-all" 
                  placeholder="seu@email.com" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Senha</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                <input 
                  id="password"
                  name="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:border-violet-500 font-medium transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all mt-6 disabled:opacity-50">
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Continuar')} <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-4">
              {isLogin ? 'Não tem uma conta?' : 'Já possui conta?'}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-1 text-violet-600 dark:text-violet-400 hover:underline">
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </form>
        )}

        {step === 'family_setup' && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h1 className="text-2xl font-extrabold text-center mb-2 text-slate-900 dark:text-white">Configure seu Perfil</h1>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">Você vai usar sozinho ou dividir com alguém?</p>

            {!setupMode ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Como podemos te chamar?</label>
                  <input 
                    id="name"
                    name="name"
                    autoComplete="name"
                    required 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-violet-500 font-medium mb-4" 
                    placeholder="Seu nome ou apelido" 
                  />
                </div>
                
                <button onClick={() => name.trim() && setSetupMode('create')} className={`w-full flex items-center gap-4 p-5 rounded-3xl border border-slate-200 dark:border-white/10 transition-all group text-left ${name.trim() ? 'hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                  <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"><User className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Conta Nova (Individual/Família)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Criar um novo cofre de milhas do zero</p>
                  </div>
                </button>
                <button onClick={() => name.trim() && setSetupMode('join')} className={`w-full flex items-center gap-4 p-5 rounded-3xl border border-slate-200 dark:border-white/10 transition-all group text-left ${name.trim() ? 'hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                  <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"><Users className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Juntar-se a uma Família</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Possuo um código de convite</p>
                  </div>
                </button>
              </div>
            ) : (
              <form onSubmit={handleFamilySetup} className="space-y-4 animate-in slide-in-from-right-4">
                {setupMode === 'create' ? (
                  <div>
                    <label htmlFor="familyName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Nome do Grupo/Família</label>
                    <input 
                      id="familyName"
                      name="familyName"
                      required 
                      type="text" 
                      value={familyName} 
                      onChange={(e) => setFamilyName(e.target.value)} 
                      className="w-full bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-violet-500 font-medium" 
                      placeholder="Ex: Família Silva ou Minhas Milhas" 
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="inviteCode" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Código de Convite</label>
                    <div className="relative">
                      <Key className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                      <input 
                        id="inviteCode"
                        name="inviteCode"
                        required 
                        type="text" 
                        value={inviteCode} 
                        onChange={(e) => setInviteCode(e.target.value)} 
                        className="w-full bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:border-violet-500 font-medium uppercase" 
                        placeholder="EX: A1B2C3" 
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setSetupMode(null)} className="px-5 py-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Voltar</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50">
                    {loading ? 'Finalizando...' : 'Acessar Plataforma'} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}