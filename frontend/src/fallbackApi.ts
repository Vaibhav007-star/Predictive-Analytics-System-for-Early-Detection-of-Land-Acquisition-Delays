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
  AuditLogItem,
  SimulationRequest,
  CustomProjectSimulationRequest,
  SimulationResponse,
  StatutoryAssessmentResponse,
  NoticeDraftResponse,
  SurvivalResponse,
  SampleCorridorItem,
  CorridorAnalysisResponse,
  CorridorSegmentItem,
  GraphNetworkResponse,
  CascadeResponse
} from './types';

// Cache for loaded JSON datasets
let cachedRisksSummary: RisksSummaryResponse | null = null;
let cachedProjects: any[] | null = null;
let cachedGeoProjects: GeoProjectItem[] | null = null;
let cachedProjectDetails: Record<string, ProjectDetail> | null = null;
let cachedExplanations: Record<string, ExplanationResponse> | null = null;
let cachedContagionNetwork: GraphNetworkResponse | null = null;
let cachedSampleCorridors: SampleCorridorItem[] | null = null;

async function loadData<T>(path: string): Promise<T> {
  const res = await fetch(`/data/${path}`);
  if (!res.ok) {
    throw new Error(`Failed to load dataset: ${path}`);
  }
  return res.json();
}

// ----------------- Auth Fallback -----------------

export async function fallbackLoginUser(username: string, _password: string): Promise<AuthResponse> {
  const isAdmin = username.toLowerCase() !== 'viewer';
  const user: User = {
    username: isAdmin ? 'admin' : 'viewer',
    name: isAdmin ? 'MoRD Director General' : 'Public Auditor',
    role: isAdmin ? 'Admin' : 'Viewer',
    department: isAdmin ? 'Ministry of Rural Development' : 'Public Oversight Committee'
  };
  return {
    access_token: `mock-token-${Date.now()}`,
    token_type: 'bearer',
    user
  };
}

// ----------------- Risks Summary Fallback -----------------

export async function fallbackFetchRisksSummary(): Promise<RisksSummaryResponse> {
  if (!cachedRisksSummary) {
    cachedRisksSummary = await loadData<RisksSummaryResponse>('risksSummary.json');
  }
  return cachedRisksSummary;
}

// ----------------- Projects List Fallback -----------------

export async function fallbackFetchProjects(
  page: number = 1,
  pageSize: number = 20,
  sector?: string,
  state?: string,
  riskCategory?: string,
  search?: string
): Promise<ProjectListResponse> {
  if (!cachedProjects) {
    cachedProjects = await loadData<any[]>('projects.json');
  }

  let filtered = [...cachedProjects];

  if (sector && sector.trim()) {
    const s = sector.trim().toUpperCase();
    filtered = filtered.filter(p => (p.sector || '').toUpperCase() === s);
  }

  if (state && state.trim()) {
    const st = state.trim().toUpperCase();
    filtered = filtered.filter(p => (p.state || '').toUpperCase() === st);
  }

  if (riskCategory && riskCategory.trim()) {
    const rc = riskCategory.trim().toUpperCase();
    filtered = filtered.filter(p => (p.risk_category || '').toUpperCase() === rc);
  }

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter(
      p =>
        (p.project_code || '').toLowerCase().includes(term) ||
        (p.project_name || '').toLowerCase().includes(term) ||
        (p.agency || '').toLowerCase().includes(term)
    );
  }

  // Sort highest risk first
  filtered.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  return {
    total_projects: total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
    projects: pageItems
  };
}

// ----------------- Project Details Fallback -----------------

export async function fallbackFetchProjectDetail(projectCode: string): Promise<ProjectDetail> {
  if (!cachedProjectDetails) {
    cachedProjectDetails = await loadData<Record<string, ProjectDetail>>('projectDetails.json');
  }
  const code = projectCode.trim().toUpperCase();
  const detail = cachedProjectDetails[code];
  if (!detail) {
    throw new Error(`Project ${projectCode} not found`);
  }
  return detail;
}

// ----------------- Project Explanation Fallback -----------------

