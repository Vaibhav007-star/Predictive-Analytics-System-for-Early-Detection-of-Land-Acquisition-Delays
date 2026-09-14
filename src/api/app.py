"""
FastAPI Application for SIH26017.
Predictive Analytics System for Early Detection of Land Acquisition Delays.
"""

from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

from src.api.schemas import (
    ProjectListResponse,
    ProjectDetail,
    RiskProfileResponse,
    ExplanationResponse,
    RisksSummaryResponse,
    GeoProjectItem,
    LoginRequest,
    TokenResponse,
    UserProfile,
    InterventionCreate,
    InterventionResponse,
    AuditLogItem,
    AuditLogListResponse
)
from src.api.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    require_admin,
    User
)
from src.api.service import get_service

app = FastAPI(
    title="SIH26017: Land Acquisition Delay Predictive Analytics API",
    description="Ministry of Rural Development — Predictive Analytics System for Early Detection of Land Acquisition Delays.",
    version="1.0.0"
)


# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "system": "SIH26017: Land Acquisition Delay Early Detection System",
        "authority": "Ministry of Rural Development, Government of India",
        "status": "Operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

# 1. Projects Catalog (Both /projects and /api/projects)
@app.get("/projects", response_model=ProjectListResponse)
@app.get("/api/projects", response_model=ProjectListResponse)
def list_projects(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=200, description="Items per page"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    state: Optional[str] = Query(None, description="Filter by state"),
    risk_category: Optional[str] = Query(None, description="Filter by risk tier (LOW/MEDIUM/HIGH/CRITICAL)"),
    search: Optional[str] = Query(None, description="Search term for code or title")
):
    service = get_service()
    return service.get_projects(
        page=page,
        page_size=page_size,
        sector=sector,
        state=state,
        risk_category=risk_category,
        search=search
    )

# 2. Executive Risks Summary & Priority Queue
@app.get("/risks", response_model=RisksSummaryResponse)
@app.get("/api/risks", response_model=RisksSummaryResponse)
def get_risks_summary():
    service = get_service()
    return service.get_risks_summary()

# 3. GIS Map Coordinates
@app.get("/geo/projects", response_model=List[GeoProjectItem])
@app.get("/api/geo/projects", response_model=List[GeoProjectItem])
def get_geo_projects():
    service = get_service()
    return service.get_geo_projects()

# 4. Project Detail Sheet
@app.get("/projects/{project_code}", response_model=ProjectDetail)
@app.get("/api/projects/{project_code}", response_model=ProjectDetail)
def get_project_detail(project_code: str):
    service = get_service()
    detail = service.get_project_by_id(project_code)
    if detail is None:
        raise HTTPException(
            status_code=404,
            detail=f"Project '{project_code}' not found in authentic repository."
        )
    return detail

# 5. Project Risk Profile
@app.get("/projects/{project_code}/risk", response_model=RiskProfileResponse)
@app.get("/api/projects/{project_code}/risk", response_model=RiskProfileResponse)
def get_project_risk(project_code: str):
    service = get_service()
    risk = service.get_project_risk(project_code)
    if risk is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction unavailable — insufficient validated data"
        )
    return risk

# 6. Project SHAP Explainability & Plain-Language Decision Support
@app.get("/projects/{project_code}/explanation", response_model=ExplanationResponse)
@app.get("/api/projects/{project_code}/explanation", response_model=ExplanationResponse)
def get_project_explanation(project_code: str):
    service = get_service()
    expl = service.get_project_explanation(project_code, top_k=4)
    if expl is None:
        raise HTTPException(
            status_code=404,
            detail="Explanation unavailable — project not found."
        )
    return expl

# ----------------- Phase 5: Authentication & Session Routes -----------------

@app.post("/auth/login", response_model=TokenResponse)
@app.post("/api/auth/login", response_model=TokenResponse)
def login(creds: LoginRequest):
    user = authenticate_user(creds.username, creds.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. For demo: use admin/sih26017 or viewer/viewer123.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token = create_access_token(user)
    service = get_service()
    service.record_audit_log(
        username=user.username,
        role=user.role,
        action="USER_LOGIN",
        project_code=None,
        details=f"User {user.name} ({user.role}) authenticated successfully."
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "department": user.department
        }
    }

@app.get("/auth/me", response_model=UserProfile)
@app.get("/api/auth/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "name": current_user.name,
        "role": current_user.role,
        "department": current_user.department
    }

# ----------------- Phase 5: Administrative Interventions & Audit Trail -----------------

@app.post("/interventions", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED)
@app.post("/api/interventions", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED)
def create_intervention(
    body: InterventionCreate,
    current_user: User = Depends(require_admin)
):
    """
    Records an official administrative intervention on a project.
    Restricted to authenticated Admin users (MoRD Officers).
    """
    service = get_service()
    try:
        record = service.record_intervention(
            project_code=body.project_code,
            username=current_user.username,
            role=current_user.role,
            intervention_type=body.intervention_type,
            notes=body.notes
        )
        return record
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/interventions", response_model=List[InterventionResponse])
@app.get("/api/interventions", response_model=List[InterventionResponse])
def list_interventions(project_code: Optional[str] = Query(None, description="Optional project filter")):
    service = get_service()
    return service.get_interventions(project_code=project_code)

@app.get("/projects/{project_code}/interventions", response_model=List[InterventionResponse])
@app.get("/api/projects/{project_code}/interventions", response_model=List[InterventionResponse])
def get_project_interventions(project_code: str):
    service = get_service()
    return service.get_interventions(project_code=project_code)

@app.get("/audit-logs", response_model=AuditLogListResponse)
@app.get("/api/audit-logs", response_model=AuditLogListResponse)
def get_audit_trail(
    limit: int = Query(50, ge=1, le=200),
    project_code: Optional[str] = Query(None),
    current_user: User = Depends(require_admin)
):
    """
    Returns immutable chronological audit logs for compliance tracking.
    Restricted to authenticated Admin users.
    """
    service = get_service()
    items = service.get_audit_logs(limit=limit, project_code=project_code)
    return {
        "total": len(items),
        "items": items
    }


# Mount built React frontend if available
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    # Serve assets
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    # Serve index.html for root and SPA routes
    @app.get("/app")
    @app.get("/app/{path:path}")
    def serve_frontend_app(path: str = ""):
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.app:app", host="0.0.0.0", port=8000, reload=True)

