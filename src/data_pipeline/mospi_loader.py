"""
MoSPI Flash Report (February 2025) Loader and Extractor.
Extracts authentic Central Sector Infrastructure Projects from the official MoSPI Flash Report PDF.
STRICT RULE: Never fabricate ML data — all records must trace directly back to the official MoSPI publication.
"""

import os
import re
import pandas as pd
import pypdf
from typing import Optional, List, Dict, Any

STATES = [
    'ANDAMAN AND NICOBAR ISLANDS', 'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM',
    'BIHAR', 'CHHATTISGARH', 'DELHI', 'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH',
    'JAMMU AND KASHMIR', 'JHARKHAND', 'KARNATAKA', 'KERALA', 'LADAKH', 'MADHYA PRADESH',
    'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'MULTI STATE', 'NAGALAND', 'ODISHA',
    'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TELANGANA', 'TRIPURA', 'UTTAR PRADESH',
    'UTTARAKHAND', 'WEST BENGAL'
]

SECTORS = [
    'CIVIL AVIATION', 'COAL', 'DEPARTMENT OF HIGHER EDUCATION', 'DPIIT', 'FINANCE',
    'HEALTH AND FAMILY WELFARE', 'HOME AFFAIRS', 'MINES', 'PETROLEUM', 'POWER',
    'RAILWAYS', 'ROAD TRANSPORT AND HIGHWAYS', 'SHIPPING AND PORTS', 'SOCIAL JUSTICE',
    'STEEL', 'TELECOMMUNICATIONS', 'URBAN DEVELOPMENT', 'WATER RESOURCES'
]

def parse_date_mmyyyy(val: Optional[str]) -> Optional[str]:
    """Converts MM/YYYY or MM-YYYY string into ISO date YYYY-MM-01."""
    if not val or val.strip() in ('N.A.', 'NA', '-'):
        return None
    cleaned = val.strip().replace('-', '/')
    parts = cleaned.split('/')
    if len(parts) == 2:
        try:
            month = int(parts[0])
            year = int(parts[1])
            if 1 <= month <= 12 and 1990 <= year <= 2050:
                return f"{year:04d}-{month:02d}-01"
        except (ValueError, TypeError):
            return None
    return None

def compute_month_diff(start_iso: Optional[str], end_iso: Optional[str]) -> Optional[int]:
    """Calculates difference in months between two YYYY-MM-01 strings."""
    if not start_iso or not end_iso:
        return None
    try:
        sy, sm, _ = [int(x) for x in start_iso.split('-')]
        ey, em, _ = [int(x) for x in end_iso.split('-')]
        return (ey - sy) * 12 + (em - sm)
    except Exception:
        return None