export async function fallbackFetchProjectExplanation(projectCode: string): Promise<ExplanationResponse> {
  if (!cachedExplanations) {
    cachedExplanations = await loadData<Record<string, ExplanationResponse>>('projectExplanations.json');
  }
  const code = projectCode.trim().toUpperCase();
  const expl = cachedExplanations[code];
  if (!expl) {
    throw new Error(`Explanation for ${projectCode} not found`);
  }
  return expl;
}

// ----------------- Geo Projects Fallback -----------------

export async function fallbackFetchGeoProjects(): Promise<GeoProjectItem[]> {
  if (!cachedGeoProjects) {
    cachedGeoProjects = await loadData<GeoProjectItem[]>('geoProjects.json');
  }
  return cachedGeoProjects;
}

// ----------------- Interventions Fallback (LocalStorage) -----------------

const INTERVENTIONS_STORAGE_KEY = 'sih26017_interventions_cache';

export async function fallbackFetchProjectInterventions(projectCode: string): Promise<Intervention[]> {
  try {
    const raw = localStorage.getItem(INTERVENTIONS_STORAGE_KEY);
    const list: Intervention[] = raw ? JSON.parse(raw) : [];
    return list.filter(i => (i.project_code || '').toUpperCase() === projectCode.trim().toUpperCase());
  } catch {
    return [];
  }
}

export async function fallbackCreateIntervention(
  projectCode: string,
  interventionType: string,
  notes: string,
  user?: User | null
): Promise<Intervention> {
  const item: Intervention = {
    id: Date.now(),
    project_code: projectCode.trim().toUpperCase(),
    timestamp: new Date().toISOString(),
    username: user?.username || 'admin',
    role: user?.role || 'Admin',
    intervention_type: interventionType,
    notes: notes
  };

  try {
    const raw = localStorage.getItem(INTERVENTIONS_STORAGE_KEY);
    const list: Intervention[] = raw ? JSON.parse(raw) : [];
    list.unshift(item);
    localStorage.setItem(INTERVENTIONS_STORAGE_KEY, JSON.stringify(list));

    // Also add to audit logs
    const auditRaw = localStorage.getItem('sih26017_audit_logs_cache');
    const auditList: AuditLogItem[] = auditRaw ? JSON.parse(auditRaw) : [];
    auditList.unshift({
      id: Date.now(),
      timestamp: item.timestamp,
      username: item.username,
      role: item.role,
      action: `RECORD_INTERVENTION_${interventionType}`,
      project_code: projectCode,
      details: `Project: ${projectCode} | Notes: ${notes}`
    });
    localStorage.setItem('sih26017_audit_logs_cache', JSON.stringify(auditList));
  } catch (err) {
    console.error('Failed to store intervention in localStorage:', err);
  }

  return item;
}

// ----------------- Audit Logs Fallback -----------------

export async function fallbackFetchAuditLogs(limit: number = 50): Promise<AuditLogListResponse> {
  try {
    const raw = localStorage.getItem('sih26017_audit_logs_cache');
    let list: AuditLogItem[] = raw ? JSON.parse(raw) : [];
    if (list.length === 0) {
      list = [
        {
          id: 101,
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          username: 'admin',
          role: 'Admin',
          action: 'SYSTEM_CALIBRATION_SHAP',
          project_code: 'PORTFOLIO_WIDE',
          details: 'Verified Gradient Boosting ROC-AUC 0.9425 calibration against 1,477 MoSPI records'
        },
        {
          id: 102,
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          username: 'admin',
          role: 'Admin',
          action: 'STATUTORY_COMPLIANCE_AUDIT',
          project_code: 'PORTFOLIO_WIDE',
          details: 'Executed RFCTLARR Section 25 lapsing review across High/Critical assets'
        }
      ];
      localStorage.setItem('sih26017_audit_logs_cache', JSON.stringify(list));
    }
    return {
      total: list.length,
      items: list.slice(0, limit)
    };
  } catch {
    return { total: 0, items: [] };
  }
}

// ----------------- Policy Simulation Fallback -----------------

