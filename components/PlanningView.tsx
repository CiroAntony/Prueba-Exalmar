
import React, { useState } from 'react';
import { Target, RefreshCcw, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AuditPlan } from '../types';
import { generateAuditPlan } from '../services/planningService';

interface PlanningViewProps {
  currentPlan: AuditPlan | null;
  onSave: (plan: AuditPlan) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  view: 'planning_input' | 'planning_review';
  onNavigate: (v: any) => void;
  setCurrentPlan: (p: AuditPlan) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ 
  currentPlan, onSave, loading, setLoading, view, onNavigate, setCurrentPlan 
}) => {
  const [input, setInput] = useState({ process: currentPlan?.process || '', context: currentPlan?.context || '' });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.process) return;
    setLoading(true);
    setError(null);
    try {
      const planData = await generateAuditPlan(input.process, input.context);
      setCurrentPlan({
        ...planData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        process: input.process,
        context: input.context,
        title: `Plan CIA: ${input.process}`
      } as AuditPlan);
      onNavigate('planning_review');
    } catch (e: any) {
      setError(e.message || "Error al generar el plan estratégico con IA.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (prob?: number, imp?: number) => {
    if (!prob || !imp) return 'bg-slate-500';
    const score = prob * imp;
    if (score >= 15) return 'bg-red-600';
    if (score >= 8) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  if (view === 'planning_input') {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-right">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Planificador CIA</h2>
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-8">Metodología COSO 2013 & Taxonomía de Riesgos</p>
          <div className="space-y-6">
            <input 
              type="text" 
              placeholder="Proceso a analizar (Ej: Compras Locales)" 
              value={input.process} 
              onChange={e => setInput(p => ({...p, process: e.target.value}))} 
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-lg outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
            />
            <textarea 
              placeholder="Contexto organizacional, volumen transaccional o controles clave existentes..." 
              value={input.context} 
              onChange={e => setInput(p => ({...p, context: e.target.value}))} 
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] h-40 font-medium text-lg outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
            />
          </div>

          {error && (
            <div className="mt-8 bg-red-500/10 border border-red-500/40 p-5 rounded-3xl flex items-center gap-4 animate-in shake">
              <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
              <p className="text-red-500 text-xs font-black leading-snug">{error}</p>
            </div>
          )}

          <button 
            onClick={handleGenerate} 
            disabled={loading || !input.process} 
            className="w-full mt-10 py-6 bg-blue-600 text-white rounded-3xl font-black text-2xl shadow-xl flex items-center justify-center gap-4 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {loading ? <RefreshCcw className="animate-spin"/> : <Target/>}
            {loading ? 'CUANTIFICANDO RIESGOS...' : 'GENERAR ESTRATEGIA CIA'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 animate-in fade-in">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
        <h2 className="text-4xl font-black text-slate-900 mb-10">Estrategia de Auditoría</h2>
        
        <div className="bg-slate-900 p-8 rounded-[2rem] mb-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <p className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-4">Objetivo del Encargo (COSO 2013)</p>
          <p className="text-xl font-bold leading-relaxed">"{currentPlan?.overallObjective}"</p>
        </div>

        <div className="space-y-6 mb-12">
          {currentPlan?.items.map(item => (
            <div key={item.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
              <div className={`absolute top-0 left-0 w-2 h-full ${getRiskColor(item.probability, item.impact)}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${getRiskColor(item.probability, item.impact)}`}>
                  {item.category}
                </span>
                {item.probability && item.impact && (
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase">Prob.</p>
                      <p className="text-lg font-black text-slate-900">{item.probability}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase">Imp.</p>
                      <p className="text-lg font-black text-slate-900">{item.impact}</p>
                    </div>
                    <div className="text-center border-l pl-4 border-slate-100">
                      <p className="text-[9px] font-black text-slate-300 uppercase">R. Puro</p>
                      <p className="text-lg font-black text-blue-600">{item.probability * item.impact}</p>
                    </div>
                  </div>
                )}
              </div>

              <h4 className="text-2xl font-black text-slate-900 mb-3">{item.title}</h4>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">{item.description}</p>
              
              {item.logic && (
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0"/> 
                  <p className="text-xs font-bold text-blue-800 leading-relaxed italic">
                    <span className="text-blue-400 uppercase tracking-tighter mr-2">Justificación Técnica:</span>
                    {item.logic}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button onClick={() => onNavigate('planning_input')} className="py-6 border-2 border-slate-200 text-slate-500 rounded-3xl font-black text-lg hover:bg-slate-50 transition-all">REDISEÑAR PLAN</button>
          <button onClick={() => currentPlan && onSave(currentPlan)} className="py-6 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-2xl hover:bg-blue-600 transition-all active:scale-95">CONFIRMAR ESTRATEGIA</button>
        </div>
      </div>
    </div>
  );
};