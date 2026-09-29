"""
RFCTLARR Act 2013 Statutory Compliance & Legal Decision Support Engine.
Problem Statement: SIH26017 - Ministry of Rural Development (MoRD)

Encodes statutory procedures, timelines, and mandatory deadlines under:
- Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act, 2013
- MoRTH Bhoomi Rashi Guidelines & Section 3A/3D/3G notifications
- Section 25 Statutory Lapsing Rules & Section 40 Urgency Provisions
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# Statutory timeline limits defined by the RFCTLARR Act, 2013 (in days/months)
STATUTORY_LIMITS = {
    'SIA_MAX_MONTHS': 6,          # Section 4(2): Social Impact Assessment must be completed in 6 months
    'SEC15_OBJECTIONS_DAYS': 60,   # Section 15(1): Objections must be filed within 60 days of Sec 11 notice
    'SEC19_MAX_MONTHS': 12,        # Section 19(7): Sec 19 declaration must be published within 12 months of Sec 11
    'SEC25_LAPSING_MONTHS': 12,    # Section 25: Collector MUST make award within 12 months of Sec 19, or proceedings LAPSE!
    'SEC40_ADVANCE_PCT': 80.0      # Section 40(3): In case of urgency, 80% compensation must be tendered before possession
}

class RFCTLARRStatutoryEngine:
    """
    Expert legal and regulatory engine analyzing infrastructure project parameters
    against the statutory mandates of the RFCTLARR Act, 2013.
    """

    @staticmethod
    def evaluate_project_compliance(project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes a project's chronology, sector, cost, and delay status
        to diagnose statutory stage, Section 25 lapsing risk, and legal action items.
        """
        sector = str(project_data.get('sector', '')).upper()
        state = str(project_data.get('state', '')).upper()
        orig_cost_cr = float(project_data.get('orig_cost_cr', 0.0))
        delay_months = int(project_data.get('delay_months', 0) or 0)
        is_delayed = int(project_data.get('is_delayed', 0))
        risk_score = int(project_data.get('risk_score', 50))
        
        is_linear = sector in ['ROAD TRANSPORT AND HIGHWAYS', 'RAILWAYS']
        
        # Determine statutory acquisition stage based on project progression & delay profile
        if delay_months > 24:
            current_stage = "Section 25 (Award Determination / Lapsing Threat)"
            stage_description = (
                "Project has experienced severe gestation overrun (>24 months). "
                "Proceedings are exposed to Section 25 statutory lapsing if the Collector's award "
                "exceeds 12 months from the Section 19 declaration."
            )
            lapsing_risk_level = "CRITICAL"
            lapsing_risk_score = min(98, max(75, int(risk_score * 1.05)))
        elif delay_months > 10 or (is_delayed and risk_score >= 70):
            current_stage = "Section 19 to Section 23 (Joint Measurement & Valuation)"
            stage_description = (
                "Section 19 declaration published. Land valuation, dispute hearings, and "
                "preparation of Rehabilitation and Resettlement (R&R) awards are underway under tight statutory countdown."
            )
            lapsing_risk_level = "HIGH"
            lapsing_risk_score = min(88, max(60, int(risk_score * 0.95)))
        elif is_linear:
            current_stage = "Section 11 to Section 15 (Survey & Objection Hearings)"
            stage_description = (
                "Linear multi-district corridor requires contiguous Right-of-Way (RoW). "
                "Section 11 preliminary notifications issued; Section 15 60-day objection hearings active."
            )
            lapsing_risk_level = "MODERATE"
            lapsing_risk_score = min(65, max(40, int(risk_score * 0.85)))
        else:
            current_stage = "Section 4 to Section 8 (Social Impact Assessment & Appraisal)"
            stage_description = (
                "Social Impact Assessment (SIA) and Expert Group appraisal under Section 7 "
                "to ensure statutory feasibility prior to formal notification."
            )
            lapsing_risk_level = "LOW"
            lapsing_risk_score = min(45, max(15, int(risk_score * 0.70)))

        # Statutory Action Directives
        directives: List[Dict[str, str]] = []

        if lapsing_risk_level in ["CRITICAL", "HIGH"]:
            directives.append({
                "statutory_ref": "RFCTLARR Act 2013, Section 25",
                "title": "Mandatory Section 25 Award Deadline Safeguard",
                "directive": (
                    "Convene immediate coordination with the District Collector / Competent Authority for Land Acquisition (CALA). "
                    "All pending awards must be pronounced within the 12-month statutory ceiling to prevent irreversible lapsing of acquisition proceedings."
                ),
                "urgency": "Immediate (Within 15 Days)"
            })
            directives.append({
                "statutory_ref": "RFCTLARR Act 2013, Section 40",
                "title": "Invocation of Special Urgency Provisions",
                "directive": (
                    f"For critical linear sections in {state}, examine eligibility under Section 40(1) (Urgency clause for national highways/rail corridors). "
                    "Deposit 80% estimated compensation in dedicated escrow to take advance encumbrance-free possession of undisputed parcels."
                ),
                "urgency": "High Priority"
            })

        if is_linear:
            directives.append({
                "statutory_ref": "MoRTH Bhoomi Rashi / Linear Infrastructure Protocol",
                "title": "80% Contiguous Right-of-Way (RoW) Prerequisite",
                "directive": (
                    "Enforce NHAI/MoRTH policy: Contractor Appointed Date must strictly align with 80% contiguous, encumbrance-free "
                    "RoW physical handover to eliminate contractor idling claims and arbitration exposure."
                ),
                "urgency": "Standard Operating Procedure"
            })

        directives.append({
            "statutory_ref": "RFCTLARR Act 2013, First & Second Schedules",
            "title": "Solatium & Rehabilitation Package Disbursement",
            "directive": (
                "Ensure 100% Solatium (Section 30) and statutory rural market value multiplier (1.00x - 2.00x) "
                "are computed transparently via direct bank transfer (DBT) to prevent High Court writ petitions."
            ),
            "urgency": "Ongoing Compliance"
        })

        multiplier_advice = (
            "Rural Land Multiplier: 1.00x to 2.00x based on distance from nearest urban agglomeration "
            "+ 100% mandatory Solatium + 12% per annum additional compensation from Section 11 date."
        )

        return {
            "project_code": str(project_data.get('project_code', '')),
            "project_name": str(project_data.get('project_name', '')),
            "state": state,
            "sector": sector,
            "current_statutory_stage": current_stage,
            "stage_description": stage_description,
            "lapsing_risk_level": lapsing_risk_level,
            "lapsing_risk_score": lapsing_risk_score,
            "section_25_deadline_flag": lapsing_risk_level in ["CRITICAL", "HIGH"],
            "urgency_clause_eligible": is_linear and orig_cost_cr >= 500.0,
            "statutory_directives": directives,
            "multiplier_framework": multiplier_advice,
            "evaluation_timestamp": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    def generate_executive_memorandum(
        project_data: Dict[str, Any],
        recipient_title: str = "District Collector & District Magistrate",
        custom_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates an official Government of India executive compliance memorandum / advisory notice
        ready for administrative issue by the Ministry of Rural Development.
        """
        evaluation = RFCTLARRStatutoryEngine.evaluate_project_compliance(project_data)
        
        project_code = project_data.get('project_code', 'N/A')
        project_name = project_data.get('project_name', 'National Infrastructure Project')
        agency = project_data.get('agency', 'Central Executing Agency')
        state = project_data.get('state', 'STATE')
        cost_cr = float(project_data.get('orig_cost_cr', 0.0))
        risk_score = project_data.get('risk_score', 50)
        
        memo_number = f"MoRD/LA-COMPL/{datetime.now().year}/{project_code}"
        date_str = datetime.now().strftime("%d %B %Y")
        
        directives_text = "\n".join([
            f"   ({idx + 1}) [{d['statutory_ref']}] {d['title']}:\n       {d['directive']}"
            for idx, d in enumerate(evaluation['statutory_directives'])
        ])

        custom_section = f"\nSPECIAL OPERATIONAL DIRECTIVES:\n{custom_notes}\n" if custom_notes else ""

        body = f"""================================================================================
GOVERNMENT OF INDIA
MINISTRY OF RURAL DEVELOPMENT
DEPARTMENT OF LAND RESOURCES
Krishi Bhawan, New Delhi - 110001
================================================================================

MEMORANDUM NO: {memo_number}
DATE: {date_str}

TO:
The {recipient_title}
District Central Sector Projects Coordination Committee (CSPCC)
State/UT of {state}

SUBJECT: 
URGENT STATUTORY COMPLIANCE DIRECTIVE UNDER THE RFCTLARR ACT, 2013 
REGARDING TIMELINE ADHERENCE AND SECTION 25 LAPSING PREVENTION

PROJECT IDENTIFIER: {project_code}
PROJECT TITLE: {project_name}
IMPLEMENTING AGENCY: {agency}
SANCTIONED OUTLAY: Rs. {cost_cr:,.2f} Crores
PREDICTED DELAY RISK SCORE: {risk_score}/100 [{evaluation['lapsing_risk_level']} STATUTORY VULNERABILITY]

--------------------------------------------------------------------------------
1. STATUTORY AUDIT FINDINGS:
According to the National Predictive Analytics Monitoring System (SIH26017):
- Current Acquisition Stage: {evaluation['current_statutory_stage']}
- Section 25 Lapsing Threat: {evaluation['lapsing_risk_level']} (Vulnerability Score: {evaluation['lapsing_risk_score']}/100)
- Statutory Status: {evaluation['stage_description']}

2. LEGAL MANDATES & MANDATORY ACTION DIRECTIVES:
The Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation
and Resettlement Act, 2013 imposes strict statutory ceilings to preserve public capital
and protect landowner rights. You are hereby directed to implement the following measures:

{directives_text}

3. COMPENSATION & SOLATIUM SAFEGUARDS:
All awards shall strictly incorporate:
- Solatium under Section 30 equivalent to 100% of the total compensation.
- Statutory Multiplier Factor under the First Schedule (1.00x for urban; up to 2.00x for rural).
- Additional interest @ 12% per annum under Section 30(3) from preliminary notification date.
{custom_section}
4. COMPLIANCE TIMELINE:
An Action Taken Report (ATR) with verified physical possession hectares and award
disbursement receipts must be submitted to the Ministry of Rural Development portal
within 30 calendar days from receipt of this directive.

ISSUED WITH THE APPROVAL OF THE COMPETENT AUTHORITY,
Joint Secretary to the Government of India
Ministry of Rural Development
Copy to: Chief Secretary, Government of {state}; Chairman / Director General, {agency}
================================================================================
"""
        return {
            "memo_number": memo_number,
            "date": date_str,
            "recipient": recipient_title,
            "project_code": project_code,
            "project_name": project_name,
            "lapsing_risk_level": evaluation['lapsing_risk_level'],
            "formatted_document": body.strip()
        }
