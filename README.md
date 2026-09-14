# SIH26017: Predictive Analytics System for Early Detection of Land Acquisition Delays

[![License: GODL-India](https://img.shields.io/badge/License-GODL--India-blue.svg)](https://data.gov.in)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com)

**Ministry of Rural Development (MoRD) — Smart India Hackathon 2024 (Problem Statement SIH26017)**

An end-to-end, machine learning-driven decision support system engineered to predict, triage, and mitigate land acquisition and infrastructure project delays across India. Built strictly with authentic Government of India open records, transparent SHAP explainability, interactive Leaflet GIS visualization, and tamper-evident administrative audit logging.

---

## 🏛️ Executive Summary

Infrastructure gestation delays — particularly in linear corridors (highways, rail tracks, transmission lines) — incur substantial cost escalations and hinder socio-economic development. Under the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act, 2013**, multi-step statutory procedures (Social Impact Assessment, Section 11 preliminary notifications, Section 19 declaration of awards) often encounter procedural inertia.

**SIH26017** provides line ministry leadership and District Collectors with:
1. **Early Delay Risk Scoring (0–100):** Calibrated ensemble model predicting timeline overrun probability using baseline parameters knowable at sanction time.
2. **Explainable AI (SHAP TreeExplainer):** Plain-language breakdown of key risk drivers (e.g. historical state land acquisition frictions, compressed construction timelines, high-capital linear scale) versus mitigating factors.
3. **National GIS Geospatial Mapping:** Administrative centroid visualization mapping 1,477 central sector projects across 33 States/UTs with explicit precision labeling.
4. **Administrative Interventions & Tamper-Evident Audit Trail:** Role-based access control (Admin vs Viewer) enabling District Collectors and SLAOs to log real-time interventions (joint surveys, Section 19 approvals) with immutable audit records.

---

## 📊 Key Machine Learning Metrics (Phase 3 Ensemble)

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

*Zero Data Leakage Guarantee: Leakage audit verified $|r| < 0.42$; all post-hoc execution outcomes (revised costs, actual expenditures, completion percentages) are strictly excluded from baseline features.*

---

## 🛠️ System Architecture & Technology Stack

- **Backend:** FastAPI (Python 3.12), SQLite (WAL mode), Pydantic v2, Uvicorn
- **Machine Learning & XAI:** scikit-learn 1.9.0, SHAP 0.52.0, NumPy, Pandas
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Leaflet & React-Leaflet
- **Security & Governance:** Zero-dependency HMAC-SHA256 Token Auth, Role-Based Access Control (Admin / Viewer), SQLite Immutable Audit Log

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
                       ┌────────────┴────────────┐
                       ▼                         ▼
             [ Gradient Boosting ]     [ SHAP TreeExplainer ]
                       │                         │
                       └────────────┬────────────┘
                                    ▼
                  [ Risk Engine & Priority Queue (0-100) ]
                                    │
                                    ▼
             [ FastAPI Backend API + RBAC + Audit Logging ]
                                    │
                                    ▼
             [ React 19 + TypeScript + Leaflet GIS Dashboard ]
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.12 (`py -3.12` or `python`)
- Node.js 18+ & npm

### 1. Repository Setup & Dependencies
```bash
# Clone the repository
git clone https://github.com/Vaibhav-2810/Hackthon.git
cd Hackthon

# Install Python dependencies
py -3.12 -m pip install -r requirements.txt
# (or: py -3.12 -m pip install pandas numpy scikit-learn shap xgboost pypdf openpyxl fastapi pydantic uvicorn httpx pytest)

# Install Frontend dependencies and build
cd frontend
npm install
npm run build
cd ..
```

### 2. Verify Data Honesty & Model Pipeline
```bash
# Run automated data honesty audit (verifies zero synthetic data & SHA-256 hashes)
py -3.12 scripts/verify_honesty.py

# Run comprehensive test suite (21 unit & integration tests)
py -3.12 -m pytest tests/ -v
```

### 3. Launch Application
```bash
# Start FastAPI backend (automatically serves the built React frontend at /app)
py -3.12 -m uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive Dashboard:** [http://localhost:8000/app](http://localhost:8000/app)
- **Interactive Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Root:** [http://localhost:8000/](http://localhost:8000/)

### Demo Credentials:
- **MoRD Admin (Executive Clearance):** Username: `admin` | Password: `sih26017`
- **Public Auditor (Viewer Clearance):** Username: `viewer` | Password: `viewer123`

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
│   │   ├── components/            # KPICards, GISMap, PriorityQueue, DetailModal, AuditLogModal
│   │   ├── api.ts                 # Typed API client with token auth
│   │   └── types.ts               # Full TypeScript schemas
│   └── dist/                      # Pre-compiled production bundle
├── models/
│   └── gradient_boosting.joblib   # Trained production ensemble model artifact
├── scripts/
│   └── verify_honesty.py          # Data authenticity & zero-fabrication verification script
├── src/
│   ├── api/                       # FastAPI application, auth, schemas, service layer
│   │   ├── app.py                 # Endpoint definitions & static SPA routing
│   │   ├── auth.py                # HMAC-SHA256 Token Auth & RBAC guards
│   │   ├── schemas.py             # Pydantic v2 validation models
│   │   ├── service.py             # Model inference, SHAP generation, audit logging
│   │   └── geo_data.py            # Authentic Indian State/UT centroids
│   └── modeling/                  # ML pipeline
│       ├── features.py            # 19 baseline feature extractors (zero leakage)
│       ├── baseline.py            # Logistic regression baseline
│       ├── ensemble.py            # Gradient Boosting classifier
│       ├── explainability.py      # SHAP TreeExplainer & decision support engine
│       ├── risk_engine.py         # 0-100 score calibration & priority queue
│       └── split.py               # Leakage-free train/val/test splitters
├── tests/                         # Automated pytest suite (21 tests)
│   ├── test_modeling.py           # Data ingestion & feature tests
│   ├── test_phase3.py             # Ensemble, SHAP, and risk tests
│   ├── test_api.py                # FastAPI core endpoint tests
│   └── test_phase5.py             # Auth, RBAC, interventions & audit log tests
├── ARCHITECTURE.md                # Detailed technical architecture & data flow
├── DATA_SOURCES.md                # Data provenance, URLs, field dictionary
├── MODEL_CARD.md                  # Machine learning specification & evaluation metrics
├── LIMITATIONS.md                 # Data boundaries & spatial precision disclosures
├── RESPONSIBLE_AI.md              # Governance, ethics, and non-causal guidelines
└── DEMO_GUIDE.md                  # 3-5 minute hackathon judge presentation script
```

---

## 📜 Compliance & Ethical Guardrails

1. **Non-Causal Explanation Policy:** Machine learning attribution identifies statistical contribution to delay risk; explanations strictly state *“contributed to elevating delay risk”* rather than asserting direct legal causality.
2. **Human-in-the-Loop Decision Support:** The system advises and highlights critical priorities; it never autonomously cancels projects, penalizes contractors, or executes statutory land acquisition orders.
3. **Spatial Precision Transparency:** Because public MoSPI records list project locations at the State/UT level, map markers plot at authenticated state administrative centroids and are explicitly labeled `State-level centroid`.
