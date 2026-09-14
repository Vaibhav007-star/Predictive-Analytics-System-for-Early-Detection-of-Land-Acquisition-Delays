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

