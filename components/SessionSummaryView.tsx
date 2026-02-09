
import React from 'react';
import { Plus, Edit2, Trash2, FileSpreadsheet, RefreshCcw, ImageIcon, X, Image as LucideImage } from 'lucide-react';
import { Observation } from '../types';

interface SessionSummaryViewProps {
  session: Observation[];
  onEdit: (obs: Observation) => void;
  onDelete: (id: string) => void;
  onAddMore: () => void;
  onProcess: () => void;
  loading: boolean;
  onCancelLoading?: () => void;
}

export const SessionSummaryView: React.FC<SessionSummaryViewProps> = ({ 
  session, onEdit, onDelete, onAddMore, onProcess, loading, onCancelLoading 
}) => (
  <div className="max-w-3xl mx-auto py-12 animate-in fade-in">
    <div className="flex items-center justify-between mb-12">
      <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Resumen de Evidencias</h2>
      <div className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm">{session.length} HALLAZGOS</div>
    </div>
    <div className="grid gap-8 mb-16">
      {session.map(obs => (
        <div key={obs.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 flex gap-8 items-center shadow-lg transform hover:-translate-x-2 transition-all">
          <div className="relative w-32 h-32 bg-slate-50 rounded-[2.5rem] overflow-hidden flex-shrink-0 shadow-inner border border-slate-100">
            {obs.images && obs.images.length > 0 ? (
              <>
                <img src={obs.images[0]} className="w-full h-full object-cover" />
                {obs.images.length > 1 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-black text-xl">
                    +{obs.images.length - 1}
                  </div>
                )}
              </>
            ) : (
              <ImageIcon className="w-full h-full p-8 opacity-10" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <LucideImage className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{obs.images.length} Fotos capturadas</span>
            </div>
            <p className="text-slate-800 text-xl font-bold line-clamp-2 italic leading-snug">"{obs.description || '(Sin descripción)'}"</p>
          </div>
          <div className="flex flex-col gap-3">
            <button disabled={loading} onClick={() => onEdit(obs)} className="p-4 bg-blue-50 rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 disabled:opacity-30"><Edit2 className="w-6 h-6"/></button>
            <button disabled={loading} onClick={() => onDelete(obs.id)} className="p-4 bg-red-50 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-100 disabled:opacity-30"><Trash2 className="w-6 h-6"/></button>
          </div>
        </div>
      ))}
      {!loading && (
        <button onClick={onAddMore} className="border-4 border-dashed border-slate-200 rounded-[3.5rem] p-16 flex flex-col items-center gap-4 text-slate-300 hover:text-blue-600 hover:border-blue-600 transition-all group">
          <div className="bg-white p-6 rounded-full shadow-lg group-hover:scale-110 transition-transform"><Plus className="w-10 h-10"/></div>
          <span className="font-black uppercase text-xs tracking-[0.4em]">REGISTRAR NUEVA EVIDENCIA</span>
        </button>
      )}
    </div>
    {session.length > 0 && (
      <div className="space-y-4">
        <button onClick={onProcess} disabled={loading} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-3xl shadow-2xl flex items-center justify-center gap-6 hover:bg-blue-600 transition-all active:scale-95 disabled:bg-slate-700">
          {loading ? <RefreshCcw className="animate-spin w-10 h-10" /> : <FileSpreadsheet className="w-10 h-10" />}
          {loading ? 'ANALIZANDO IMÁGENES...' : 'CONSOLIDAR INFORME FINAL'}
        </button>
        {loading && onCancelLoading && (
          <button onClick={onCancelLoading} className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-[0.3em] hover:text-red-500 transition-colors flex items-center justify-center gap-2">
            <X className="w-4 h-4" /> Cancelar proceso y volver
          </button>
        )}
      </div>
    )}
  </div>
);
