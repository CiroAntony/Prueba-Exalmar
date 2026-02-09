
import React from 'react';
import { 
  Target, 
  Play, 
  PenTool, 
  FileCheck, 
  TrendingUp, 
  BarChart3, 
  Lock 
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const modules = [
    { 
      id: 'planning_input', 
      name: 'Planificador de Auditoría', 
      icon: Target, 
      color: 'blue' 
    },
    { 
      id: 'walkthrough', 
      name: 'Auditoría Operativa', 
      icon: Play, 
      color: 'green' 
    },
    { 
      id: 'draft_redactor', 
      name: 'Redactor de pre - hallazgo', 
      icon: PenTool, 
      color: 'orange' 
    },
    { 
      id: 'history', 
      name: 'Registro de Informes emitidos', 
      icon: FileCheck, 
      color: 'indigo' 
    },
    { 
      id: 'under_construction', 
      name: 'Seguimiento a las Implementaciones', 
      icon: TrendingUp, 
      color: 'emerald' 
    },
    { 
      id: 'under_construction', 
      name: 'Reportes y dashboard', 
      icon: BarChart3, 
      color: 'purple' 
    },
    { 
      id: 'under_construction', 
      name: 'Gestión de accesos', 
      icon: Lock, 
      color: 'slate' 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight max-w-4xl mx-auto">
          Sistema de Gestión de Auditoría Interna
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon;
          const colorClasses: Record<string, string> = {
            blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-600',
            green: 'text-green-600 bg-green-50 group-hover:bg-green-600',
            orange: 'text-orange-600 bg-orange-50 group-hover:bg-orange-600',
            indigo: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600',
            emerald: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600',
            purple: 'text-purple-600 bg-purple-50 group-hover:bg-purple-600',
            slate: 'text-slate-600 bg-slate-50 group-hover:bg-slate-600',
          };

          return (
            <div 
              key={index}
              onClick={() => onNavigate(module.id)}
              className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className={`p-4 rounded-2xl transition-all group-hover:text-white ${colorClasses[module.color]}`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                {module.name}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};
