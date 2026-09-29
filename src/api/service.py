"""
Business Logic & Machine Learning Service Layer for SIH26017.
Connects SQLite database, Gradient Boosting inference, SHAP XAI engine, and Risk Engine.
"""

import os
import sqlite3
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple

from src.modeling.split import load_projects_from_db, create_project_splits
from src.modeling.features import FeaturePipeline
from src.modeling.ensemble import GradientBoostingDelayModel
from src.modeling.explainability import ProjectExplainabilityEngine
from src.modeling.risk_engine import RiskEngine, BAND_DEFINITIONS
from src.api.geo_data import get_state_coords

from src.regulatory.rfctlarr import RFCTLARRStatutoryEngine
from src.modeling.simulation import MitigationSimulationEngine
from src.modeling.survival import SurvivalHazardEngine
from src.geospatial.corridor import CorridorIntelligenceEngine
from src.modeling.contagion import InfrastructureContagionEngine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "data", "land_delays.db")
MODEL_PATH = os.path.join(BASE_DIR, "models", "gradient_boosting.joblib")

RECOMMENDATION_ACTION_MAP = {
    'agency_hist_delay_rate': "Convene bi-weekly delivery review with implementing agency head; audit contractor mobilization schedule and liquidated damages clauses.",
    'state_hist_delay_rate': "Escalate to State Central Sector Projects Coordination Committee (CSPCC); schedule joint review with District Collector / CALA for encumbrance-free land handover.",
    'post_larr_act_2013': "Verify administrative compliance on Section 11 preliminary notification, Social Impact Assessment (SIA) report, and R&R entitlement matrix.",
    'log_orig_cost': "Establish dedicated Project Management Unit (PMU) for multi-agency utility shifting (power lines, water pipelines) and financial disbursement velocity.",
    'is_mega_project': "Convene Cabinet Committee on Investment (CCI) / PRAGATI review to streamline inter-ministerial statutory clearances.",
    'is_linear_infrastructure': "Verify 80% contiguous encumbrance-free Right-of-Way (RoW) availability prior to contractor appointed date.",
    'sector_road_transport_and_highways': "Coordinate with state PWD and NHAI Regional Officer for 3D/3G gazette notifications and compensation awards under CALA.",
    'sector_railways': "Expedite joint verification with State Revenue Authorities for track alignment land possession and Commissioner of Railway Safety (CRS) clearance.",
    'sector_power': "Expedite forest land diversion (Stage-I/Stage-II) and PTCC approval for transmission line corridor RoW.",
    'sector_urban_development': "Engage Municipal Corporation / Urban Local Body (ULB) for utility shifting, rehabilitation of commercial structures, and municipal RoW clearance.",
    'sector_water_resources': "Formulate priority R&R package for submergence zone settlements and coordinate with Central Water Commission (CWC).",
    'planned_duration_months': "Re-baseline critical path activities; introduce phased sectional commissioning to mitigate compressed timeline pressure.",
    'approval_year': "Audit legacy contract terms against contemporary standard bidding document (SBD) guidelines.",
    'approval_month': "Align civil work commencement with non-monsoon construction seasons to preserve early momentum."
}

