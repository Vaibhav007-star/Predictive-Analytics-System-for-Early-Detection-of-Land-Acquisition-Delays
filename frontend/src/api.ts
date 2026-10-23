import type {
  ProjectListResponse,
  ProjectDetail,
  ExplanationResponse,
  RisksSummaryResponse,
  GeoProjectItem,
  User,
  AuthResponse,
  Intervention,
  AuditLogListResponse,
  SimulationRequest,
  CustomProjectSimulationRequest,
  SimulationResponse,
  StatutoryAssessmentResponse,
  NoticeDraftResponse,
  SurvivalResponse,
  SampleCorridorItem,
  CorridorAnalysisResponse,
  GraphNetworkResponse,
  CascadeResponse
} from './types';

import {
  fallbackLoginUser,
  fallbackFetchRisksSummary,
  fallbackFetchProjects,
  fallbackFetchProjectDetail,
  fallbackFetchProjectExplanation,
  fallbackFetchGeoProjects,
  fallbackFetchProjectInterventions,
  fallbackCreateIntervention,
  fallbackFetchAuditLogs,
  fallbackSimulateProject,
  fallbackSimulateCustomProject,
  fallbackFetchStatutoryAssessment,
  fallbackGenerateStatutoryNotice,
  fallbackFetchProjectSurvival,
  fallbackFetchSampleCorridors,
  fallbackAnalyzeCorridorRoute,
  fallbackFetchContagionNetwork,
  fallbackSimulateContagionCascade
} from './fallbackApi';

// Use VITE_API_BASE if set (e.g. for production Vercel deployment pointing to backend API), otherwise relative URL
const API_BASE = (import.meta.env.VITE_API_BASE as string) || '';

const TOKEN_KEY = 'sih26017_token';
const USER_KEY = 'sih26017_user';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ----------------- Authentication -----------------

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data: AuthResponse = await res.json();
      saveAuthSession(data.access_token, data.user);
      return data;
    }
  } catch {
    // Backend offline / static Vercel
  }
  const fallback = await fallbackLoginUser(username, password);
  saveAuthSession(fallback.access_token, fallback.user);
  return fallback;
}

export async function fetchCurrentUser(): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: authHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline
  }
  const stored = getStoredUser();
  if (stored) return stored;
  return {
    username: 'admin',
    name: 'MoRD Director General',
    role: 'Admin',
    department: 'Ministry of Rural Development'
  };
}

// ----------------- Core Analytics -----------------

export async function fetchRisksSummary(): Promise<RisksSummaryResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/risks`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to authentic precomputed MoSPI dataset
  }
  return fallbackFetchRisksSummary();
}

export async function fetchProjects(
  page: number = 1,
  pageSize: number = 20,
  sector?: string,
  state?: string,
  riskCategory?: string,
  search?: string
): Promise<ProjectListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });
    if (sector) params.append('sector', sector);
    if (state) params.append('state', state);
    if (riskCategory) params.append('risk_category', riskCategory);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/api/projects?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to precomputed projects
  }
  return fallbackFetchProjects(page, pageSize, sector, state, riskCategory, search);
}

export async function fetchProjectDetail(projectCode: string): Promise<ProjectDetail> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchProjectDetail(projectCode);
}

export async function fetchProjectExplanation(projectCode: string): Promise<ExplanationResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/explanation`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchProjectExplanation(projectCode);
}

export async function fetchGeoProjects(): Promise<GeoProjectItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/geo/projects`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchGeoProjects();
}

// ----------------- Interventions & Audit Trail -----------------

export async function fetchProjectInterventions(projectCode: string): Promise<Intervention[]> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/interventions`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchProjectInterventions(projectCode);
}

export async function createIntervention(
  projectCode: string,
  interventionType: string,
  notes: string
): Promise<Intervention> {
  try {
    const res = await fetch(`${API_BASE}/api/interventions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        project_code: projectCode,
        intervention_type: interventionType,
        notes: notes
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackCreateIntervention(projectCode, interventionType, notes, getStoredUser());
}

export async function fetchAuditLogs(limit: number = 50): Promise<AuditLogListResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/audit-logs?limit=${limit}`, {
      headers: authHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchAuditLogs(limit);
}

// ----------------- Simulation & Policy Levers -----------------

export async function simulateProject(
  projectCode: string,
  levers: SimulationRequest
): Promise<SimulationResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(levers)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackSimulateProject(projectCode, levers);
}

export async function simulateCustomProject(
  request: CustomProjectSimulationRequest
): Promise<SimulationResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/simulation/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackSimulateCustomProject(request);
}

// ----------------- Statutory Compliance & Notices -----------------

export async function fetchStatutoryAssessment(
  projectCode: string
): Promise<StatutoryAssessmentResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/statutory`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchStatutoryAssessment(projectCode);
}

export async function generateStatutoryNotice(
  projectCode: string,
  recipientTitle: string,
  customInstructions: string
): Promise<NoticeDraftResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/statutory/notice`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        recipient_title: recipientTitle,
        custom_instructions: customInstructions
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackGenerateStatutoryNotice(projectCode, recipientTitle, customInstructions);
}

// ----------------- Survival Analysis -----------------

export async function fetchProjectSurvival(
  projectCode: string
): Promise<SurvivalResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/survival`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchProjectSurvival(projectCode);
}

// ----------------- Geospatial Corridors -----------------

export async function fetchSampleCorridors(): Promise<SampleCorridorItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/geo/corridors/sample`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchSampleCorridors();
}

export async function analyzeCorridorRoute(
  coordinates: [number, number][],
  sector: string,
  state: string,
  name: string
): Promise<CorridorAnalysisResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/geo/corridors/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates,
        sector,
        state,
        name
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackAnalyzeCorridorRoute(coordinates, sector, state, name);
}

// ----------------- Infrastructure Contagion Network -----------------

export async function fetchContagionNetwork(): Promise<GraphNetworkResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/graph/network`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackFetchContagionNetwork();
}

export async function simulateContagionCascade(
  epicenterProjectCode: string,
  delayShockMonths: number = 18
): Promise<CascadeResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/graph/cascade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        epicenter_project_code: epicenterProjectCode,
        delay_shock_months: delayShockMonths
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return fallbackSimulateContagionCascade(epicenterProjectCode, delayShockMonths);
}
