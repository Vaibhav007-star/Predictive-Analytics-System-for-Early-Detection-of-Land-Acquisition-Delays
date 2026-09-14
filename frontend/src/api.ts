import type {
  ProjectListResponse,
  ProjectDetail,
  ExplanationResponse,
  RisksSummaryResponse,
  GeoProjectItem,
  User,
  AuthResponse,
  Intervention,
  AuditLogListResponse
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