class ProjectService:
    """
    Singleton service maintaining pre-fitted models, XAI explainer, and cached project inferences.
    """
    def __init__(self):
        self.db_path = DB_PATH
        self._init_audit_tables()
        self.df = load_projects_from_db(self.db_path)
        
        # Fit feature pipeline strictly on train split
        train_df, _, _ = create_project_splits(self.df, random_state=42)
        self.pipeline = FeaturePipeline().fit(train_df)
        
        # Load or train model
        if os.path.exists(MODEL_PATH):
            self.model = GradientBoostingDelayModel.load(MODEL_PATH)
        else:
            X_train = self.pipeline.transform(train_df)
            y_train = train_df['is_delayed'].values
            self.model = GradientBoostingDelayModel(n_estimators=100, learning_rate=0.05, max_depth=3, random_state=42)
            self.model.train(X_train, y_train, self.pipeline.feature_names)
            self.model.save(MODEL_PATH)

        self.xai_engine = ProjectExplainabilityEngine(self.model, self.pipeline.feature_names)
        self.risk_engine = RiskEngine()
        self.simulation_engine = MitigationSimulationEngine(self.model, self.pipeline, self.risk_engine)
        self.survival_engine = SurvivalHazardEngine()
        self.corridor_engine = CorridorIntelligenceEngine()
        self.contagion_engine = InfrastructureContagionEngine()

        # Precompute inferences for all 1,477 projects
        self._precompute_all_risks()


    def _precompute_all_risks(self):
        """Precomputes predicted probabilities, risk scores, and bands for instant retrieval."""
        X_all = self.pipeline.transform(self.df)
        probs = self.model.predict_proba(X_all)
        
        scores = [self.risk_engine.score_probability(p) for p in probs]
        bands = [self.risk_engine.classify_score(s) for s in scores]
        colors = [BAND_DEFINITIONS[b]['color'] for b in bands]

        self.df['risk_probability'] = probs
        self.df['risk_score'] = scores
        self.df['risk_category'] = bands
        self.df['badge_color'] = colors

        # Quick lookup dictionary by project_code
        self.project_lookup = {row['project_code']: row for _, row in self.df.iterrows()}

    def get_projects(
        self,
        page: int = 1,
        page_size: int = 20,
        sector: Optional[str] = None,
        state: Optional[str] = None,
        risk_category: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """Queries projects with filtering, searching, and pagination."""
        filtered = self.df.copy()

        if sector and sector.strip():
            filtered = filtered[filtered['sector'].str.upper() == sector.strip().upper()]

        if state and state.strip():
            filtered = filtered[filtered['state'].str.upper() == state.strip().upper()]

        if risk_category and risk_category.strip():
            filtered = filtered[filtered['risk_category'].str.upper() == risk_category.strip().upper()]

        if search and search.strip():
            term = search.strip().lower()
            mask = (
                filtered['project_code'].str.lower().str.contains(term) |
                filtered['project_name'].str.lower().str.contains(term) |
                filtered['agency'].str.lower().str.contains(term)
            )
            filtered = filtered[mask]

        # Sort by risk score descending (highest risk first)
        filtered = filtered.sort_values(by='risk_score', ascending=False)

        total = len(filtered)
        total_pages = max(1, (total + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_records = filtered.iloc[start_idx:end_idx].to_dict(orient='records')
        
        # Clean records for schema
        results = []
        for r in page_records:
            results.append({
                'project_code': str(r['project_code']),
                'project_name': str(r['project_name']),
                'sector': str(r['sector']),
                'agency': str(r['agency']),
                'state': str(r['state']),
                'orig_cost_cr': float(r['orig_cost_cr']),
                'approval_date': r['approval_date'],
                'orig_commissioning_date': r['orig_commissioning_date'],
                'ant_commissioning_date': r['ant_commissioning_date'],
                'delay_months': int(r['delay_months']) if pd.notna(r['delay_months']) else None,
                'is_delayed': int(r['is_delayed']),
                'risk_score': int(r['risk_score']),
                'risk_category': str(r['risk_category']),
                'badge_color': str(r['badge_color'])
            })

        return {
            'total_projects': total,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'projects': results
        }

    def get_project_by_id(self, project_code: str) -> Optional[Dict[str, Any]]:
        """Returns full project sheet with geo coordinates and risk summary."""
        clean_code = project_code.strip().upper()
        row = self.project_lookup.get(clean_code)
        if row is None:
            return None

        # Coordinates
        geo = get_state_coords(row['state'])
        action = self.get_project_recommended_action(clean_code)

        return {
            'project_code': str(row['project_code']),
            'project_name': str(row['project_name']),
            'sector': str(row['sector']),
            'agency': str(row['agency']),
            'state': str(row['state']),
            'approval_date': row['approval_date'],
            'orig_commissioning_date': row['orig_commissioning_date'],
            'rev_commissioning_date': row['rev_commissioning_date'] if pd.notna(row['rev_commissioning_date']) else None,
            'ant_commissioning_date': row['ant_commissioning_date'],
            'orig_cost_cr': float(row['orig_cost_cr']),
            'rev_cost_cr': float(row['rev_cost_cr']) if pd.notna(row['rev_cost_cr']) else None,
            'ant_cost_cr': float(row['ant_cost_cr']) if pd.notna(row['ant_cost_cr']) else None,
            'cumulative_exp_cr': float(row['cumulative_exp_cr']) if pd.notna(row['cumulative_exp_cr']) else None,
            'physical_progress_pct': float(row['physical_progress_pct']) if pd.notna(row['physical_progress_pct']) else None,
            'delay_months': int(row['delay_months']) if pd.notna(row['delay_months']) else None,
            'is_delayed': int(row['is_delayed']),
            'cost_overrun_pct': float(row['cost_overrun_pct']) if pd.notna(row['cost_overrun_pct']) else None,
            'expenditure_ratio': float(row['expenditure_ratio']) if pd.notna(row['expenditure_ratio']) else None,
            'source_dataset': str(row['source_dataset']),
            'risk_score': int(row['risk_score']),
            'risk_category': str(row['risk_category']),
            'badge_color': str(row['badge_color']),
            'probability': float(row['risk_probability']),
            'recommended_action': action,
            'latitude': geo['lat'],
            'longitude': geo['lng'],
            'geo_precision': geo['precision']
        }

    def get_project_risk(self, project_code: str) -> Optional[Dict[str, Any]]:
        """Returns isolated risk assessment profile."""
        clean_code = project_code.strip().upper()
        row = self.project_lookup.get(clean_code)
        if row is None:
            return None

        band_meta = BAND_DEFINITIONS[row['risk_category']]
        action = self.get_project_recommended_action(clean_code)

        return {
            'project_code': clean_code,
            'project_name': str(row['project_name']),
            'risk_score': int(row['risk_score']),
            'risk_category': str(row['risk_category']),
            'badge_label': band_meta['label'],
            'badge_color': band_meta['color'],
            'probability': round(float(row['risk_probability']), 4),
            'description': band_meta['description'],
            'recommended_action': action,
            'available': True
        }

    def get_project_explanation(self, project_code: str, top_k: int = 4) -> Optional[Dict[str, Any]]:
        """Calculates exact SHAP values and plain language decision support for a project."""
        clean_code = project_code.strip().upper()
        row = self.project_lookup.get(clean_code)
        if row is None:
            return None

        # Build feature vector for this row
        single_df = pd.DataFrame([row])
        X_single = self.pipeline.transform(single_df)
        
        meta = {
            'project_code': clean_code,
            'project_name': str(row['project_name'])
        }
        expl = self.xai_engine.explain_project(X_single, meta, top_k=top_k)
        action = self.get_project_recommended_action(clean_code)

        return {
            'project_code': clean_code,
            'project_name': str(row['project_name']),
            'risk_score': int(row['risk_score']),
            'risk_category': str(row['risk_category']),
            'badge_color': str(row['badge_color']),
            'top_risk_drivers': expl['top_risk_drivers'],
            'top_mitigating_factors': expl['top_mitigating_factors'],
            'recommended_action': action,
            'disclaimer': expl['disclaimer']
        }

    def get_project_recommended_action(self, project_code: str) -> str:
        """Determines tailored decision-support recommendation based on top SHAP driver."""
        clean_code = project_code.strip().upper()
        row = self.project_lookup.get(clean_code)
        if row is None:
            return "Review project milestones in upcoming line ministry review meeting."

        single_df = pd.DataFrame([row])
        X_single = self.pipeline.transform(single_df)
        shap_vals = self.xai_engine.explainer(X_single).values[0]
        top_idx = int(np.argmax(shap_vals))
        top_feature = self.pipeline.feature_names[top_idx]

        return RECOMMENDATION_ACTION_MAP.get(
            top_feature,
            "Initiate monthly review of Right-of-Way possession and statutory clearance milestones."
        )

    def get_risks_summary(self) -> Dict[str, Any]:
        """Returns executive KPI summary and priority alert queue."""
        total = len(self.df)
        delayed = int((self.df['is_delayed'] == 1).sum())
        ontime = int((self.df['is_delayed'] == 0).sum())
        delay_rate = round((delayed / total) * 100.0, 2) if total > 0 else 0.0

        band_counts = self.df['risk_category'].value_counts().to_dict()
        counts_by_cat = {
            'LOW': int(band_counts.get('LOW', 0)),
            'MEDIUM': int(band_counts.get('MEDIUM', 0)),
            'HIGH': int(band_counts.get('HIGH', 0)),
            'CRITICAL': int(band_counts.get('CRITICAL', 0))
        }
        pcts_by_cat = {
            cat: round((cnt / total) * 100.0, 2)
            for cat, cnt in counts_by_cat.items()
        }

        # Priority queue: Top 15 CRITICAL & HIGH risk projects
        p_queue_df = self.df[self.df['risk_category'].isin(['CRITICAL', 'HIGH'])].sort_values(
            by='risk_score', ascending=False
        ).head(15)

        priority_queue = []
        for _, r in p_queue_df.iterrows():
            priority_queue.append({
                'project_code': str(r['project_code']),
                'project_name': str(r['project_name']),
                'sector': str(r['sector']),
                'agency': str(r['agency']),
                'state': str(r['state']),
                'orig_cost_cr': float(r['orig_cost_cr']),
                'approval_date': r['approval_date'],
                'orig_commissioning_date': r['orig_commissioning_date'],
                'ant_commissioning_date': r['ant_commissioning_date'],
                'delay_months': int(r['delay_months']) if pd.notna(r['delay_months']) else None,
                'is_delayed': int(r['is_delayed']),
                'risk_score': int(r['risk_score']),
                'risk_category': str(r['risk_category']),
                'badge_color': str(r['badge_color'])
            })

        return {
            'total_projects': total,
            'delayed_projects_count': delayed,
            'ontime_projects_count': ontime,
            'overall_delay_rate_pct': delay_rate,
            'counts_by_risk_category': counts_by_cat,
            'percentages_by_risk_category': pcts_by_cat,
            'priority_queue': priority_queue
        }

    def get_geo_projects(self) -> List[Dict[str, Any]]:
        """Returns geographic coordinates and risk metadata for all projects with authentic centroids."""
        items = []
        for _, r in self.df.iterrows():
            geo = get_state_coords(r['state'])
            items.append({
                'project_code': str(r['project_code']),
                'project_name': str(r['project_name']),
                'sector': str(r['sector']),
                'agency': str(r['agency']),
                'state': str(r['state']),
                'orig_cost_cr': float(r['orig_cost_cr']),
                'delay_months': int(r['delay_months']) if pd.notna(r['delay_months']) else 0,
                'risk_score': int(r['risk_score']),
                'risk_category': str(r['risk_category']),
                'badge_color': str(r['badge_color']),
                'latitude': geo['lat'],
                'longitude': geo['lng'],
                'geo_precision': geo['precision']
            })
        return items

    # ----------------- Phase 5: Audit & Intervention Storage -----------------

    def _init_audit_tables(self):
        """Initializes audit_logs and interventions tables in SQLite database if not present."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    username TEXT NOT NULL,
                    role TEXT NOT NULL,
                    action TEXT NOT NULL,
                    project_code TEXT,
                    details TEXT NOT NULL
                )
            ''')
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS interventions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    project_code TEXT NOT NULL,
                    username TEXT NOT NULL,
                    role TEXT NOT NULL,
                    intervention_type TEXT NOT NULL,
                    notes TEXT NOT NULL
                )
            ''')
            conn.commit()

    def record_audit_log(
        self,
        username: str,
        role: str,
        action: str,
        project_code: Optional[str] = None,
        details: str = ""
    ) -> Dict[str, Any]:
        """Appends a new immutable audit record to the audit_logs table."""
        now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO audit_logs (timestamp, username, role, action, project_code, details)
                VALUES (?, ?, ?, ?, ?, ?)
                ''',
                (now, username, role, action, project_code, details)
            )
            entry_id = cursor.lastrowid
            conn.commit()

        return {
            'id': entry_id,
            'timestamp': now,
            'username': username,
            'role': role,
            'action': action,
            'project_code': project_code,
            'details': details
        }

    def get_audit_logs(
        self,
        limit: int = 50,
        project_code: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves chronological audit log entries, optionally filtered by project_code."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            if project_code:
                cursor.execute(
                    '''
                    SELECT id, timestamp, username, role, action, project_code, details
                    FROM audit_logs
                    WHERE project_code = ?
                    ORDER BY id DESC
                    LIMIT ?
                    ''',
                    (project_code, limit)
                )
            else:
                cursor.execute(
                    '''
                    SELECT id, timestamp, username, role, action, project_code, details
                    FROM audit_logs
                    ORDER BY id DESC
                    LIMIT ?
                    ''',
                    (limit,)
                )
            rows = cursor.fetchall()

        return [dict(r) for r in rows]

    def record_intervention(
        self,
        project_code: str,
        username: str,
        role: str,
        intervention_type: str,
        notes: str
    ) -> Dict[str, Any]:
        """Records an official administrative intervention and logs it in the audit trail."""
        # Verify project exists
        project = self.get_project_by_id(project_code)
        if not project:
            raise ValueError(f"Project '{project_code}' not found in authentic repository.")

        now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO interventions (timestamp, project_code, username, role, intervention_type, notes)
                VALUES (?, ?, ?, ?, ?, ?)
                ''',
                (now, project_code, username, role, intervention_type, notes)
            )
            intervention_id = cursor.lastrowid
            conn.commit()

        # Simultaneously record audit trail entry
        self.record_audit_log(
            username=username,
            role=role,
            action="INTERVENTION_CREATED",
            project_code=project_code,
            details=f"Recorded '{intervention_type}' intervention: {notes}"
        )

        return {
            'id': intervention_id,
            'project_code': project_code,
            'username': username,
            'role': role,
            'intervention_type': intervention_type,
            'notes': notes,
            'timestamp': now
        }

    def get_interventions(self, project_code: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves administrative interventions for a specific project or all projects."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            if project_code:
                cursor.execute(
                    '''
                    SELECT id, timestamp, project_code, username, role, intervention_type, notes
                    FROM interventions
                    WHERE project_code = ?
                    ORDER BY id DESC
                    ''',
                    (project_code,)
                )
            else:
                cursor.execute(
                    '''
                    SELECT id, timestamp, project_code, username, role, intervention_type, notes
                    FROM interventions
                    ORDER BY id DESC
                    '''
                )
            rows = cursor.fetchall()

        return [dict(r) for r in rows]

    # ----------------- Phase 6: Simulation & Statutory Methods -----------------

    def simulate_project(
        self,
        project_code: str,
        package_split_count: int = 1,
        contingency_budget_pct: float = 0.0,
        dedicated_slao_taskforce: bool = False,
        parallel_statutory_hearings: bool = False,
        row_pre_possession_pct: float = 50.0,
        execution_buffer_months: int = 0
    ) -> Optional[Dict[str, Any]]:
        """Simulates policy mitigations on an existing project."""
        p = self.project_lookup.get(project_code)
        if p is None:
            return None
        return self.simulation_engine.simulate(
            project_dict=dict(p),
            package_split_count=package_split_count,
            contingency_budget_pct=contingency_budget_pct,
            dedicated_slao_taskforce=dedicated_slao_taskforce,
            parallel_statutory_hearings=parallel_statutory_hearings,
            row_pre_possession_pct=row_pre_possession_pct,
            execution_buffer_months=execution_buffer_months
        )

    def simulate_custom_project(
        self,
        sector: str,
        state: str,
        agency: str,
        orig_cost_cr: float,
        planned_duration_months: float,
        approval_year: int = 2024,
        levers: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Simulates mitigations on a hypothetical pre-sanction project proposal."""
        levers = levers or {}
        custom_proj = {
            'project_code': 'PROPOSED_NEW',
            'project_name': f"Proposed {sector.title()} Project ({state})",
            'sector': sector,
            'state': state,
            'agency': agency,
            'orig_cost_cr': orig_cost_cr,
            'planned_duration_months': planned_duration_months,
            'approval_year': approval_year,
            'approval_month': 4,
            'approval_date': f"{approval_year}-04-01",
            'orig_commissioning_date': f"{approval_year + max(1, int(planned_duration_months/12))}-04-01",
            'delay_months': 0,
            'is_delayed': 0
        }
        return self.simulation_engine.simulate(
            project_dict=custom_proj,
            package_split_count=levers.get('package_split_count', 1),
            contingency_budget_pct=levers.get('contingency_budget_pct', 0.0),
            dedicated_slao_taskforce=levers.get('dedicated_slao_taskforce', False),
            parallel_statutory_hearings=levers.get('parallel_statutory_hearings', False),
            row_pre_possession_pct=levers.get('row_pre_possession_pct', 50.0),
            execution_buffer_months=levers.get('execution_buffer_months', 0)
        )

    def get_statutory_assessment(self, project_code: str) -> Optional[Dict[str, Any]]:
        """Evaluates RFCTLARR 2013 statutory compliance & Section 25 lapsing risk."""
        p = self.project_lookup.get(project_code)
        if p is None:
            return None
        return RFCTLARRStatutoryEngine.evaluate_project_compliance(dict(p))

    def draft_statutory_notice(
        self,
        project_code: str,
        form_type: str,
        district: str,
        tehsil_or_taluk: str,
        notified_area_hectares: float,
        issuing_authority: str
    ) -> Optional[Dict[str, Any]]:
        """Generates Gazette-formatted legal acquisition notice."""
        p = self.project_lookup.get(project_code)
        if p is None:
            return None
        return RFCTLARRStatutoryEngine.draft_statutory_notice(
            project_data=dict(p),
            form_type=form_type,
            district=district,
            tehsil_or_taluk=tehsil_or_taluk,
            notified_area_hectares=notified_area_hectares,
            issuing_authority=issuing_authority
        )

    # ----------------- Phase 7: Survival Analysis Methods -----------------

    def get_project_survival(self, project_code: str) -> Optional[Dict[str, Any]]:
        """Calculates dynamic Weibull survival curve and hazard metrics."""
        p = self.project_lookup.get(project_code)
        if p is None:
            return None
        return self.survival_engine.calculate_survival_curve(
            project_dict=dict(p),
            risk_score=int(p.get('risk_score', 50) or 50)
        )

    # ----------------- Phase 8: Geospatial Corridor Methods -----------------

    def get_sample_corridors(self) -> List[Dict[str, Any]]:
        """Returns sample linear corridors."""
        return self.corridor_engine.get_sample_corridors()

    def analyze_corridor(
        self,
        coordinates: List[List[float]],
        sector: str = "ROAD TRANSPORT AND HIGHWAYS",
        state: str = "MAHARASHTRA",
        name: str = "Custom Infrastructure Corridor"
    ) -> Dict[str, Any]:
        """Analyzes alignment, distance, and environmental friction."""
        return self.corridor_engine.analyze_corridor(
            coordinates=coordinates,
            sector=sector,
            state=state,
            name=name
        )

    # ----------------- Phase 9: Infrastructure Contagion Methods -----------------

    def get_contagion_network(self) -> Dict[str, Any]:
        """Constructs multi-relational knowledge graph."""
        return self.contagion_engine.generate_network(self.df, top_n=30)

    def simulate_cascade(
        self,
        epicenter_project_code: str,
        delay_shock_months: int = 18
    ) -> Dict[str, Any]:
        """Simulates propagation of a delay shock through network topology."""
        return self.contagion_engine.simulate_cascade(
            epicenter_code=epicenter_project_code,
            delay_shock_months=delay_shock_months,
            projects_df=self.df
        )

# Global singleton

_SERVICE_INSTANCE: Optional[ProjectService] = None

def get_service() -> ProjectService:
    global _SERVICE_INSTANCE
    if _SERVICE_INSTANCE is None:
        _SERVICE_INSTANCE = ProjectService()
    return _SERVICE_INSTANCE

