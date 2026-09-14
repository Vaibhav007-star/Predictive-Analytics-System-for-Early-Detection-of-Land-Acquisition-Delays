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
