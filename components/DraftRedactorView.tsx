
import React, { useState, useRef } from 'react';
import { Camera, ImageIcon, Mic, RefreshCcw, PenTool, X, Sparkles, Trash2, Plus } from 'lucide-react';
import { Observation } from '../types';

interface DraftRedactorViewProps {
  onProcess: (obs: Observation) => void;
  onCancel: () => void;
  loading: boolean;
  onCancelLoading?: () => void;
}

export const DraftRedactorView: React.FC<DraftRedactorViewProps> = ({ onProcess, onCancel, loading, onCancelLoading }) => {
  const [current, setCurrent] = useState({ images: [] as string[], description: '' });
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = () => setCurrent(p => ({...p, images: [...p.images, reader.result as string]}));
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setCurrent(p => ({...p, images: p.images.filter((_, i) => i !== index)}));
  };

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Voz no compatible.");
    if (isRecording) { recognitionRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = 'es-PE'; rec.continuous = true;
    rec.onstart = () => setIsRecording(true);
    rec.onresult = (e: any) => {
      const text = e.results[e.results.length - 1][0].transcript;
      setCurrent(p => ({ ...p, description: (p.description + " " + text).trim() }));
    };
    rec.onend = () => setIsRecording(false);
    rec.start(); recognitionRef.current = rec;
  };

  return (
    <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-10">
      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
            <PenTool className="w-40 h-40 text-orange-600" />
        </div>
        
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Redactor de Hallazgos</h2>
            <p className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mt-2">Múltiples Evidencias + Referencia a Anexos</p>
          </div>
          <button disabled={loading} onClick={onCancel} className="p-4 bg-slate-50 rounded-3xl text-slate-400 hover:text-slate-900 transition-all disabled:opacity-20"><X className="w-8 h-8"/></button>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-10 relative z-10">
            {/* Gallery View */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[400px] p-2 bg-slate-50 rounded-3xl border border-slate-100">
                  {current.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white shadow-sm group">
                      <img src={img} className="w-full h-full object-cover" />
                      {!loading && (
                        <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg">
                          <X className="w-3 h-3"/>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      disabled={loading}
                      onClick={() => cameraRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-orange-200 bg-orange-50/20 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-orange-50 hover:border-orange-400 transition-all group"
                    >
                      <Camera className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform"/>
                      <span className="text-[8px] font-black text-orange-500">CÁMARA</span>
                    </button>
                    
                    <button 
                      disabled={loading}
                      onClick={() => galleryRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white hover:border-slate-400 transition-all group"
                    >
                      <Plus className="w-6 h-6 text-slate-300 group-hover:text-slate-500"/>
                      <span className="text-[8px] font-black text-slate-400">GALERÍA</span>
                    </button>
                  </div>
                </div>
                <input type="file" ref={cameraRef} className="hidden" accept="image/*" capture="environment" onChange={handleImage} />
                <input type="file" ref={galleryRef} className="hidden" accept="image/*" onChange={handleImage} multiple />
            </div>

            <div className="flex flex-col gap-6">
                <div className="relative flex-1">
                    <textarea 
                        disabled={loading}
                        placeholder="Describe el incumplimiento observado para generar el hallazgo técnico..." 
                        value={current.description} 
                        onChange={e => setCurrent(p => ({...p, description: e.target.value}))} 
                        className="w-full h-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none font-bold text-slate-800 focus:bg-white transition-all text-lg resize-none disabled:opacity-50 min-h-[300px]" 
                    />
                    {!loading && (
                      <button onClick={toggleMic} className={`absolute right-6 bottom-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-slate-400 border border-slate-100 hover:text-orange-600'}`}>
                          <Mic className="w-6 h-6"/>
                      </button>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onProcess({ id: Date.now().toString(), images: current.images, description: current.description, timestamp: new Date().toISOString() })} 
            disabled={loading || (current.images.length === 0 && !current.description)}
            className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-slate-700"
          >
            {loading ? <RefreshCcw className="w-8 h-8 animate-spin"/> : <Sparkles className="w-8 h-8"/>}
            {loading ? 'REDACTANDO INFORME TÉCNICO...' : 'REDACTAR HALLAZGO'}
          </button>
          
          {loading && onCancelLoading && (
            <button onClick={onCancelLoading} className="w-full py-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-2">
              <X className="w-3 h-3" /> Cancelar y editar entrada
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
