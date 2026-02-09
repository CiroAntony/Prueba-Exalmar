import React, { useRef } from 'react';
import { FileText, Target, Eye, Trash2, X, Download, Upload } from 'lucide-react';
import { SavedReport, AuditPlan } from '../types';
import { exportBackup, importBackup } from '../services/storageService';

interface HistoryViewProps {
  reports: SavedReport[];
  plans: AuditPlan[];
  onViewReport: (r: SavedReport) => void;
  onViewPlan: (p: AuditPlan) => void;
  onDeleteReport: (id: string | number) => void;
  onDeletePlan: (id: string) => void;
  onClose: () => void;
  onDataImported: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  reports, plans, onViewReport, onViewPlan, onDeleteReport, onDeletePlan, onClose, onDataImported 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importBackup(content)) {
          alert("Base de datos restaurada con éxito.");
          onDataImported();
        } else {
          alert("Error al importar el archivo.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Historial</h2>
        <div className="flex gap-4">
          <button 
            onClick={exportBackup} 
            title="Descargar Copia de Seguridad"
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all"
          >
            <Download className="w-4 h-4" /> BACKUP
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            title="Restaurar desde archivo"
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-orange-600 hover:text-white transition-all"
          >
            <Upload className="w-4 h-4" /> RESTORE
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          <button onClick={onClose} className="bg-white p-4 rounded-[1.5rem] text-slate-400 hover:text-slate-900 border border-slate-100">
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>
      
      <div className="space-y-16">
        <section>
          <div className="flex items-center gap-4 mb-8">
            <FileText className="text-blue-600 w-8 h-8" />
            <h3 className="text-2xl font-black uppercase tracking-widest text-slate-400">Informes de Auditoría</h3>
          </div>
          {reports.length === 0 ? <p className="text-slate-300 italic">No hay informes.</p> : (
            <div className="grid gap-6">
              {reports.map(report => (
                <div key={report.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 flex items-center justify-between hover:shadow-2xl transition-all group">
                  <div className="flex items-center gap-8">
                    <div className="bg-blue-50 p-6 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><FileText className="w-8 h-8" /></div>
                    <div><h4 className="text-2xl font-black text-slate-900 mb-1">{report.title}</h4><p className="text-xs font-black text-slate-300 uppercase tracking-widest">{new Date(report.timestamp).toLocaleString()}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => onViewReport(report)} className="p-4 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Eye className="w-6 h-6" /></button>
                    <button onClick={() => onDeleteReport(report.id)} className="p-4 bg-slate-50 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-6 h-6" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <Target className="text-orange-600 w-8 h-8" />
            <h3 className="text-2xl font-black uppercase tracking-widest text-slate-400">Planes Estratégicos</h3>
          </div>
          {plans.length === 0 ? <p className="text-slate-300 italic">No hay planes.</p> : (
            <div className="grid gap-6">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 flex items-center justify-between hover:shadow-2xl transition-all group">
                  <div className="flex items-center gap-8">
                    <div className="bg-orange-50 p-6 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all"><Target className="w-8 h-8" /></div>
                    <div><h4 className="text-2xl font-black text-slate-900 mb-1">{plan.title}</h4><p className="text-xs font-black text-slate-300 uppercase tracking-widest">{new Date(plan.timestamp).toLocaleString()}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => onViewPlan(plan)} className="p-4 bg-slate-50 rounded-2xl hover:bg-orange-600 hover:text-white transition-all"><Eye className="w-6 h-6" /></button>
                    <button onClick={() => onDeletePlan(plan.id)} className="p-4 bg-slate-50 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-6 h-6" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};