export async function fallbackSimulateProject(
  projectCode: string,
  levers: SimulationRequest
): Promise<SimulationResponse> {
  const detail = await fallbackFetchProjectDetail(projectCode);
  const baseScore = detail.risk_score || 70;
  const origCost = detail.orig_cost_cr || 500;

  let simScore = baseScore;
  const splitCount = levers.package_split_count || 1;
  if (splitCount > 1) {
    simScore -= Math.min(14, splitCount * 4);
  }
  if (levers.dedicated_slao_taskforce) {
    simScore -= 10;
  }
  if ((levers.row_pre_possession_pct || 0) >= 80) {
    simScore -= 12;
  }
  if (levers.parallel_statutory_hearings) {
    simScore -= 8;
  }
  if ((levers.contingency_budget_pct || 0) > 0) {
    simScore -= Math.min(10, Math.round(levers.contingency_budget_pct * 0.8));
  }
  if ((levers.execution_buffer_months || 0) > 0) {
    simScore -= Math.min(8, Math.round((levers.execution_buffer_months || 0) * 0.7));
  }

  simScore = Math.max(12, Math.min(98, Math.round(simScore)));

  const baseCat: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = detail.risk_category || 'HIGH';
  const simCat: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
    simScore <= 35 ? 'LOW' : simScore <= 60 ? 'MEDIUM' : simScore <= 80 ? 'HIGH' : 'CRITICAL';
  const simColor =
    simScore <= 35 ? '#10B981' : simScore <= 60 ? '#F59E0B' : simScore <= 80 ? '#F97316' : '#EF4444';

  const baseMonths = Math.max(0, Math.round((baseScore / 100) * 42));
  const simMonths = Math.max(0, Math.round((simScore / 100) * 42));
  const monthsSaved = Math.max(0, baseMonths - simMonths);
  const capitalSaved = Math.round(origCost * 0.0045 * monthsSaved * 100) / 100;

  const leversBreakdown: any[] = [];
  if (splitCount > 1) {
    leversBreakdown.push({
      lever: `Package Splitting (${splitCount} lots)`,
      description: 'Reduces single-point contractor default and distributes Right-of-Way risk.',
      relative_impact_points: Math.min(14, splitCount * 4)
    });
  }
  if (levers.dedicated_slao_taskforce) {
    leversBreakdown.push({
      lever: 'Dedicated SLAO & Joint Survey Cell',
      description: 'Expedites Section 11/19 land measurement and district court coordination.',
      relative_impact_points: 10
    });
  }
  if ((levers.row_pre_possession_pct || 0) >= 80) {
    leversBreakdown.push({
      lever: `${levers.row_pre_possession_pct}% Contiguous RoW Pre-Handover`,
      description: 'Prevents contractor idling claims and ensures uninterrupted civil mobilization.',
      relative_impact_points: 12
    });
  }
  if (levers.parallel_statutory_hearings) {
    leversBreakdown.push({
      lever: 'Parallel Section 11/15 Statutory Processing',
      description: 'Concurrent objection disposal saves up to 4 months of sequential procedural latency.',
      relative_impact_points: 8
    });
  }

  return {
    project_code: projectCode,
    project_name: detail.project_name,
    baseline: {
      risk_score: baseScore,
      risk_category: baseCat,
      probability: detail.probability || baseScore / 100,
      badge_color: detail.badge_color || '#EF4444',
      estimated_delay_months: baseMonths
    },
    simulated: {
      risk_score: simScore,
      risk_category: simCat,
      probability: simScore / 100,
      badge_color: simColor,
      estimated_delay_months: simMonths
    },
    metrics: {
      risk_score_delta: baseScore - simScore,
      percentage_reduction: Math.round(((baseScore - simScore) / Math.max(1, baseScore)) * 1000) / 10,
      months_overrun_avoided: monthsSaved,
      capital_escalation_saved_cr: capitalSaved
    },
    lever_breakdown: leversBreakdown
  };
}

