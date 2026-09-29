export interface ProjectSummary {
  project_code: string;
  project_name: string;
  sector: string;
  agency: string;
  state: string;
  orig_cost_cr: number;
  approval_date?: string;
  orig_commissioning_date?: string;
  ant_commissioning_date?: string;
  delay_months?: number;
  is_delayed: number;
  risk_score?: number;
  risk_category?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  badge_color?: string;
}

export interface ProjectListResponse {
  total_projects: number;
  page: number;
  page_size: number;
  total_pages: number;
  projects: ProjectSummary[];
}

export interface ProjectDetail extends ProjectSummary {
  rev_commissioning_date?: string;
  rev_cost_cr?: number;
  ant_cost_cr?: number;
  cumulative_exp_cr?: number;
  physical_progress_pct?: number;
  cost_overrun_pct?: number;
  expenditure_ratio?: number;
  source_dataset: string;
  probability?: number;
  recommended_action?: string;
  latitude?: number;
  longitude?: number;
  geo_precision?: string;
}

export interface RiskDriverItem {
  feature: string;
  shap_value: number;
  direction: 'ELEVATES_RISK' | 'MITIGATES_RISK';
  explanation: string;
}

export interface ExplanationResponse {
  project_code: string;
  project_name: string;
  risk_score: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  badge_color: string;
  top_risk_drivers: RiskDriverItem[];
  top_mitigating_factors: RiskDriverItem[];
  recommended_action: string;
  disclaimer: string;
}

export interface RisksSummaryResponse {
  total_projects: number;
  delayed_projects_count: number;
  ontime_projects_count: number;
  overall_delay_rate_pct: number;
  counts_by_risk_category: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  percentages_by_risk_category: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  priority_queue: ProjectSummary[];
}

export interface GeoProjectItem {
  project_code: string;
  project_name: string;
  sector: string;
  agency: string;
  state: string;
  orig_cost_cr: number;
  delay_months: number;
  risk_score: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  badge_color: string;
  latitude: number;
  longitude: number;
  geo_precision: string;
}

export interface User {
  username: string;
  name: string;
  role: 'Admin' | 'Viewer';
  department: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Intervention {
  id: number;
  project_code: string;
  username: string;
  role: string;
  intervention_type: string;
  notes: string;
  timestamp: string;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  project_code?: string | null;
  details: string;
}

export interface AuditLogListResponse {
  total: number;
  items: AuditLogItem[];
}



// ----------------- Phase 6: Simulation & Statutory Types -----------------

export interface SimulationRequest {
  package_split_count: number;
  contingency_budget_pct: number;
  dedicated_slao_taskforce: boolean;
  parallel_statutory_hearings: boolean;
  row_pre_possession_pct: number;
  execution_buffer_months: number;
}

export interface CustomProjectSimulationRequest {
  sector: string;
  state: string;
  agency: string;
  orig_cost_cr: number;
  planned_duration_months: number;
  approval_year: number;
  simulation_levers: SimulationRequest;
}

export interface LeverContributionItem {
  lever: string;
  relative_impact_points: number;
  description: string;
}

export interface SimulationResponse {
  project_code: string;
  project_name: string;
  baseline: {
    risk_score: number;
    risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    probability: number;
    badge_color: string;
    estimated_delay_months: number;
  };
  simulated: {
    risk_score: number;
    risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    probability: number;
    badge_color: string;
    estimated_delay_months: number;
  };
  metrics: {
    risk_score_delta: number;
    percentage_reduction: number;
    months_overrun_avoided: number;
    capital_escalation_saved_cr: number;
  };
  lever_breakdown: LeverContributionItem[];
}

export interface StatutoryDirectiveItem {
  statutory_ref: string;
  title: string;
  directive: string;
  urgency: string;
}

export interface StatutoryAssessmentResponse {
  project_code: string;
  project_name: string;
  state: string;
  sector: string;
  current_statutory_stage: string;
  stage_description: string;
  lapsing_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lapsing_risk_score: number;
  section_25_deadline_flag: boolean;
  urgency_clause_eligible: boolean;
  statutory_directives: StatutoryDirectiveItem[];
  multiplier_framework: string;
  evaluation_timestamp: string;
}

export interface NoticeDraftResponse {
  formatted_document: string;
  memo_number?: string;
  date?: string;
}

// ----------------- Phase 7: Survival Analysis Types -----------------

export interface HazardPointItem {
  month: number;
  survival_probability: number;
  delay_probability: number;
  cumulative_hazard: number;
  monthly_hazard_rate: number;
}

export interface PeakDangerWindowItem {
  window: string;
  peak_month: number;
  statutory_milestone: string;
  description: string;
}

export interface ProjectedDatesItem {
  original_target: string;
  expected_completion: string;
  confidence_range_80: string;
}

export interface SurvivalForecastItem {
  expected_overrun_months: number;
  confidence_interval_80_months: [number, number];
  confidence_interval_95_months: [number, number];
  projected_dates: ProjectedDatesItem;
}

export interface SurvivalResponse {
  weibull_parameters: {
    shape_k: number;
    scale_lambda_months: number;
  };
  hazard_curve: HazardPointItem[];
  peak_danger_window: PeakDangerWindowItem;
  forecasting: SurvivalForecastItem;
}

// ----------------- Phase 8: Geospatial Corridor Types -----------------

export interface SampleCorridorItem {
  id: string;
  name: string;
  sector: string;
  state: string;
  description: string;
  coordinates: [number, number][];
}

export interface CorridorSegmentItem {
  segment_index: number;
  start: [number, number];
  end: [number, number];
  length_km: number;
}

export interface CorridorEnvironmentalMetrics {
  forest_overlap_pct: number;
  forest_stretch_km: number;
  river_crossings_count: number;
  settlement_density_pct: number;
}

export interface CorridorVulnerabilityAssessment {
  score: number;
  tier: string;
  badge_color: string;
  summary: string;
}

export interface CorridorRecommendationItem {
  category: string;
  directive: string;
}

export interface CorridorAnalysisResponse {
  name: string;
  sector: string;
  state: string;
  total_distance_km: number;
  waypoints_count: number;
  coordinates: [number, number][];
  segments: CorridorSegmentItem[];
  environmental_metrics: CorridorEnvironmentalMetrics;
  vulnerability_assessment: CorridorVulnerabilityAssessment;
  corridor_recommendations: CorridorRecommendationItem[];
}

// ----------------- Phase 9: Infrastructure Contagion Types -----------------

export interface GraphNodeItem {
  id: string;
  label: string;
  type: 'PROJECT' | 'AGENCY' | 'STATE';
  color: string;
  size: number;
  details: string;
  sector?: string;
  state?: string;
  agency?: string;
  risk_score?: number;
  orig_cost_cr?: number;
}

export interface GraphLinkItem {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

export interface GraphNetworkResponse {
  total_nodes: number;
  total_links: number;
  nodes: GraphNodeItem[];
  links: GraphLinkItem[];
}

export interface CascadedProjectItem {
  project_code: string;
  project_name: string;
  agency: string;
  sector: string;
  secondary_delay_months: number;
  contagion_pathway: string;
  estimated_cost_escalation_cr: number;
}

export interface CascadeSummaryItem {
  exposed_projects_count: number;
  total_secondary_delay_months: number;
  total_cascade_escalation_cr: number;
  ripple_severity: string;
}

export interface CascadeResponse {
  epicenter: {
    project_code: string;
    project_name: string;
    agency: string;
    state: string;
    orig_cost_cr: number;
    delay_shock_months: number;
  };
  cascade_summary: CascadeSummaryItem;
  cascaded_projects: CascadedProjectItem[];
}
