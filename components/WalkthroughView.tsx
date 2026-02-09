
import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, Mic, CheckCircle2, X, Plus } from 'lucide-react';
import { Observation } from '../types';

interface WalkthroughViewProps {
  onAdd: (obs: Observation) => void;
  onCancel: () => void;
  editingObs: Observation | null;
}

export const WalkthroughView: React.FC<WalkthroughViewProps> = ({ onAdd, onCancel, editingObs }) => {
  const [current, setCurrent] = useState({
    images: editingObs?.images || [] as string[],
    description: editingObs?.description || ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
          setCurrent(p => ({...p, images: [...p.images, reader.result as string]}));
        };
        reader.readAsDataURL(file);
      });
      // Reset input to allow selecting the same file again if needed
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
    <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-right">
      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{editingObs ? 'Editar Evidencia' : 'Capturar Evidencia'}</h2>
          <button onClick={onCancel} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900"><X className="w-7 h-7"/></button>
        </div>

        {/* Multi-Image Gallery */}
        <div className="mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evidencias Fotográficas ({current.images.length})</p>
          <div className="grid grid-cols-3 gap-4">
            {current.images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                <img src={img} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(idx)} 
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            ))}
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => cameraRef.current?.click()}
                className="flex-1 aspect-square border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-blue-100 hover:border-blue-400 transition-all group"
                title="Tomar Foto"
              >
                <Camera className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform"/>
                <span className="text-[8px] font-black text-blue-600">CÁMARA</span>
              </button>
              
              <button 
                onClick={() => galleryRef.current?.click()}
                className="flex-1 aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-slate-50 hover:border-slate-400 transition-all group"
                title="Seleccionar de Galería"
              >
                <ImageIcon className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform"/>
                <span className="text-[8px] font-black text-slate-400">GALERÍA</span>
              </button>
            </div>
          </div>
          
          {/* Inputs ocultos especializados */}
          <input type="file" ref={cameraRef} className="hidden" accept="image/*" capture="environment" onChange={handleImage} />
          <input type="file" ref={galleryRef} className="hidden" accept="image/*" onChange={handleImage} multiple />
        </div>

        <div className="relative mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nota de Campo</p>
          <textarea 
            placeholder="Describe lo observado para este hallazgo..." 
            value={current.description} 
            onChange={e => setCurrent(p => ({...p, description: e.target.value}))} 
            className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] h-60 outline-none font-bold text-slate-800 pr-20 focus:bg-white transition-all text-xl" 
          />
          <button onClick={toggleMic} className={`absolute right-6 bottom-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-slate-400 border border-slate-100 hover:text-blue-600'}`}>
            <Mic className="w-8 h-8"/>
          </button>
        </div>

        <button 
          onClick={() => onAdd({ id: editingObs?.id || Date.now().toString(), ...current, timestamp: editingObs?.timestamp || new Date().toISOString() })} 
          disabled={current.images.length === 0 && !current.description}
          className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          {editingObs ? <CheckCircle2 className="w-8 h-8"/> : <Plus className="w-8 h-8"/>}
          {editingObs ? 'ACTUALIZAR REGISTRO' : 'AÑADIR AL INFORME'}
        </button>
      </div>
    </div>
  );
};
