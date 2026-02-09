import { SavedReport, Observation, User, AuditPlan } from "../types";

const DRAFT_KEY = 'audit_active_session_draft';
const HISTORY_KEY = 'audit_reports_history';
const PLAN_HISTORY_KEY = 'audit_plans_history';
const USER_KEY = 'audit_user_session';
const USERS_DB_KEY = 'audit_local_users_db';

// User Database Management (Local)
export const getLocalUsers = (): User[] => {
  const data = localStorage.getItem(USERS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLocalUser = (user: User): boolean => {
  const users = getLocalUsers();
  if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    return false; // User already exists
  }
  localStorage.setItem(USERS_DB_KEY, JSON.stringify([...users, user]));
  return true;
};

// Report History
export const getHistory = async (): Promise<SavedReport[]> => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFullReport = async (report: SavedReport): Promise<void> => {
  const history = await getHistory();
  const updatedHistory = [report, ...history];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  localStorage.removeItem(DRAFT_KEY);
};

export const deleteReport = async (reportId: string | number): Promise<void> => {
  const history = await getHistory();
  const updatedHistory = history.filter(r => r.id.toString() !== reportId.toString());
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

// Plan History
export const getPlanHistory = async (): Promise<AuditPlan[]> => {
  const data = localStorage.getItem(PLAN_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAuditPlan = async (plan: AuditPlan): Promise<void> => {
  const history = await getPlanHistory();
  const updatedHistory = [plan, ...history];
  localStorage.setItem(PLAN_HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const deletePlan = async (planId: string): Promise<void> => {
  const history = await getPlanHistory();
  const updatedHistory = history.filter(p => p.id !== planId);
  localStorage.setItem(PLAN_HISTORY_KEY, JSON.stringify(updatedHistory));
};

// Backup System
export const exportBackup = () => {
  const data = {
    users: getLocalUsers(),
    reports: localStorage.getItem(HISTORY_KEY),
    plans: localStorage.getItem(PLAN_HISTORY_KEY),
    draft: localStorage.getItem(DRAFT_KEY)
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_audit_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importBackup = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.users) localStorage.setItem(USERS_DB_KEY, JSON.stringify(data.users));
    if (data.reports) localStorage.setItem(HISTORY_KEY, data.reports);
    if (data.plans) localStorage.setItem(PLAN_HISTORY_KEY, data.plans);
    if (data.draft) localStorage.setItem(DRAFT_KEY, data.draft);
    return true;
  } catch (e) {
    console.error("Backup corrupto", e);
    return false;
  }
};

// Active Session Draft
export const saveDraftSession = (observations: Observation[]) => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(observations));
};

export const getDraftSession = (): Observation[] => {
  const data = localStorage.getItem(DRAFT_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearHistory = async (): Promise<void> => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  localStorage.setItem(PLAN_HISTORY_KEY, JSON.stringify([]));
};

export const saveUserSession = (user: any) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUserSession = () => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const removeUserSession = () => {
  localStorage.removeItem(USER_KEY);
};