export async function fallbackSimulateCustomProject(
  request: CustomProjectSimulationRequest
): Promise<SimulationResponse> {
  const levers = request.simulation_levers || {};
  let simScore = 72;
  const splitCount = levers.package_split_count || 1;
  if (splitCount > 1) {
    simScore -= Math.min(14, splitCount * 4);
  }
  if (levers.dedicated_slao_taskforce) {
    simScore -= 10;
  }
  if ((levers.row_pre_possession_pct || 0) >= 80) {
    simScore -= 12;
  }
  if (levers.parallel_statutory_hearings) {
    simScore -= 8;
  }
  if ((levers.contingency_budget_pct || 0) > 0) {
    simScore -= Math.min(10, Math.round(levers.contingency_budget_pct * 0.8));
  }
  if ((levers.execution_buffer_months || 0) > 0) {
    simScore -= Math.min(8, Math.round((levers.execution_buffer_months || 0) * 0.7));
  }

  simScore = Math.max(12, Math.min(98, Math.round(simScore)));
  const simCat: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
    simScore <= 35 ? 'LOW' : simScore <= 60 ? 'MEDIUM' : simScore <= 80 ? 'HIGH' : 'CRITICAL';
  const simColor =
    simScore <= 35 ? '#10B981' : simScore <= 60 ? '#F59E0B' : simScore <= 80 ? '#F97316' : '#EF4444';

  const baseMonths = Math.max(0, Math.round((72 / 100) * 42));
  const simMonths = Math.max(0, Math.round((simScore / 100) * 42));
  const monthsSaved = Math.max(0, baseMonths - simMonths);
  const capitalSaved = Math.round(request.orig_cost_cr * 0.0045 * monthsSaved * 100) / 100;

  return {
    project_code: 'CUSTOM_PROPOSAL',
    project_name: `Proposed ${request.sector} Project (${request.state})`,
    baseline: {
      risk_score: 72,
      risk_category: 'HIGH',
      probability: 0.72,
      badge_color: '#F97316',
      estimated_delay_months: baseMonths
    },
    simulated: {
      risk_score: simScore,
      risk_category: simCat,
      probability: simScore / 100,
      badge_color: simColor,
      estimated_delay_months: simMonths
    },
    metrics: {
      risk_score_delta: 72 - simScore,
      percentage_reduction: Math.round(((72 - simScore) / 72) * 1000) / 10,
      months_overrun_avoided: monthsSaved,
      capital_escalation_saved_cr: capitalSaved
    },
    lever_breakdown: [
      {
        lever: 'Policy Mitigation Levers Combined',
        description: 'Applied operational governance, RoW pre-possession, and statutory parallelization.',
        relative_impact_points: 72 - simScore
      }
    ]
  };
}

// ----------------- Statutory Assessment Fallback -----------------

export async function fallbackFetchStatutoryAssessment(
  projectCode: string
): Promise<StatutoryAssessmentResponse> {
  const detail = await fallbackFetchProjectDetail(projectCode);
  const delayMonths = detail.delay_months || 0;
  const isHighRisk = (detail.risk_score || 0) >= 70;

  const stage =
    delayMonths > 24
      ? 'Section 25 (Award Determination / Lapsing Threat)'
      : delayMonths > 10 || isHighRisk
      ? 'Section 19 to Section 23 (Joint Measurement & Valuation)'
      : 'Section 11 to Section 15 (Preliminary Notification & Objections)';

  const lapsingLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
    delayMonths > 24 ? 'CRITICAL' : delayMonths > 10 ? 'HIGH' : 'LOW';
  const lapsingScore = delayMonths > 24 ? 92 : delayMonths > 10 ? 68 : 28;

  return {
    project_code: projectCode,
    project_name: detail.project_name,
    state: detail.state,
    sector: detail.sector,
    current_statutory_stage: stage,
    stage_description: `Statutory milestone analysis for ${detail.sector} project in ${detail.state}. Compliance monitored under RFCTLARR Act 2013.`,
    lapsing_risk_level: lapsingLevel,
    lapsing_risk_score: lapsingScore,
    section_25_deadline_flag: delayMonths > 24,
    urgency_clause_eligible: detail.sector === 'ROAD TRANSPORT AND HIGHWAYS' || detail.sector === 'RAILWAYS',
    statutory_directives: [
      {
        statutory_ref: 'RFCTLARR Sec 19(7)',
        title: 'Section 19 Gazette Publication',
        directive: 'Publish final land acquisition declaration within 12 months of Section 11 notice.',
        urgency: 'HIGH'
      },
      {
        statutory_ref: 'RFCTLARR Sec 25',
        title: 'Section 25 Award Deadline',
        directive: 'Collector MUST pronounce award within 12 months of Section 19 declaration to prevent lapsing.',
        urgency: delayMonths > 24 ? 'CRITICAL' : 'HIGH'
      },
      {
        statutory_ref: 'RFCTLARR Sec 40(3)',
        title: 'Section 40 Urgency Pre-deposit',
        directive: 'Tender 80% estimated compensation prior to taking physical encumbrance-free possession.',
        urgency: 'MEDIUM'
      }
    ],
    multiplier_framework: 'State Multiplier Matrix 1.5x - 2.0x for rural land parcels + 100% Solatium',
    evaluation_timestamp: new Date().toISOString()
  };
}

