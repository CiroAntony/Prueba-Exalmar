import React from 'react';
import { ClipboardCheck, Play, RefreshCcw, Mail, User as UserIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (e: React.FormEvent) => void;
  loginForm: any;
  setLoginForm: any;
  isRegistering: boolean;
  setIsRegistering: any;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onLogin, loginForm, setLoginForm, isRegistering, setIsRegistering, loading, error, successMessage 
}) => (
  <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-700 relative z-10">
      <div className="text-center mb-10">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/40">
          <ClipboardCheck className="text-white w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Exalmar Audit</h1>
        <p className="text-blue-400/60 font-black uppercase text-[12px] tracking-[0.4em]">SISTEMA DE AUDITORÍA AI</p>
      </div>
      <form onSubmit={onLogin} className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 p-12 rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)]">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{isRegistering ? 'Registro de Auditor' : 'Acceso al Sistema'}</h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Credenciales Corporativas</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 p-5 rounded-3xl flex items-center gap-4 animate-in shake">
              <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
              <p className="text-red-500 text-xs font-black leading-snug">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/40 p-5 rounded-3xl flex items-center gap-4 animate-in fade-in">
              <CheckCircle2 className="text-green-500 w-6 h-6 flex-shrink-0" />
              <p className="text-green-500 text-xs font-black leading-snug">{successMessage}</p>
            </div>
          )}
          <div className="space-y-5">
            {isRegistering && (
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Nombre Completo" 
                  value={loginForm.name} 
                  onChange={(e) => setLoginForm((p:any) => ({...p, name: e.target.value}))} 
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white py-5 pl-14 pr-6 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
              <input 
                type="email" 
                required 
                placeholder="usuario@exalmar.com.pe" 
                value={loginForm.email} 
                onChange={(e) => setLoginForm((p:any) => ({...p, email: e.target.value}))} 
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white py-5 pl-14 pr-6 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.8rem] font-black text-xl transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-500/25 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCcw className="w-7 h-7 animate-spin" /> : <Play className="w-6 h-6" />}
            {isRegistering ? 'REGISTRARSE' : 'INGRESAR'}
          </button>
          <div className="text-center">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="text-slate-500 text-xs font-black hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
              {isRegistering ? '¿Ya eres auditor? Ingresar' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
);