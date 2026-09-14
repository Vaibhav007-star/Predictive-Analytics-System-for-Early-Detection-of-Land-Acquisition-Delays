"""
FastAPI Application for SIH26017.
Predictive Analytics System for Early Detection of Land Acquisition Delays.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

from src.api.schemas import (
    ProjectListResponse,
    ProjectDetail,
    RiskProfileResponse,
    ExplanationResponse,
    RisksSummaryResponse,
    GeoProjectItem
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