export async function fallbackGenerateStatutoryNotice(
  projectCode: string,
  recipientTitle: string,
  customInstructions: string
): Promise<NoticeDraftResponse> {
  const detail = await fallbackFetchProjectDetail(projectCode);
  const nowStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const draftText = `GOVERNMENT OF INDIA
MINISTRY OF RURAL DEVELOPMENT / STATE REVENUE DEPARTMENT
LAND ACQUISITION & SETTLEMENT WING

OFFICIAL STATUTORY NOTICE (RFCTLARR ACT, 2013)
Ref: SIH26017/STATUTORY/${projectCode}/${new Date().getFullYear()}
Date: ${nowStr}

To,
${recipientTitle || 'The Competent Authority for Land Acquisition (CALA) / District Collector'}
District Revenue Office, ${detail.state}

SUBJECT: URGENT COMPLIANCE AND EXPEDITION OF LAND POSSESSION FOR ${detail.project_name} (CODE: ${projectCode})

Sir / Madam,

1. WHEREAS, the Central Sector Infrastructure Project "${detail.project_name}" (Project Code: ${projectCode}) sanctioned under the ${detail.sector} sector at an outlay of Rs. ${detail.orig_cost_cr} Crore is currently experiencing gestation timeline friction of ${detail.delay_months || 'significant'} months.

2. WHEREAS, statutory timelines under the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act, 2013 impose strict statutory limitation, notably under Section 19(7) and Section 25.

3. SPECIAL DIRECTIVE:
${customInstructions || 'You are hereby directed to convene an immediate joint measurement survey with the implementing agency Project Director and CALA to finalize the award within fifteen (15) calendar days, preventing statutory lapsing under Section 25.'}

4. Failure to publish the statutory award prior to the limitation date will risk lapsing of acquisition proceedings, causing substantial capital escalation and delay to the national infrastructure pipeline.

ISSUED UNDER THE HAND AND SEAL OF THE APPOINTING AUTHORITY,
MINISTRY OF RURAL DEVELOPMENT, GOVERNMENT OF INDIA.`;

  return {
    formatted_document: draftText,
    memo_number: `MoRD/RFCTLARR/${projectCode}/${new Date().getFullYear()}`,
    date: nowStr
  };
}

// ----------------- Survival Analysis Fallback -----------------

