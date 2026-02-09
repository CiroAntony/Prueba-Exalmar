
export interface User {
  name: string;
  email: string;
  role: 'Auditor Senior' | 'Gerente de Auditoría';
}

export interface Observation {
  id: string;
  images: string[]; // Ahora soporta múltiples imágenes
  description: string;
  timestamp: string;
}

export interface AuditFinding {
  id: string | number;
  title: string; // Descripción del hallazgo (Detallado + Impacto)
  condition: string; // Observación o hallazgo (Título corto)
  effect: string; // Riesgos evaluados
  rating: 'Baja' | 'Media' | 'Alta' | 'Crítica'; // Calificación
  recommendations: string; // Recomendaciones de AI
  actionPlans: string; // Planes de acción
  responsible: string; // Responsables
  implementationDate: string; // Fecha de implementación
}

export interface AuditPlanItem {
  id: string;
  title: string;
  description: string;
  category: 'Riesgo' | 'Fraude' | 'Muestreo';
  selected: boolean;
  logic?: string;
  probability?: number;
  impact?: number;
}

export interface AuditPlan {
  id: string;
  title: string;
  process: string;
  context: string;
  timestamp: string;
  items: AuditPlanItem[];
  overallObjective: string;
  auditor?: string;
}

export interface SavedReport {
  id: string | number;
  docCode?: string;
  to?: string;
  at?: string;
  cc?: string;
  from?: string;
  subject?: string;
  globalRating?: string;
  title: string;
  timestamp: string;
  observations: Observation[];
  findings: AuditFinding[];
  auditor?: string;
}

export interface AppState {
  user: User | null;
  currentSession: Observation[];
  currentPlan: AuditPlan | null;
  loading: boolean;
  result: SavedReport | null;
  error: string | null;
  view: 'login' | 'home' | 'walkthrough' | 'session_summary' | 'result' | 'history' | 'planning_input' | 'planning_review' | 'under_construction' | 'draft_redactor';
  history: SavedReport[];
  planHistory: AuditPlan[];
}
