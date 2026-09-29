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

const API_BASE = '';

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

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
    throw new Error(err.detail || 'Authentication failed');
  }
  const data: AuthResponse = await res.json();
  saveAuthSession(data.access_token, data.user);
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Session expired or unauthorized');
  return res.json();
}

export async function fetchRisksSummary(): Promise<RisksSummaryResponse> {
  const res = await fetch(`${API_BASE}/api/risks`);
  if (!res.ok) throw new Error(`Failed to fetch risks summary (${res.status})`);
  return res.json();
}

export async function fetchProjects(
  page: number = 1,
  pageSize: number = 20,
  sector?: string,
  state?: string,
  riskCategory?: string,
  search?: string
): Promise<ProjectListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString()
  });
  if (sector) params.append('sector', sector);
  if (state) params.append('state', state);
  if (riskCategory) params.append('risk_category', riskCategory);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/api/projects?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch projects (${res.status})`);
  return res.json();
}

export async function fetchProjectDetail(projectCode: string): Promise<ProjectDetail> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}`);
  if (!res.ok) throw new Error(`Failed to fetch project detail (${res.status})`);
  return res.json();
}

export async function fetchProjectExplanation(projectCode: string): Promise<ExplanationResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/explanation`);
  if (!res.ok) throw new Error(`Failed to fetch project explanation (${res.status})`);
  return res.json();
}

export async function fetchGeoProjects(): Promise<GeoProjectItem[]> {
  const res = await fetch(`${API_BASE}/api/geo/projects`);
  if (!res.ok) throw new Error(`Failed to fetch geo projects (${res.status})`);
  return res.json();
}

export async function fetchProjectInterventions(projectCode: string): Promise<Intervention[]> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/interventions`);
  if (!res.ok) throw new Error(`Failed to fetch interventions (${res.status})`);
  return res.json();
}

export async function createIntervention(
  projectCode: string,
  interventionType: string,
  notes: string
): Promise<Intervention> {
  const res = await fetch(`${API_BASE}/api/interventions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      project_code: projectCode,
      intervention_type: interventionType,
      notes: notes
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to record intervention' }));
    throw new Error(err.detail || `Failed to record intervention (${res.status})`);
  }
  return res.json();
}

export async function fetchAuditLogs(limit: number = 50): Promise<AuditLogListResponse> {
  const res = await fetch(`${API_BASE}/api/audit-logs?limit=${limit}`, {
    headers: authHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch audit logs' }));
    throw new Error(err.detail || `Failed to fetch audit logs (${res.status})`);
  }
  return res.json();
}



// ----------------- Phase 6: Simulation & Statutory Callers -----------------

export async function simulateProject(
  projectCode: string,
  levers: SimulationRequest
): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(levers)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Simulation failed' }));
    throw new Error(err.detail || `Simulation failed (${res.status})`);
  }
  return res.json();
}

export async function simulateCustomProject(
  request: CustomProjectSimulationRequest
): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE}/api/simulation/custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Custom simulation failed' }));
    throw new Error(err.detail || `Custom simulation failed (${res.status})`);
  }
  return res.json();
}

export async function fetchStatutoryAssessment(
  projectCode: string
): Promise<StatutoryAssessmentResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/statutory`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to load statutory assessment' }));
    throw new Error(err.detail || `Statutory query failed (${res.status})`);
  }
  return res.json();
}

export async function generateStatutoryNotice(
  projectCode: string,
  recipientTitle: string,
  customInstructions: string
): Promise<NoticeDraftResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/statutory/notice`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      recipient_title: recipientTitle,
      custom_instructions: customInstructions
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to draft notice' }));
    throw new Error(err.detail || `Notice generation failed (${res.status})`);
  }
  return res.json();
}

// ----------------- Phase 7: Survival Analysis Caller -----------------

export async function fetchProjectSurvival(
  projectCode: string
): Promise<SurvivalResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectCode)}/survival`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to load survival curve' }));
    throw new Error(err.detail || `Survival query failed (${res.status})`);
  }
  return res.json();
}

// ----------------- Phase 8: Geospatial Corridor Callers -----------------

export async function fetchSampleCorridors(): Promise<SampleCorridorItem[]> {
  const res = await fetch(`${API_BASE}/api/geo/corridors/sample`);
  if (!res.ok) throw new Error(`Failed to load corridors (${res.status})`);
  return res.json();
}

export async function analyzeCorridorRoute(
  coordinates: [number, number][],
  sector: string,
  state: string,
  name: string
): Promise<CorridorAnalysisResponse> {
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Corridor analysis failed' }));
    throw new Error(err.detail || `Corridor analysis failed (${res.status})`);
  }
  return res.json();
}

// ----------------- Phase 9: Infrastructure Contagion Callers -----------------

export async function fetchContagionNetwork(): Promise<GraphNetworkResponse> {
  const res = await fetch(`${API_BASE}/api/graph/network`);
  if (!res.ok) throw new Error(`Failed to fetch network graph (${res.status})`);
  return res.json();
}

export async function simulateContagionCascade(
  epicenterProjectCode: string,
  delayShockMonths: number = 18
): Promise<CascadeResponse> {
  const res = await fetch(`${API_BASE}/api/graph/cascade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      epicenter_project_code: epicenterProjectCode,
      delay_shock_months: delayShockMonths
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Cascade simulation failed' }));
    throw new Error(err.detail || `Cascade simulation failed (${res.status})`);
  }
  return res.json();
}