export async function fallbackFetchProjectSurvival(projectCode: string): Promise<SurvivalResponse> {
  const detail = await fallbackFetchProjectDetail(projectCode);
  const score = detail.risk_score || 50;
  const plannedDuration = 36;
  const isLinear = detail.sector === 'ROAD TRANSPORT AND HIGHWAYS' || detail.sector === 'RAILWAYS';

  const k = 1.95 + (isLinear ? 0.35 : 0.1) + (score >= 75 ? 0.2 : 0.0);
  const riskFactor = Math.max(0.2, (100 - score * 0.65) / 100);
  const lam = Math.max(12.0, plannedDuration * riskFactor * 1.1);

  const hazardPoints: any[] = [];
  let peakWindowStart = 18;
  let peakWindowEnd = 36;
  let maxHazard = 0;
  let peakMonth = 24;

  for (let m = 1; m <= 60; m++) {
    const tRatio = m / lam;
    const exponent = Math.pow(tRatio, k);
    const st = Math.max(0.001, Math.min(0.999, Math.exp(-Math.min(25.0, exponent))));
    const instantHazard = (k / lam) * Math.pow(tRatio, Math.max(0, k - 1));

    if (instantHazard > maxHazard) {
      maxHazard = instantHazard;
      peakMonth = m;
      peakWindowStart = Math.max(1, m - 4);
      peakWindowEnd = Math.min(60, m + 4);
    }

    hazardPoints.push({
      month: m,
      survival_probability: Math.round(st * 1000) / 1000,
      delay_probability: Math.round((1 - st) * 1000) / 1000,
      cumulative_hazard: Math.round(exponent * 1000) / 1000,
      monthly_hazard_rate: Math.round(instantHazard * 10000) / 10000
    });
  }

  const expectedOverrun = Math.round(lam * Math.pow(Math.LN2, 1 / k));

  return {
    weibull_parameters: {
      shape_k: Math.round(k * 100) / 100,
      scale_lambda_months: Math.round(lam * 10) / 10
    },
    hazard_curve: hazardPoints,
    peak_danger_window: {
      window: `${peakWindowStart} - ${peakWindowEnd} Months`,
      peak_month: peakMonth,
      statutory_milestone: 'Section 19 Declaration to Section 25 Award Phase',
      description: 'Maximum procedural failure hazard concentrated during joint land survey and solatium disbursement.'
    },
    forecasting: {
      expected_overrun_months: expectedOverrun,
      confidence_interval_80_months: [Math.max(6, expectedOverrun - 6), expectedOverrun + 10],
      confidence_interval_95_months: [Math.max(3, expectedOverrun - 10), expectedOverrun + 18],
      projected_dates: {
        original_target: detail.orig_commissioning_date || '2025-06-01',
        expected_completion: detail.ant_commissioning_date || '2026-12-01',
        confidence_range_80: 'Q2 2026 - Q1 2027'
      }
    }
  };
}

// ----------------- Geospatial Corridor Fallback -----------------

export async function fallbackFetchSampleCorridors(): Promise<SampleCorridorItem[]> {
  if (!cachedSampleCorridors) {
    cachedSampleCorridors = await loadData<SampleCorridorItem[]>('sampleCorridors.json');
  }
  return cachedSampleCorridors;
}

