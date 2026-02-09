import React from 'react';
import { ClipboardCheck, History, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onNavigate, onLogout }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 no-print shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="bg-blue-600 p-3 rounded-2xl group-hover:rotate-6 transition-transform shadow-xl shadow-blue-500/20">
            <ClipboardCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Exalmar <span className="text-blue-600">Audit</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate('history')} className="p-3 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-2xl">
            <History className="w-6 h-6" />
          </button>
          {user && (
            <div className="hidden md:flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5 opacity-60">{user.role}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <UserIcon className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          )}
          <button onClick={onLogout} className="p-3 text-slate-300 hover:text-red-500 transition-all bg-slate-50 rounded-2xl">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
    <main className="max-w-7xl mx-auto px-8 pt-12">{children}</main>
  </div>
);