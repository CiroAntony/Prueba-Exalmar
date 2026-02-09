
import React from 'react';
import { ArrowLeft, FileSpreadsheet, FileText, Printer, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { SavedReport, User } from '../types';
import { exportToExcel, exportToWord } from '../services/exportService';

interface ResultViewProps {
  result: SavedReport;
  user: User | null;
  onBack: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, user, onBack }) => {
  const getRatingStyle = (rating: string) => {
    switch (rating) {
      case 'Crítica': return 'bg-red-600 text-white';
      case 'Alta': return 'bg-orange-600 text-white';
      case 'Media': return 'bg-yellow-400 text-black';
      case 'Baja': return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getGlobalRatingColor = (rating?: string) => {
    const r = rating?.toLowerCase() || '';
    if (r.includes('insatisfactorio')) return 'text-red-600';
    if (r.includes('mejoras')) return 'text-yellow-500';
    return 'text-green-600';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 py-12 print:py-0">
      <div className="mb-12 flex justify-between items-center no-print">
        <button onClick={onBack} className="bg-white border border-slate-200 px-8 py-4 rounded-3xl font-black text-[10px] tracking-widest flex items-center gap-4 shadow-sm hover:shadow-xl transition-all"><ArrowLeft className="w-5 h-5" /> PANEL DE CONTROL</button>
        <div className="flex gap-4">
          <button onClick={() => exportToExcel(result)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-3"><FileSpreadsheet className="w-4 h-4" /> EXCEL</button>
          <button onClick={() => exportToWord(result)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-3"><FileText className="w-4 h-4" /> WORD</button>
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black shadow-lg hover:bg-slate-800 transition-all flex items-center gap-3"><Printer className="w-4 h-4" /> IMPRIMIR</button>
        </div>
      </div>
      
      <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden print:p-0 print:shadow-none print:border-none max-w-full mx-auto">
        
        {/* Header with Logos */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-6 print:border-slate-300">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">Pesquera<br/><span className="text-blue-600">EXALMAR</span></h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit AI System</p>
            </div>
          </div>
          <div className="text-right">
             <div className="bg-red-50 border border-red-100 p-3 rounded-xl inline-block">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Certificación</p>
                <p className="text-[10px] font-black text-slate-900">Anticorrupción +++</p>
             </div>
          </div>
        </div>

        {/* Memo Metadata */}
        <div className="space-y-2 mb-10 text-xs font-medium text-slate-700 print:text-[10px]">
          <p className="font-black text-slate-900 mb-4 tracking-tight">{result.docCode} INFORME</p>
          <div className="grid grid-cols-[100px_1fr] gap-x-4">
            <span className="font-black text-slate-900">A</span>
            <span>: {result.to}</span>
            <span className="font-black text-slate-900">At.</span>
            <span>: {result.at}</span>
            <span className="font-black text-slate-900">Cc.</span>
            <span>: {result.cc}</span>
            <div className="h-2"></div><div></div>
            <span className="font-black text-slate-900">De</span>
            <span>: {result.from || 'Auditoría Interna y Cumplimiento'}</span>
            <span className="font-black text-slate-900">Fecha</span>
            <span>: {new Date(result.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            <div className="h-2"></div><div></div>
            <span className="font-black text-slate-900">Asunto</span>
            <span className="font-black text-slate-900 uppercase">: {result.subject}</span>
            <span className="font-black text-slate-900">Calificación</span>
            <span className="font-black text-slate-900">: <span className={getGlobalRatingColor(result.globalRating)}>{result.globalRating}</span></span>
          </div>
        </div>

        <div className="h-0.5 bg-black/10 mb-8"></div>

        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">5. Resultados de la Evaluación</h3>
          <p className="text-slate-600 text-xs leading-relaxed mb-6">
            Tras evaluar los riesgos y ejecutar los procedimientos de auditoría, así como analizar las observaciones discutidas con los responsables involucrados, se concluye lo siguiente:
          </p>
        </div>

        {/* 9-Column Audit Table */}
        <div className="overflow-x-auto -mx-12 px-12 pb-12 print:overflow-visible print:mx-0 print:px-0">
          <table className="audit-table">
            <thead>
              <tr>
                <th className="w-[3%]">N°</th>
                <th className="w-[12%]">Observación o hallazgo</th>
                <th className="w-[24%]">Descripción del hallazgo</th>
                <th className="w-[12%]">Riesgos Evaluados</th>
                <th className="w-[7%]">Calificación</th>
                <th className="w-[20%]">Recomendación de Auditoría Interna</th>
                <th className="w-[8%]">Plan de acción</th>
                <th className="w-[10%]">Responsable</th>
                <th className="w-[4%]">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {result.findings.map((f, i) => (
                <tr key={i}>
                  <td className="text-center font-black bg-slate-50/50">{i + 1}</td>
                  <td className="text-justify leading-relaxed font-bold text-slate-800">{f.condition}</td>
                  <td className="text-justify leading-relaxed whitespace-pre-line text-slate-900">{f.title}</td>
                  <td className="text-center italic text-slate-600 text-[10px] leading-tight font-medium whitespace-pre-line">
                    {f.effect}
                  </td>
                  <td className="text-center align-middle">
                    <span className={`px-2 py-1.5 rounded-md text-[8px] font-black uppercase inline-block w-full text-center shadow-sm ${getRatingStyle(f.rating)}`}>
                      {f.rating}
                    </span>
                  </td>
                  <td className="text-justify text-slate-700 leading-relaxed whitespace-pre-line text-[10px]">
                    {f.recommendations}
                  </td>
                  <td className="text-justify leading-relaxed whitespace-pre-line text-[10px]">{f.actionPlans}</td>
                  <td className="text-justify leading-relaxed whitespace-pre-line text-[9px] font-bold uppercase">
                    {f.responsible}
                  </td>
                  <td className="text-center font-mono font-bold text-blue-900 bg-blue-50/20 text-[9px] whitespace-pre-line">
                    {f.implementationDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Anexos Fotográficos */}
        <div className="mt-16 page-break-before-always">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-100 pb-4">
             <ImageIcon className="w-8 h-8 text-blue-600" />
             <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">6. Anexos Fotográficos</h3>
          </div>
          
          <div className="space-y-12">
            {result.observations.map((obs, hallazgoIdx) => (
              <div key={obs.id} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                  <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs">#{hallazgoIdx + 1}</span>
                  Hallazgo: {result.findings[hallazgoIdx]?.condition || 'Detalle de Evidencia'}
                </h4>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {obs.images.map((img, imgIdx) => (
                    <div key={imgIdx} className="space-y-3">
                      <div className="aspect-video bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={img} className="w-full h-full object-contain bg-slate-100" />
                      </div>
                      <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm inline-block">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Anexo {hallazgoIdx + 1}.{imgIdx + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formal Signatures */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-end print:mt-12">
          <div className="text-center">
            <div className="w-48 border-b border-slate-300 mb-4 mx-auto"></div>
            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{user?.name || 'Auditor a cargo'}</p>
            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Auditor Interno</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-slate-300 mb-4 mx-auto"></div>
            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Dixon Sotomayor Esparza</p>
            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Auditor General - Oficial de Cumplimiento</p>
          </div>
        </div>
      </div>
    </div>
  );
};
