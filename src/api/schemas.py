"""
Pydantic Request & Response Schemas for SIH26017 FastAPI Backend.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ProjectSummary(BaseModel):
    project_code: str
    project_name: str
    sector: str
    agency: str
    state: str
    orig_cost_cr: float
    approval_date: Optional[str] = None
    orig_commissioning_date: Optional[str] = None
    ant_commissioning_date: Optional[str] = None
    delay_months: Optional[int] = None
    is_delayed: int
    risk_score: Optional[int] = None
    risk_category: Optional[str] = None
    badge_color: Optional[str] = None

class ProjectListResponse(BaseModel):
    total_projects: int
    page: int
    page_size: int
    total_pages: int
    projects: List[ProjectSummary]

class ProjectDetail(BaseModel):
    project_code: str
    project_name: str
    sector: str
    agency: str
    state: str
    approval_date: Optional[str] = None
    orig_commissioning_date: Optional[str] = None
    rev_commissioning_date: Optional[str] = None
    ant_commissioning_date: Optional[str] = None
    orig_cost_cr: float
    rev_cost_cr: Optional[float] = None
    ant_cost_cr: Optional[float] = None
    cumulative_exp_cr: Optional[float] = None
    physical_progress_pct: Optional[float] = None
    delay_months: Optional[int] = None
    is_delayed: int
    cost_overrun_pct: Optional[float] = None
    expenditure_ratio: Optional[float] = None
    source_dataset: str
    # Risk Profile
    risk_score: Optional[int] = None
    risk_category: Optional[str] = None
    badge_color: Optional[str] = None
    probability: Optional[float] = None
    recommended_action: Optional[str] = None
    # Geo
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geo_precision: Optional[str] = None

class RiskDriverItem(BaseModel):
    feature: str
    shap_value: float
    direction: str
    explanation: str

class RiskProfileResponse(BaseModel):
    project_code: str
    project_name: str
    risk_score: int
    risk_category: str
    badge_label: str
    badge_color: str
    probability: float
    description: str
    recommended_action: str
    available: bool = True

class ExplanationResponse(BaseModel):
    project_code: str
    project_name: str
    risk_score: int
    risk_category: str
    badge_color: str
    top_risk_drivers: List[RiskDriverItem]
    top_mitigating_factors: List[RiskDriverItem]
    recommended_action: str
    disclaimer: str

class RisksSummaryResponse(BaseModel):
    total_projects: int
    delayed_projects_count: int
    ontime_projects_count: int
    overall_delay_rate_pct: float
    counts_by_risk_category: Dict[str, int]
    percentages_by_risk_category: Dict[str, float]
    priority_queue: List[ProjectSummary]

class GeoProjectItem(BaseModel):
    project_code: str
    project_name: str
    sector: str
    agency: str
    state: str
    orig_cost_cr: float
    delay_months: int
    risk_score: int
    risk_category: str
    badge_color: str
    latitude: float
    longitude: float
    geo_precision: str

# ----------------- Phase 5: Auth & Audit Schemas -----------------

class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    username: str
    name: str
    role: str
    department: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

class InterventionCreate(BaseModel):
    project_code: str
    intervention_type: str = Field(..., description="Action category, e.g., 'SLAO Deployment', 'Collector Review'")
    notes: str = Field(..., min_length=5, description="Administrative justification and operational details")

class InterventionResponse(BaseModel):
    id: int
    project_code: str
    username: str
    role: str
    intervention_type: str
    notes: str
    timestamp: str

class AuditLogItem(BaseModel):
    id: int
    timestamp: str
    username: str
    role: str
    action: str
    project_code: Optional[str] = None
    details: str

class AuditLogListResponse(BaseModel):
    total: int
    items: List[AuditLogItem]



# ----------------- Phase 6: Simulation & Statutory Schemas -----------------

class SimulationRequest(BaseModel):
    package_split_count: int = Field(1, ge=1, le=10, description="Number of civil construction packages to split the contract into")
    contingency_budget_pct: float = Field(0.0, ge=0.0, le=50.0, description="Additional contingency budget percentage allocated (0-50%)")
    dedicated_slao_taskforce: bool = Field(False, description="Whether a dedicated Special Land Acquisition Officer taskforce is deployed")
    parallel_statutory_hearings: bool = Field(False, description="Whether Section 11 and 15 hearings are executed in parallel")
    row_pre_possession_pct: float = Field(50.0, ge=10.0, le=100.0, description="Percentage of contiguous Right-of-Way pre-possessed prior to appointed date")
    execution_buffer_months: int = Field(0, ge=0, le=36, description="Execution buffer months added to planned schedule")

class CustomProjectSimulationRequest(BaseModel):
    sector: str = Field(..., description="Infrastructure sector, e.g. 'ROAD TRANSPORT AND HIGHWAYS'")
    state: str = Field(..., description="Indian State or Union Territory")
    agency: str = Field("NHAI", description="Implementing agency")
    orig_cost_cr: float = Field(..., gt=0, description="Original sanctioned capital cost in ₹ Crores")
    planned_duration_months: float = Field(..., gt=0, description="Planned construction duration in months")
    approval_year: int = Field(2024, ge=1990, le=2030, description="Year of administrative approval")
    simulation_levers: SimulationRequest = Field(default_factory=SimulationRequest)

class SimulationBaselineMetrics(BaseModel):
    risk_score: int
    risk_category: str
    risk_probability: float
    badge_color: str
    expected_delay_months: int

class SimulationMitigatedMetrics(BaseModel):
    risk_score: int
    risk_category: str
    risk_probability: float
    badge_color: str
    expected_delay_months: int

class SimulationImpactMetrics(BaseModel):
    risk_score_delta: int
    probability_reduction_pct: float
    months_overrun_avoided: int
    capital_escalation_saved_cr: float

class LeverContributionItem(BaseModel):
    lever: str
    relative_impact_points: int
    description: str

class SimulationResponse(BaseModel):
    project_code: str
    project_name: str
    baseline: SimulationBaselineMetrics
    simulated: SimulationMitigatedMetrics
    metrics: SimulationImpactMetrics
    lever_breakdown: List[LeverContributionItem]
    policy_recommendations: List[str]

class StatutoryMilestoneItem(BaseModel):
    milestone_name: str
    section_reference: str
    status: str
    days_elapsed: int
    statutory_deadline_days: int
    is_critical_path: bool
    risk_notes: str

class StatutoryAssessmentResponse(BaseModel):
    project_code: str
    project_name: str
    state: str
    applicable_act: str
    current_phase: str
    statutory_compliance_score: int
    section_25_lapsing_risk: str
    milestones: List[StatutoryMilestoneItem]
    actionable_directives: List[str]

class NoticeDraftRequest(BaseModel):
    form_type: str = Field("Form 11", description="Statutory form code: 'Form 11', 'Form 15', 'Form 19', 'Form 21', 'Form 23'")
    district: str = Field(..., description="Target district for land acquisition notification")
    tehsil_or_taluk: Optional[str] = Field("HQ", description="Sub-district / Tehsil")
    notified_area_hectares: float = Field(..., gt=0, description="Total area under acquisition in hectares")
    issuing_authority: str = Field("District Collector & Competent Authority for Land Acquisition (CALA)", description="Official issuing designation")

class NoticeDraftResponse(BaseModel):
    project_code: str
    project_name: str
    form_type: str
    statutory_section: str
    gazette_title: str
    notice_text: str
    issuing_authority: str
    timestamp: str


# ----------------- Phase 7: Survival Analysis Schemas -----------------

class HazardPointItem(BaseModel):
    month: int
    survival_probability: float
    delay_probability: float
    cumulative_hazard: float
    monthly_hazard_rate: float

class PeakDangerWindowItem(BaseModel):
    window: str
    peak_month: int
    statutory_milestone: str
    description: str

class ProjectedDatesItem(BaseModel):
    original_target: str
    expected_completion: str
    confidence_range_80: str

class SurvivalForecastItem(BaseModel):
    expected_overrun_months: int
    confidence_interval_80_months: List[int]
    confidence_interval_95_months: List[int]
    projected_dates: Optional[ProjectedDatesItem] = None

class SurvivalResponse(BaseModel):
    weibull_parameters: Dict[str, float]
    hazard_curve: List[HazardPointItem]
    peak_danger_window: PeakDangerWindowItem
    forecasting: SurvivalForecastItem


# ----------------- Phase 8: Geospatial Corridor Schemas -----------------

class CorridorAnalysisRequest(BaseModel):
    coordinates: List[List[float]] = Field(..., description="Ordered list of [latitude, longitude] pairs")
    sector: str = Field("ROAD TRANSPORT AND HIGHWAYS", description="Infrastructure sector")
    state: str = Field("MAHARASHTRA", description="State or corridor region")
    name: str = Field("Custom Infrastructure Corridor", description="Corridor identification label")

class CorridorSegmentItem(BaseModel):
    segment_index: int
    start: List[float]
    end: List[float]
    length_km: float

class CorridorEnvironmentalMetrics(BaseModel):
    forest_overlap_pct: float
    forest_stretch_km: float
    river_crossings_count: int
    settlement_density_pct: float

class CorridorVulnerabilityAssessment(BaseModel):
    score: int
    tier: str
    badge_color: str
    summary: str

class CorridorRecommendationItem(BaseModel):
    category: str
    directive: str

class CorridorAnalysisResponse(BaseModel):
    name: str
    sector: str
    state: str
    total_distance_km: float
    waypoints_count: int
    coordinates: List[List[float]]
    segments: List[CorridorSegmentItem]
    environmental_metrics: CorridorEnvironmentalMetrics
    vulnerability_assessment: CorridorVulnerabilityAssessment
    corridor_recommendations: List[CorridorRecommendationItem]


# ----------------- Phase 9: Infrastructure Contagion Schemas -----------------

class GraphNodeItem(BaseModel):
    id: str
    label: str
    type: str
    color: str
    size: int
    details: str
    sector: Optional[str] = None
    state: Optional[str] = None
    agency: Optional[str] = None
    risk_score: Optional[int] = None
    orig_cost_cr: Optional[float] = None

class GraphLinkItem(BaseModel):
    source: str
    target: str
    relationship: str
    weight: float

class GraphNetworkResponse(BaseModel):
    total_nodes: int
    total_links: int
    nodes: List[GraphNodeItem]
    links: List[GraphLinkItem]

class CascadeRequest(BaseModel):
    epicenter_project_code: str
    delay_shock_months: int = Field(18, ge=1, le=60)

class CascadedProjectItem(BaseModel):
    project_code: str
    project_name: str
    agency: str
    sector: str
    secondary_delay_months: int
    contagion_pathway: str
    estimated_cost_escalation_cr: float

class CascadeSummaryItem(BaseModel):
    exposed_projects_count: int
    total_secondary_delay_months: int
    total_cascade_escalation_cr: float
    ripple_severity: str

class CascadeResponse(BaseModel):
    epicenter: Dict[str, Any]
    cascade_summary: CascadeSummaryItem
    cascaded_projects: List[CascadedProjectItem]
