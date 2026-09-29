"""
Infrastructure Contagion & Dependency Knowledge Graph Engine for SIH26017.
Constructs multi-relational graphs across central sector assets, implementing agencies,
and jurisdictions, simulating topological delay shock propagation and cascading capital escalations.
"""

from typing import Dict, Any, List, Optional
import pandas as pd


class InfrastructureContagionEngine:
    """
    Constructs an infrastructure dependency network and models delay shock propagation.
    """

    @staticmethod
    def generate_network(projects_df: pd.DataFrame, top_n: int = 30) -> Dict[str, Any]:
        """
        Builds a multi-relational knowledge graph comprising:
        - Project nodes
        - Implementing Agency hub nodes
        - Jurisdiction State hub nodes
        """
        sample_df = projects_df.head(top_n).copy()

        nodes: List[Dict[str, Any]] = []
        links: List[Dict[str, Any]] = []
        node_ids = set()

        # 1. Project Nodes
        for _, row in sample_df.iterrows():
            p_code = str(row['project_code'])
            p_name = str(row.get('project_name', p_code))[:45]
            risk = int(row.get('risk_score', 50) or 50)
            color = str(row.get('badge_color', '#eab308'))
            sector = str(row.get('sector', ''))
            state = str(row.get('state', ''))
            agency = str(row.get('agency', ''))
            cost = float(row.get('orig_cost_cr', 500) or 500)

            nodes.append({
                'id': p_code,
                'label': f"[{p_code}] {p_name}",
                'type': 'PROJECT',
                'color': color,
                'size': max(10, min(24, int(cost / 250) + 10)),
                'details': f"{sector} | ₹{cost:.0f} Cr | Risk: {risk}",
                'sector': sector,
                'state': state,
                'agency': agency,
                'risk_score': risk,
                'orig_cost_cr': cost
            })
            node_ids.add(p_code)

        # 2. Implementing Agency Hub Nodes
        agencies = sample_df['agency'].dropna().unique()
        for ag in agencies:
            ag_id = f"AGENCY_{ag}"
            nodes.append({
                'id': ag_id,
                'label': f"Agency: {ag}",
                'type': 'AGENCY',
                'color': '#6366f1',  # Indigo
                'size': 18,
                'details': f"Implementing Authority: {ag}",
                'agency': ag
            })
            node_ids.add(ag_id)

        # 3. State Jurisdiction Hub Nodes
        states = sample_df['state'].dropna().unique()
        for st in states:
            st_id = f"STATE_{st}"
            nodes.append({
                'id': st_id,
                'label': f"State: {st}",
                'type': 'STATE',
                'color': '#0ea5e9',  # Sky
                'size': 18,
                'details': f"State Jurisdiction: {st}",
                'state': st
            })
            node_ids.add(st_id)

        # 4. Construct Multi-Relational Links
        for _, row in sample_df.iterrows():
            p_code = str(row['project_code'])
            ag = str(row.get('agency', ''))
            st = str(row.get('state', ''))

            # Link to Agency
            ag_id = f"AGENCY_{ag}"
            if ag_id in node_ids:
                links.append({
                    'source': p_code,
                    'target': ag_id,
                    'relationship': 'IMPLEMENTED_BY',
                    'weight': 1.0
                })

            # Link to State
            st_id = f"STATE_{st}"
            if st_id in node_ids:
                links.append({
                    'source': p_code,
                    'target': st_id,
                    'relationship': 'LOCATED_IN',
                    'weight': 0.8
                })

        # 5. Direct Project-to-Project Synergies (Same Agency & State)
        projects_list = sample_df.to_dict('records')
        for i in range(len(projects_list)):
            for j in range(i + 1, min(len(projects_list), i + 6)):
                p1 = projects_list[i]
                p2 = projects_list[j]
                if p1.get('agency') == p2.get('agency') and p1.get('state') == p2.get('state'):
                    links.append({
                        'source': str(p1['project_code']),
                        'target': str(p2['project_code']),
                        'relationship': 'SHARED_CONTRACTOR_POOL',
                        'weight': 0.65
                    })

        return {
            'total_nodes': len(nodes),
            'total_links': len(links),
            'nodes': nodes,
            'links': links
        }

    @staticmethod
    def simulate_cascade(
        epicenter_code: str,
        delay_shock_months: int,
        projects_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Simulates propagation of a delay shock through the network topology.
        """
        matched = projects_df[projects_df['project_code'] == epicenter_code]
        if matched.empty:
            matched = projects_df.head(1)

        epicenter_row = matched.iloc[0]
        epi_agency = str(epicenter_row.get('agency', ''))
        epi_state = str(epicenter_row.get('state', ''))
        epi_cost = float(epicenter_row.get('orig_cost_cr', 500) or 500)

        # Find connected projects in the same state or agency
        candidates = projects_df[
            (projects_df['project_code'] != epicenter_code) &
            ((projects_df['agency'] == epi_agency) | (projects_df['state'] == epi_state))
        ].head(5)

        cascaded_list = []
        total_secondary_months = 0
        total_escalation_cr = 0.0

        for idx, (_, row) in enumerate(candidates.iterrows()):
            cost = float(row.get('orig_cost_cr', 400) or 400)
            is_same_agency = str(row.get('agency')) == epi_agency
            is_same_state = str(row.get('state')) == epi_state

            if is_same_agency and is_same_state:
                damping = 0.65
                pathway = "Direct Shared Contractor & CALA Taskforce"
            elif is_same_agency:
                damping = 0.45
                pathway = f"Agency Resource Congestion ({epi_agency})"
            else:
                damping = 0.35
                pathway = f"State Administrative Precedent ({epi_state})"

            sec_delay = max(3, int(round(delay_shock_months * damping)))
            # Escalation ~ 0.8% per month of delay on capital outlay
            escalation = round(sec_delay * 0.008 * cost, 2)

            total_secondary_months += sec_delay
            total_escalation_cr += escalation

            cascaded_list.append({
                'project_code': str(row['project_code']),
                'project_name': str(row.get('project_name', row['project_code'])),
                'agency': str(row.get('agency', '')),
                'sector': str(row.get('sector', '')),
                'secondary_delay_months': sec_delay,
                'contagion_pathway': pathway,
                'estimated_cost_escalation_cr': escalation
            })

        total_escalation_cr = round(total_escalation_cr, 2)

        if total_secondary_months >= 36 or total_escalation_cr >= 250:
            severity = "SEVERE SYSTEMIC CONTAGION"
        elif total_secondary_months >= 18:
            severity = "MODERATE REGIONAL RIPPLE"
        else:
            severity = "CONTAINED LOCALIZED RIPPLE"

        return {
            'epicenter': {
                'project_code': str(epicenter_row['project_code']),
                'project_name': str(epicenter_row.get('project_name', epicenter_code)),
                'agency': epi_agency,
                'state': epi_state,
                'orig_cost_cr': epi_cost,
                'delay_shock_months': delay_shock_months
            },
            'cascade_summary': {
                'exposed_projects_count': len(cascaded_list),
                'total_secondary_delay_months': total_secondary_months,
                'total_cascade_escalation_cr': total_escalation_cr,
                'ripple_severity': severity
            },
            'cascaded_projects': cascaded_list
        }
