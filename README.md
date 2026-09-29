# SIH26017: Predictive Analytics System for Early Detection of Land Acquisition Delays

[![License: GODL-India](https://img.shields.io/badge/License-GODL--India-blue.svg)](https://data.gov.in)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)](https://vitejs.dev)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/pytest-30%2F30%20passing-brightgreen.svg)](https://docs.pytest.org)

**Ministry of Rural Development (MoRD) — Smart India Hackathon (Problem Statement SIH26017)**

An end-to-end, multi-tier artificial intelligence and geospatial decision support platform engineered to predict, diagnose, simulate, and mitigate land acquisition bottlenecks across India's Central Sector Infrastructure Portfolio. Built with **100% authentic Government of India open records** (MoSPI & PMGSY), transparent SHAP explainability, Weibull survival hazard dynamics, linear corridor environmental buffers, counterfactual digital twin simulation, and multi-relational contagion cascade modeling.

---

## 🏛️ Executive Summary & National Context

Infrastructure gestation delays — particularly across linear alignments such as national expressways, freight rail corridors, and power transmission lines — trigger capital escalations and hinder economic connectivity. Under the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act, 2013**, statutory multi-stage procedures (Social Impact Assessment, Section 11 preliminary notifications, Section 15 objection hearings, and Section 19 declaration of awards) often encounter procedural inertia and statutory lapse risks under Section 25.

**SIH26017** provides line ministry leadership, Project Directors, and District Collectors with a comprehensive intelligence command center:

1. **Early Delay Risk Scoring (0–100):** Calibrated Gradient Boosting ensemble predicting probability of gestation overruns using baseline parameters knowable at sanction time with **0.9425 ROC-AUC**.
2. **Transparent Explainability (SHAP TreeExplainer):** Plain-language breakdown of primary risk drivers (e.g. historical state land acquisition friction, high-capital linear exposure, post-2013 statutory regime) vs favorable mitigating factors.
3. **What-If Counterfactual Policy Sandbox (Digital Twin):** Real-time interactive simulation of administrative, operational, and contractual levers (e.g. contract package splitting, compensation escrow pre-funding, 80% contiguous RoW possession guarantee) showing avoided delay months and saved capital escalations.
4. **RFCTLARR 2013 Statutory Compliance & Notice Drafter:** Automatic monitoring of statutory milestone timelines, Section 25 lapsing risk alarms, and instant generation of official Gazette-formatted legal notices (Sections 11, 15, 19, 21, 23).
5. **Dynamic Weibull Survival Analysis & Delay Hazard Curves:** Mathematical survival function $S(t) = \exp(-(t/\lambda)^k)$ calculating continuous monthly hazard rates $h(t)$, cumulative hazard $H(t)$, peak danger windows, and 80%/95% confidence intervals.
6. **Geospatial Corridor Route Alignment & Land Friction Engine:** Interactive Leaflet GIS tracing highway and railway alignments (e.g., Delhi-Mumbai Expressway, Western DFC), calculating Haversine distances, forest diversion overlap %, hydrologic river crossings, and peri-urban settlement density.
7. **Infrastructure Contagion & Dependency Knowledge Graph:** Graph network mapping multi-relational dependencies (shared implementing agency, geographic administrative clusters, logistics corridors) with a topological shock simulator modeling cascading delay ripple effects.
8. **Administrative Interventions & Immutable Audit Trail:** Role-Based Access Control (MoRD Admin vs Public Viewer) enabling officials to record official directives (joint surveys, CSPCC reviews) with a tamper-evident SQLite audit log.

---

## 📊 Key Machine Learning & Survival Analytics Metrics

Trained on 1,477 authentic Central Sector Projects from the Ministry of Statistics and Programme Implementation (MoSPI) Flash Report (Feb 2025) with zero synthetic data:

| Metric | Baseline (Logistic Regression) | Production (Gradient Boosting) | Improvement |
| :--- | :---: | :---: | :---: |
| **ROC-AUC** | 0.9119 | **0.9425** (5-Fold CV: 0.9407 ± 0.0139) | **+3.06%** |
| **PR-AUC** | 0.9430 | **0.9607** (vs 0.6531 prevalence) | **+1.77%** |
| **Accuracy** | 80.18% | **88.74%** | **+8.56%** |
| **Precision** | 81.33% | **87.97%** | **+6.64%** |
| **Recall** | 90.34% | **95.86%** | **+5.52%** |
| **F1-Score** | 0.8561 | **0.9175** | **+6.14%** |
| **Brier Score** | 0.1251 | **0.0872** (Calibrated Probabilities) | **-30.3% error** |

*Zero Data Leakage Guarantee: Strict leakage audit verified $|r| < 0.42$; all post-hoc execution outcomes (revised costs, actual expenditures, physical completion percentages) are strictly excluded from baseline feature pipelines.*

---

## 🚀 The 5 Advanced Frontier Innovations

### 1. What-If Counterfactual Policy Sandbox (Digital Twin Engine)
- Available as a portfolio-wide sandbox (`/sandbox`) and per-project tab in the project inspector.
- Allows administrators to manipulate 6 operational levers:
  - **Contract Package Splitting:** Divides massive monolithic EPC contracts into 2–4 manageable civil packages.
  - **Compensation Escrow Pre-Funding:** Simulates capital liquidity for expedited land compensation awards.
  - **Dedicated SLAO Taskforce:** Models dedicated Special Land Acquisition Officer deployment to mitigate state friction.
  - **Parallel Statutory Hearings:** Concurrent processing of Section 11 surveys and Section 15 objections.
  - **80% Contiguous RoW Handover Guarantee:** Prerequisite before contractor appointed date.
  - **Timeline Execution Buffer:** Incorporating realistic gestation buffers.
- Outputs real-time mitigated risk scores, avoided overrun months, and capital escalation saved in ₹ Crores.

### 2. RFCTLARR Act 2013 Statutory Compliance & Notice Drafter
- Automated statutory milestone audit assessing compliance with the Land Acquisition Act of 2013.
- **Section 25 Lapsing Risk Monitor:** Tracks elapsed months since Section 19 publication; flags high-risk projects nearing the 12-month statutory lapsing deadline.
- **Automated Legal Notice Drafter:** Formats official Government of India notices for District Collectors and SLAOs:
  - Form 11: Preliminary Notification of Land Acquisition
  - Form 15: Public Notice of Objection Hearing
  - Form 19: Declaration of Resettlement & Rehabilitation Award
  - Form 21: Notice to Persons Interested to Submit Claims
  - Form 23: Summons to Landowners for Compensation Hearing

### 3. Dynamic Survival Analysis & Delay Hazard Curves
- Implements continuous-time Weibull survival distribution:
  $$S(t) = \exp\left(-\left(\frac{t}{\lambda}\right)^k\right)$$
- Generates month-by-month hazard rate $h(t)$ and cumulative hazard $H(t)$ across 0–60 project gestation months.
- Automatically identifies the **Peak Danger Window** (e.g. Month 18–30 during civil contractor mobilization and RoW possession).
- Computes statistical 80% and 95% completion confidence intervals.

### 4. Geospatial Corridor Route Alignment & Land Friction Engine
- Interactive Leaflet-powered route alignment viewer with pre-loaded national alignments:
  - Delhi-Mumbai Expressway (NHAI - 1,350 km)
  - Western Dedicated Freight Corridor (DFCCIL / Railways - 1,504 km)
  - Green Energy Transmission Corridor (PGCIL - 780 km)
  - Mumbai-Ahmedabad High Speed Rail (NHSRCL - 508 km)
- Computes Haversine geodesic polyline distances and environmental friction buffers:
  - Forest Diversion Overlap % and forest stretch in km
  - Hydrologic River Crossings requiring CWC clearances
  - Peri-Urban Settlement Density % triggering displacement friction
- Synthesizes a composite 0–100 **Corridor Vulnerability Index** with statutory mitigation directives.

### 5. Multi-Relational Contagion Knowledge Graph & Cascade Simulator
- Multi-relational topological graph modeling:
  - Project nodes, Agency nodes, Jurisdiction nodes, and Logistics Corridor nodes.
  - Inter-project dependencies: shared contractor pools, shared line agencies, geographical clustering, and logistical interconnections.
- **Topological Cascade Simulator:** Models delay shock propagation from an epicenter project (e.g. 18-month delay shock) across dependent infrastructure assets, quantifying secondary delay months and cumulative cost escalation ripple effects.

---

## 🛠️ System Architecture

```
[ MoSPI Flash Report (PDF) ]   [ PMGSY OMMAS (Excel) ]   [ SCM Masterdata (CSV) ]
             │                             │                         │
             └──────────────────────┬────────────────────────────────┘
                                    ▼
                      [ SQLite Database: land_delays.db ]
                                    │
                                    ▼
                      [ 19-Feature Baseline Pipeline ]
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
[ Gradient Boosting ]     [ SHAP TreeExplainer ]     [ Weibull Survival Engine ]
  (ROC-AUC: 0.9425)         (Mathematical XAI)         (S(t), h(t), Hazards)
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
              [ Multi-Tier Decision Support & Policy Engines ]
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
[ Digital Twin Sandbox ]  [ RFCTLARR Compliance ]    [ Contagion Graph & Cascade ]
(Counterfactual Levers)   (Sec 25 & Legal Notices)   (Shock Propagation Engine)
                                    │
                                    ▼
              [ FastAPI Backend API + RBAC + Audit Logging ]
                                    │
                                    ▼
             [ React 19 + TypeScript + Leaflet GIS + Studio ]
   - Dashboard & Priority Queue      - Policy Sandbox View
   - National GIS Centroid Map       - Corridor Alignment Studio
   - Project SHAP Detail Sheet       - Contagion Network Graph
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.12 (`python` or `py -3.12`)
- Node.js 18+ & npm

### 1. Repository Setup & Dependencies
```bash
# Clone the repository
git clone https://github.com/Vaibhav-2810/Hackthon.git
cd Hackthon

# Setup Python virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Build the Frontend production assets
cd frontend
npm install
npm run build
cd ..
```

### 2. Verify Integrity & Run Automated Test Suite
```bash
# Verify data honesty (zero synthetic data guarantee)
python scripts/verify_honesty.py

# Run complete automated test suite (30 unit & integration tests)
python -m pytest tests/ -v
```

### 3. Launch the Application
```bash
# Start the unified FastAPI server (serves API and compiled React SPA)
python -m uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive System Dashboard:** [http://localhost:8000/app](http://localhost:8000/app)
- **Interactive Swagger API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Root / Health Check:** [http://localhost:8000/](http://localhost:8000/)

### Demo Credentials:
- **MoRD Admin (Executive Clearance):** Username: `admin` | Password: `sih26017`
- **Public Auditor (Viewer Clearance):** Username: `viewer` | Password: `viewer123`

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Operational status & system health |
| `GET` | `/api/projects` | Filterable catalog of 1,477 MoSPI assets (sector, state, risk tier) |
| `GET` | `/api/risks` | Executive dashboard summary & prioritized critical queue |
| `GET` | `/api/geo/projects` | Geospatial state centroid coordinates for national map |
| `GET` | `/api/projects/{code}` | Detailed project record with baseline financials & timeline |
| `GET` | `/api/projects/{code}/risk` | 0–100 delay risk score, category, and delay probability |
| `GET` | `/api/projects/{code}/explanation` | SHAP TreeExplainer mathematical driver breakdown |
| `POST` | `/api/projects/{code}/simulate` | What-if counterfactual lever simulation for existing asset |
| `POST` | `/api/simulation/custom` | Digital twin simulation for pre-sanction custom project proposal |
| `GET` | `/api/projects/{code}/statutory` | RFCTLARR 2013 compliance audit & Section 25 lapsing risk |
| `POST` | `/api/projects/{code}/statutory/notice` | Automated legal notice generator (Form 11, 15, 19, 21, 23) |
| `GET` | `/api/projects/{code}/survival` | Continuous Weibull survival curve, hazard rates & peak danger |
| `GET` | `/api/geo/corridors/sample` | Pre-loaded national expressways, freight corridors, and rail routes |
| `POST` | `/api/geo/corridors/analyze` | Geodesic distance, forest overlap %, river crossings & friction |
| `GET` | `/api/graph/network` | Multi-relational infrastructure knowledge graph nodes & links |
| `POST` | `/api/graph/cascade` | Contagion shock simulator modeling secondary delay propagation |
| `POST` | `/api/auth/login` | Secure authentication and token issuance |
| `GET` | `/api/audit/logs` | Immutable administrative compliance audit trail (Admin only) |

---

## 📂 Repository Structure

```
.
├── data/
│   ├── raw/                       # Authentic source datasets
│   │   ├── FRFebruary2025.pdf     # MoSPI Flash Report (12.2 MB, 1,477 projects)
│   │   ├── finalexcel.xlsx        # PMGSY District Construction Progress (2,272 rows)
│   │   └── SCM-Masterdata.csv     # Smart Cities Mission Masterdata (6,570 projects)
│   └── land_delays.db             # Normalized SQLite relational database
├── frontend/                      # React 19 + TypeScript + Vite + Tailwind v4 UI
│   ├── src/
│   │   ├── components/            # UI Views & Components
│   │   │   ├── Navbar.tsx         # Responsive top navigation (6 tabs)
│   │   │   ├── KPICards.tsx       # Portfolio KPI summary cards
│   │   │   ├── PriorityQueueTable.tsx # Sorted high-risk project triage table
│   │   │   ├── GISMap.tsx         # National Leaflet GIS map
│   │   │   ├── PolicySandboxView.tsx # What-If Counterfactual Digital Twin
│   │   │   ├── CorridorAnalyzerView.tsx # Route alignment & environmental friction
│   │   │   ├── ContagionGraphView.tsx # Knowledge graph & cascade simulator
│   │   │   ├── WhatIfSimulationTab.tsx # Modal-embedded policy simulator
│   │   │   ├── StatutoryAdvisoryTab.tsx # RFCTLARR 2013 compliance & notice drafter
│   │   │   ├── SurvivalHazardTab.tsx # Weibull survival & hazard curve
│   │   │   ├── ProjectDetailModal.tsx # 5-tab deep-dive inspection sheet
│   │   │   └── AuditLogModal.tsx  # Compliance audit trail inspector
│   │   ├── api.ts                 # Full typed API client
│   │   └── types.ts               # TypeScript schemas for all 9 phases
│   └── dist/                      # Pre-compiled production bundle
├── models/
│   └── gradient_boosting.joblib   # Trained production ensemble model artifact
├── src/
│   ├── api/                       # FastAPI application & service layer
│   │   ├── app.py                 # REST route definitions & static SPA routing
│   │   ├── auth.py                # HMAC-SHA256 Token Auth & RBAC guards
│   │   ├── schemas.py             # Pydantic v2 validation models
│   │   ├── service.py             # Business logic & engine orchestration
│   │   └── geo_data.py            # Authentic Indian State/UT centroids
│   ├── modeling/                  # Machine learning & simulation engines
│   │   ├── features.py            # 19 baseline feature extractors (zero leakage)
│   │   ├── ensemble.py            # Gradient Boosting classifier
│   │   ├── explainability.py      # SHAP TreeExplainer & decision support engine
│   │   ├── risk_engine.py         # 0-100 score calibration & priority queue
│   │   ├── simulation.py          # Counterfactual policy simulation engine
│   │   ├── survival.py            # Weibull survival analysis & hazard curves
│   │   └── contagion.py           # Knowledge graph & delay cascade simulator
│   ├── regulatory/                # Legal compliance engines
│   │   └── rfctlarr.py            # RFCTLARR Act 2013 statutory compliance & notice drafter
│   └── geospatial/                # Linear geospatial engines
│       └── corridor.py            # Corridor alignment & environmental friction engine
├── tests/                         # Automated pytest suite (30 tests)
│   ├── test_modeling.py           # Feature engineering & leakage tests
│   ├── test_phase3.py             # Gradient Boosting, SHAP & risk tests
│   ├── test_api.py                # Core API tests
│   ├── test_phase5.py             # RBAC, interventions & audit log tests
│   ├── test_phase6.py             # RFCTLARR & policy simulation tests
│   └── test_advanced_features.py  # Survival, corridor & contagion tests
├── ARCHITECTURE.md                # Technical architecture & subsystem flows
├── DATA_SOURCES.md                # Data provenance, URLs, field dictionary
├── MODEL_CARD.md                  # Machine learning specification & evaluation metrics
├── LIMITATIONS.md                 # Data boundaries & spatial precision disclosures
├── RESPONSIBLE_AI.md              # Governance, ethics, and non-causal guidelines
└── DEMO_GUIDE.md                  # 5-minute hackathon judge presentation script
```

---

## 📜 Compliance & Ethical Guardrails

1. **Non-Causal Explanation Policy:** Machine learning attribution identifies statistical contribution to delay risk; explanations strictly state *“contributed to elevating delay risk”* rather than asserting direct legal causality.
2. **Human-in-the-Loop Decision Support:** The system advises, highlights critical priorities, and drafts notices; it never autonomously cancels projects, penalizes contractors, or executes statutory land acquisition orders.
3. **Spatial Precision Transparency:** Because public MoSPI records list project locations at the State/UT level, map markers plot at authenticated state administrative centroids and are explicitly labeled `State-level centroid`.
4. **Statutory Adherence:** Notice drafters strictly mirror Formats prescribed in the Central and State RFCTLARR Rules 2014/2015.

