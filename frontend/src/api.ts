import type {
  ProjectListResponse,
  ProjectDetail,
  ExplanationResponse,
  RisksSummaryResponse,
  GeoProjectItem
} from './types';

const API_BASE = '';

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
