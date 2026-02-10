
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginView } from './components/LoginView';
import { HomeView } from './components/HomeView';
import { PlanningView } from './components/PlanningView';
import { WalkthroughView } from './components/WalkthroughView';
import { SessionSummaryView } from './components/SessionSummaryView';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { DraftRedactorView } from './components/DraftRedactorView';
import { AppState, Observation, SavedReport, User, AuditPlan } from './types';
import { analyzeBatchObservations } from './services/geminiService';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { 
  getHistory, saveFullReport, saveDraftSession, getDraftSession, 
  deleteReport, saveUserSession, getUserSession, removeUserSession, 
  getLocalUsers, saveLocalUser, getPlanHistory, saveAuditPlan, deletePlan 
} from './services/storageService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null, currentSession: [], currentPlan: null, loading: false, result: null, 
    error: null, view: 'login', history: [], planHistory: []
  });

  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingObs, setEditingObs] = useState<Observation | null>(null);

  useEffect(() => {
    const savedUser = getUserSession();
    if (savedUser) {
      loadData(savedUser);
    }
  }, []);

  const loadData = async (user: User | null) => {
    const history = await getHistory();
    const planHistory = await getPlanHistory();
    const draft = getDraftSession();
    setState(prev => ({ 
      ...prev, 
      user: user || prev.user, 
      history, 
      planHistory, 
      currentSession: draft, 
      view: user ? 'home' : 'login',
      loading: false,
      error: null
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(p => ({ ...p, loading: true, error: null }));
    const email = loginForm.email.toLowerCase().trim();
    
    setTimeout(async () => {
      const users = getLocalUsers();
      if (isRegistering) {
        const newUser: User = { name: loginForm.name || email.split('@')[0], email, role: 'Auditor Senior' };
        if (saveLocalUser(newUser)) {
          setSuccessMessage("Registro OK. Inicia sesión.");
          setIsRegistering(false);
          setState(p => ({ ...p, loading: false }));
        } else {
          setState(p => ({ ...p, loading: false, error: "El correo ya existe." }));
        }
      } else {
        const found = users.find(u => u.email === email) || (email === 'admin@admin.com' ? { name: 'Admin', email, role: 'Gerente de Auditoría' as const } : null);
        if (found) {
          saveUserSession(found);
          loadData(found);
        } else {
          setState(p => ({ ...p, loading: false, error: "Credenciales no válidas." }));
        }
      }
    }, 600);
  };

  const handleAddObservation = (obs: Observation) => {
    const isEditing = !!editingObs;
    const newSession = isEditing 
      ? state.currentSession.map(o => o.id === obs.id ? obs : o)
      : [...state.currentSession, obs];
    
    setState(p => ({ ...p, currentSession: newSession, view: 'session_summary', error: null }));
    saveDraftSession(newSession);
    setEditingObs(null);
  };

  const cancelLoading = () => {
    setState(p => ({ ...p, loading: false, error: "Proceso cancelado por el usuario." }));
  };

  const handleProcessAudit = async (observations?: Observation[]) => {
    const obsToProcess = observations || state.currentSession;
    if (obsToProcess.length === 0) return;
    
    setState(p => ({ ...p, loading: true, error: null }));
    try {
      const report = await analyzeBatchObservations(obsToProcess);
      const fullReport: SavedReport = {
        ...report,
        auditor: state.user?.name
      };
      await saveFullReport(fullReport);
      const h = await getHistory();
      setState(p => ({ 
        ...p, 
        loading: false, 
        result: fullReport, 
        history: h, 
        view: 'result', 
        currentSession: [] 
      }));
    } catch (e: any) {
      console.error("Audit processing failed:", e);
      setState(p => ({ 
        ...p, 
        loading: false, 
        error: e.message || "Error de IA al procesar informe. Verifica tu conexión." 
      }));
    }
  };

  const navigate = (v: any) => setState(p => ({ ...p, view: v, error: null }));

  if (state.view === 'login') return (
    <LoginView 
      onLogin={handleLogin} loginForm={loginForm} setLoginForm={setLoginForm}
      isRegistering={isRegistering} setIsRegistering={setIsRegistering}
      loading={state.loading} error={state.error} successMessage={successMessage}
    />
  );

  return (
    <Layout 
      user={state.user} 
      onNavigate={navigate} 
      onLogout={() => { removeUserSession(); setState(p => ({...p, user: null, view: 'login'})); }}
    >
      {state.error && (
        <div className="max-w-2xl mx-auto mb-6 p-6 bg-red-50 border border-red-200 rounded-3xl flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-red-500 w-6 h-6" />
            <p className="text-red-800 text-sm font-bold">{state.error}</p>
          </div>
          <button onClick={() => setState(p => ({...p, error: null}))} className="text-red-400 hover:text-red-600 font-black text-xs uppercase tracking-widest">Cerrar</button>
        </div>
      )}

      {state.view === 'home' && <HomeView onNavigate={navigate} />}
      
      {(state.view === 'planning_input' || state.view === 'planning_review') && (
        <PlanningView 
          view={state.view as any}
          currentPlan={state.currentPlan} 
          loading={state.loading}
          setLoading={(l) => setState(p => ({...p, loading: l}))}
          onNavigate={navigate}
          setCurrentPlan={(plan) => setState(p => ({...p, currentPlan: plan}))}
          onSave={async (plan) => {
            await saveAuditPlan(plan);
            const h = await getPlanHistory();
            setState(p => ({...p, planHistory: h, view: 'home'}));
          }}
        />
      )}

      {state.view === 'walkthrough' && (
        <WalkthroughView 
          editingObs={editingObs} 
          onAdd={handleAddObservation} 
          onCancel={() => { setEditingObs(null); navigate('home'); }} 
          onShowSummary={() => navigate('session_summary')}
          sessionLength={state.currentSession.length}
        />
      )}

      {state.view === 'draft_redactor' && (
        <DraftRedactorView 
          onProcess={(obs) => handleProcessAudit([obs])}
          onCancel={() => navigate('home')}
          loading={state.loading}
          onCancelLoading={cancelLoading}
        />
      )}

      {state.view === 'session_summary' && (
        <SessionSummaryView 
          session={state.currentSession} 
          loading={state.loading}
          onEdit={(obs) => { setEditingObs(obs); navigate('walkthrough'); }}
          onDelete={(id) => {
            const ns = state.currentSession.filter(o => o.id !== id);
            setState(p => ({...p, currentSession: ns}));
            saveDraftSession(ns);
          }}
          onAddMore={() => { setEditingObs(null); navigate('walkthrough'); }}
          onProcess={() => handleProcessAudit()}
          onCancelLoading={cancelLoading}
        />
      )}

      {state.view === 'result' && state.result && (
        <ResultView result={state.result} user={state.user} onBack={() => navigate('home')} />
      )}

      {state.view === 'history' && (
        <HistoryView 
          reports={state.history} 
          plans={state.planHistory}
          onViewReport={(r) => setState(p => ({...p, result: r, view: 'result'}))}
          onViewPlan={(plan: AuditPlan) => setState(p => ({...p, currentPlan: plan, view: 'planning_review'}))}
          onDeleteReport={async (id) => { await deleteReport(id); const h = await getHistory(); setState(p => ({...p, history: h})); }}
          onDeletePlan={async (id) => { await deletePlan(id); const h = await getPlanHistory(); setState(p => ({...p, planHistory: h})); }}
          onClose={() => navigate('home')}
          onDataImported={() => loadData(getUserSession())}
        />
      )}

      {state.view === 'under_construction' && (
        <div className="max-md mx-auto py-24 text-center animate-in fade-in zoom-in">
          <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Próximamente</h2>
          <p className="text-slate-500 mb-10 text-lg">Este módulo está siendo optimizado para la próxima actualización del sistema.</p>
          <button 
            onClick={() => navigate('home')}
            className="flex items-center gap-2 mx-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> VOLVER AL PANEL
          </button>
        </div>
      )}
    </Layout>
  );
};

export default App;