def extract_mospi_projects(pdf_path: str) -> pd.DataFrame:
    """
    Parses Table 7 (pages 42 to 242) from the authentic MoSPI Flash Report PDF.
    Returns a normalized pandas DataFrame.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"MoSPI Flash Report PDF not found at: {pdf_path}")

    reader = pypdf.PdfReader(pdf_path)
    num_pages = len(reader.pages)
    
    current_state = 'ANDAMAN AND NICOBAR ISLANDS'
    current_sector = 'CIVIL AVIATION'

    project_block_regex = re.compile(
        r'\(([A-Za-z0-9_&/ -]+?)\s*\)\s*\n'           # (1) Agency
        r'\((N\d{8}\s*)\)\s*\n'                       # (2) Project code
        r'(\d{1,2}[-/]\d{4})\s+(\d{1,2}/\d{4}|N\.A\.)\s*\n' # (3) Approval date, (4) Original commissioning date
        r'\(\s*(.*?)\s*\)\s*\n'                      # (5) Revised commissioning date
        r'\{\s*(.*?)\s*\}\s*\n'                      # (6) Anticipated commissioning date
        r'([\d,.]+)\s*\n'                            # (7) Original cost (Rs. Cr)
        r'\(\s*(.*?)\s*\)\s*\n'                      # (8) Revised cost (Rs. Cr)
        r'\{\s*(.*?)\s*\}\s*\n'                      # (9) Anticipated cost (Rs. Cr)
        r'([\d,.]+)\s+([\d,.]+)',                     # (10) Cumulative exp, (11) Physical progress %
        re.MULTILINE
    )

    records: List[Dict[str, Any]] = []

    # Table 7 spans pages 42 (index 41) to 242 (index 241)
    end_page = min(243, num_pages)
    for p in range(41, end_page):
        raw_text = reader.pages[p].extract_text()
        norm_text = re.sub(r'\s+', ' ', raw_text)

        # Update current state if a state name begins on this page
        for s in STATES:
            if s in norm_text:
                current_state = s
                break

        # Update current sector if a sector name appears on this page
        for sec in SECTORS:
            if sec in norm_text:
                current_sector = sec

        matches = list(project_block_regex.finditer(raw_text))
        last_end = 0

        for m in matches:
            start = m.start()
            name_chunk = raw_text[last_end:start].strip()
            last_end = m.end()

            # Clean name chunk of table headers
            lines = [l.strip() for l in name_chunk.split('\n') if l.strip()]
            cleaned_lines = [
                l for l in lines
                if not any(h in l for h in [
                    'Sl No', 'Approval', 'Original', 'Expenditure', 'Progress',
                    'Commissioning', 'State Sector', 'in Rs. Crore', 'Table:-7'
                ])
            ]
            proj_name = ' '.join(cleaned_lines[-4:]) if cleaned_lines else 'Project ' + m.group(2).strip()
            # Clean leading serial numbers and sector text from project name
            proj_name = re.sub(r'^(?:\d+|' + '|'.join(SECTORS) + r'|\s)+', '', proj_name).strip()
            if not proj_name:
                proj_name = f"Project {m.group(2).strip()}"

            # Parse numbers
            try:
                orig_cost = float(m.group(7).replace(',', ''))
            except ValueError:
                orig_cost = 0.0

            rev_cost_str = m.group(8).replace(',', '').strip()
            rev_cost = float(rev_cost_str) if rev_cost_str not in ('N.A.', '') else None

            ant_cost_str = m.group(9).replace(',', '').strip()
            ant_cost = float(ant_cost_str) if ant_cost_str not in ('N.A.', '') else None

            try:
                expenditure = float(m.group(10).replace(',', ''))
            except ValueError:
                expenditure = 0.0

            try:
                progress = float(m.group(11).replace(',', ''))
            except ValueError:
                progress = 0.0

            # Dates
            approval_iso = parse_date_mmyyyy(m.group(3))
            orig_comm_iso = parse_date_mmyyyy(m.group(4))
            rev_comm_iso = parse_date_mmyyyy(m.group(5))
            ant_comm_iso = parse_date_mmyyyy(m.group(6))

            # Delay target calculation
            # Primary target: delay between anticipated and original commissioning date
            delay_months = compute_month_diff(orig_comm_iso, ant_comm_iso)
            is_delayed = 1 if (delay_months is not None and delay_months > 0) else 0

            # Derived ratios
            cost_overrun_pct = None
            if orig_cost > 0 and ant_cost is not None:
                cost_overrun_pct = round(((ant_cost - orig_cost) / orig_cost) * 100.0, 2)

            exp_ratio = round(expenditure / orig_cost, 4) if orig_cost > 0 else None

            records.append({
                'project_code': m.group(2).strip(),
                'project_name': proj_name[:200],
                'sector': current_sector,
                'agency': m.group(1).strip(),
                'state': current_state,
                'approval_date': approval_iso,
                'orig_commissioning_date': orig_comm_iso,
                'rev_commissioning_date': rev_comm_iso,
                'ant_commissioning_date': ant_comm_iso,
                'orig_cost_cr': orig_cost,
                'rev_cost_cr': rev_cost,
                'ant_cost_cr': ant_cost,
                'cumulative_exp_cr': expenditure,
                'physical_progress_pct': progress,
                'delay_months': delay_months,
                'is_delayed': is_delayed,
                'cost_overrun_pct': cost_overrun_pct,
                'expenditure_ratio': exp_ratio,
                'source_page': p + 1,
                'source_dataset': 'MoSPI_Flash_Report_Feb2025'
            })

    df = pd.DataFrame(records)
    # Deduplicate by project code (keep first occurrence)
    df = df.drop_duplicates(subset=['project_code'])
    return df

if __name__ == "__main__":
    pdf_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "raw", "FRFebruary2025.pdf")
    df = extract_mospi_projects(pdf_file)
    print(f"Extracted {len(df)} authentic projects.")
    print("Sample row:\n", df.iloc[0])