function haversineKm(c1: [number, number], c2: [number, number]): number {
  const r = 6371.0;
  const dLat = ((c2[0] - c1[0]) * Math.PI) / 180.0;
  const dLng = ((c2[1] - c1[1]) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((c1[0] * Math.PI) / 180.0) * Math.cos((c2[0] * Math.PI) / 180.0) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fallbackAnalyzeCorridorRoute(
  coordinates: [number, number][],
  sector: string,
  state: string,
  name: string
): Promise<CorridorAnalysisResponse> {
  let totalKm = 0;
  const segments: CorridorSegmentItem[] = [];
  for (let i = 0; i < coordinates.length - 1; i++) {
    const dist = haversineKm(coordinates[i], coordinates[i + 1]);
    totalKm += dist;
    segments.push({
      segment_index: i + 1,
      start: coordinates[i],
      end: coordinates[i + 1],
      length_km: Math.round(dist * 10) / 10
    });
  }
  totalKm = Math.round(totalKm * 10) / 10;

  const isLinear = sector.toUpperCase().includes('ROAD') || sector.toUpperCase().includes('RAIL');
  const forestOverlapPct = Math.min(42.0, Math.round((coordinates.length * 2.8 + (isLinear ? 12 : 5)) * 10) / 10);
  const riverCrossings = Math.max(1, Math.round(totalKm / 110));
  const frictionScore = Math.min(95, Math.round(45 + forestOverlapPct * 0.7 + riverCrossings * 2));

  return {
    name: name || 'Custom Route Alignment',
    sector: sector,
    state: state,
    total_distance_km: totalKm,
    waypoints_count: coordinates.length,
    coordinates: coordinates,
    segments: segments,
    environmental_metrics: {
      forest_overlap_pct: forestOverlapPct,
      forest_stretch_km: Math.round(((totalKm * forestOverlapPct) / 100) * 10) / 10,
      river_crossings_count: riverCrossings,
      settlement_density_pct: 32.5
    },
    vulnerability_assessment: {
      score: frictionScore,
      tier: frictionScore >= 75 ? 'CRITICAL_FRICTION' : frictionScore >= 55 ? 'HIGH_FRICTION' : 'MODERATE_FRICTION',
      badge_color: frictionScore >= 75 ? '#EF4444' : frictionScore >= 55 ? '#F97316' : '#F59E0B',
      summary: `Alignment traverses ${totalKm} km with ${forestOverlapPct}% forest buffer intersection and ${riverCrossings} major hydrologic crossings.`
    },
    corridor_recommendations: [
      {
        category: 'Statutory RoW Clearance',
        directive: 'Convene joint Stage-I forest diversion review under Parivesh portal.'
      },
      {
        category: 'Hydrologic Bridges',
        directive: 'Obtain Central Ground Water Authority & Irrigation Department NOCs for river piers.'
      }
    ]
  };
}

// ----------------- Contagion Network Fallback -----------------

export async function fallbackFetchContagionNetwork(): Promise<GraphNetworkResponse> {
  if (!cachedContagionNetwork) {
    cachedContagionNetwork = await loadData<GraphNetworkResponse>('contagionNetwork.json');
  }
  return cachedContagionNetwork;
}

export async function fallbackSimulateContagionCascade(
  epicenterProjectCode: string,
  delayShockMonths: number = 18
): Promise<CascadeResponse> {
  const network = await fallbackFetchContagionNetwork();
  const epicenterNode = network.nodes.find(n => n.id === epicenterProjectCode) || network.nodes[0];

  const connectedNodes = network.nodes
    .filter(
      n =>
        n.type === 'PROJECT' &&
        n.id !== epicenterNode.id &&
        (n.state === epicenterNode.state || n.agency === epicenterNode.agency)
    )
    .slice(0, 5);

  let secondaryMonths = 0;
  let escalationCr = 0;
  const cascadedProjects: any[] = [];

  for (const target of connectedNodes) {
    const isSameAgency = target.agency === epicenterNode.agency;
    const isSameState = target.state === epicenterNode.state;
    const damping = isSameAgency && isSameState ? 0.65 : isSameAgency ? 0.45 : 0.35;
    const pathway =
      isSameAgency && isSameState
        ? 'Direct Shared Contractor & CALA Taskforce'
        : isSameAgency
        ? `Agency Resource Congestion (${epicenterNode.agency})`
        : `State Administrative Precedent (${epicenterNode.state})`;

    const secDelay = Math.max(3, Math.round(delayShockMonths * damping));
    const targetCost = target.orig_cost_cr || 400;
    const escalation = Math.round(secDelay * 0.008 * targetCost * 100) / 100;

    secondaryMonths += secDelay;
    escalationCr += escalation;

    cascadedProjects.push({
      project_code: target.id,
      project_name: target.label.replace(/^\[[^\]]+\]\s*/, ''),
      agency: target.agency || 'NHAI',
      sector: target.sector || 'ROAD TRANSPORT AND HIGHWAYS',
      secondary_delay_months: secDelay,
      contagion_pathway: pathway,
      estimated_cost_escalation_cr: escalation
    });
  }

  return {
    epicenter: {
      project_code: epicenterNode.id,
      project_name: epicenterNode.label.replace(/^\[[^\]]+\]\s*/, ''),
      agency: epicenterNode.agency || 'NHAI',
      state: epicenterNode.state || 'NATIONAL',
      orig_cost_cr: epicenterNode.orig_cost_cr || 500,
      delay_shock_months: delayShockMonths
    },
    cascade_summary: {
      exposed_projects_count: cascadedProjects.length,
      total_secondary_delay_months: secondaryMonths,
      total_cascade_escalation_cr: Math.round(escalationCr * 100) / 100,
      ripple_severity: secondaryMonths > 24 ? 'SEVERE_PORTFOLIO_CONTAGION' : 'MODERATE_RIPPLE'
    },
    cascaded_projects: cascadedProjects
  };
}
