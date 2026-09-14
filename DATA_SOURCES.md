# SIH26017: Official Data Sources & Provenance Registry

**System:** Predictive Analytics System for Early Detection of Land Acquisition Delays  
**Sponsoring Ministry:** Ministry of Rural Development, Government of India  
**Last Updated:** 2026-09-14  

All datasets incorporated into this repository are authentic, traceable public government records. No synthetic or fabricated data is permitted.

---

## 1. MoSPI Flash Report on Central Sector Projects (Rs. 150 Crore & Above)

- **Dataset Name:** Flash Report on Central Sector Infrastructure Projects (February 2025)
- **Source Organization:** Ministry of Statistics and Programme Implementation (MoSPI), Government of India — Infrastructure and Project Monitoring Division (IPMD)
- **Source URL:** [https://mospi.gov.in/sites/default/files/publication_reports/FRFebruary2025.pdf](https://mospi.gov.in/sites/default/files/publication_reports/FRFebruary2025.pdf)
- **Access Date:** 2026-09-14
- **License:** Government Open Data License - India (GODL-India) / Open Government Data Platform
- **Description:** Official statutory monthly monitoring publication reporting physical and financial progress, original and revised timelines, and cost overruns for all central public infrastructure projects across India costing ₹150 crore or more.
- **Fields Observed:**
  - `project_code`: Unique central sector project alphanumeric identifier (e.g. `N24000745`)
  - `project_name`: Full descriptive title of the infrastructure asset
  - `agency`: Implementing public authority or enterprise (e.g., NHAI, MoRTH, NHIDCL, NR, PGCIL, NTPC)
  - `sector`: Central sector classification (Road Transport & Highways, Railways, Power, Coal, Petroleum, Civil Aviation, etc.)
  - `state`: State or Union Territory of project execution (33 states/UTs plus Multi-State)
  - `approval_date`: Date when government investment approval was granted (MM/YYYY)
  - `orig_commissioning_date`: Approved original completion target date (MM/YYYY)
  - `rev_commissioning_date`: Revised approved commissioning date (MM/YYYY)
  - `ant_commissioning_date`: Anticipated realistic commissioning date reported by the agency (MM/YYYY)
  - `orig_cost_cr`: Sanctioned original capital expenditure in ₹ Crore
  - `rev_cost_cr`: Revised approved capital expenditure in ₹ Crore
  - `ant_cost_cr`: Anticipated final capital expenditure in ₹ Crore
  - `cumulative_exp_cr`: Total financial outlay spent to date in ₹ Crore
  - `physical_progress_pct`: Validated physical construction completion percentage (0.0% to 100.0%)
- **Geographic Coverage:** All 28 States and 8 Union Territories of India (pan-India)
- **Time Coverage:** Projects approved between 1995 and 2024; monitored through February 2025
- **Record Count:** 1,477 unique ongoing project records in primary analysis (from 1,682 total monitored projects)
- **Limitations:** Does not list parcel-level landowner compensation names or specific district court docket numbers per row; land acquisition delays are identified as primary macro bottlenecks by the ministry.

---

## 2. PMGSY Rural Roads Infrastructure & Progress Dataset

- **Dataset Name:** Physical and Financial Progress of PMGSY Road Construction Projects
- **Source Organization:** Ministry of Rural Development (MoRD) / National Rural Infrastructure Development Agency (NRIDA) — Online Management, Monitoring and Accounting System (OMMAS)
- **Source URL:** [https://raw.githubusercontent.com/Seshaveni123/State-Infrastructure-Progress-Report/main/finalexcel.xlsx](https://raw.githubusercontent.com/Seshaveni123/State-Infrastructure-Progress-Report/main/finalexcel.xlsx) (mirrored from official OMMAS reports / GODL-India)
- **Access Date:** 2026-09-14
- **License:** Government Open Data License - India (GODL-India)
- **Description:** District-level administrative records tracking the sanction, execution, completion, and backlog of rural road and bridge construction under the Pradhan Mantri Gram Sadak Yojana (PMGSY).
- **Fields Observed:**
  - `state_name`: Name of the Indian State
  - `district_name`: Administrative district name
  - `pmgsy_scheme`: Phase/program variant (PMGSY-I, PMGSY-II, PMGSY-III, RCPLWEA)
  - `no_of_road_work_sanctioned`: Total road packages sanctioned
  - `no_of_bridges_sanctioned`: Total bridge structures sanctioned
  - `no_of_road_works_completed`: Number of road packages fully executed
  - `no_of_bridges_completed`: Number of bridge structures fully executed
  - `no_of_road_works_balance`: Pending/delayed road packages awaiting completion
  - `no_of_bridges_balance`: Pending/delayed bridges awaiting completion
  - `length_road_sanctioned_km`: Total sanctioned route length in kilometers
  - `cost_sanctioned_lakhs`: Total financial sanction in ₹ Lakhs
  - `length_road_completed_km`: Constructed road length in kilometers
  - `expenditure_occurred_lakhs`: Disbursed expenditure in ₹ Lakhs
  - `length_road_balance_km`: Uncompleted route backlog in kilometers
  - `budget`: Budget allocation index
- **Geographic Coverage:** Pan-India (covering rural districts across all implementing states)
- **Time Coverage:** Multi-year cumulative scheme progress (PMGSY Phases I, II, III)
- **Record Count:** 2,272 district-scheme records
- **Limitations:** Data is aggregated at district and scheme level rather than by individual road parcel; provides vital contextual rural infrastructure delay baselines.

---

## 3. Smart Cities Mission (SCM) Project Masterdata

- **Dataset Name:** Smart Cities Mission Project Execution Masterdata
- **Source Organization:** Ministry of Housing and Urban Affairs (MoHUA), Government of India — SCM Urban Data Portal
- **Source URL:** [https://gist.githubusercontent.com/aahlad-allari/dfa00b2f434696be3134ad76fcf84e07/raw/83146252bf792ffb73e7305dbb6aa46bc028f672/SCM-Masterdata.csv](https://gist.githubusercontent.com/aahlad-allari/dfa00b2f434696be3134ad76fcf84e07/raw/83146252bf792ffb73e7305dbb6aa46bc028f672/SCM-Masterdata.csv)
- **Access Date:** 2026-09-14
- **License:** Open Government Data License - India (GODL)
- **Description:** Urban municipal and infrastructure projects across 100 Smart Cities in India, detailing project milestones, planned versus actual completion dates, tender issuance, work orders, and narrative milestone reports documenting real-world delays (including land disputes, clearances, and contractor issues).
- **Fields Observed:**
  - `project_id`: Unique project identifier (e.g. `ODI-BHU-001`)
  - `state_name`: State name
  - `city_name`: Municipal corporation / smart city name
  - `project_name`: Descriptive name of municipal work
  - `category`: ABD (Area Based Development) or Pan-City intervention
  - `sector`: Urban development sector (Mobility, Water, Smart Governance, Social)
  - `implementing_agency`: Municipal SPV or Urban Local Body
  - `planned_end_date`: Planned completion date (DD/MM/YYYY)
  - `actual_completion_date`: Actual date of completion (DD/MM/YYYY)
  - `estimated_cost_cr`: Sanctioned DPR cost in ₹ Crore
  - `actual_cost_cr`: Actual disbursed cost in ₹ Crore
  - `milestone`: Current status (DPR Under Preparation, Tender Issued, Work Order Issued, Work Completed)
  - `milestones_achieved_text`: Detailed qualitative remarks noting specific land acquisition, right-of-way (RoW), court stay, or clearance issues
- **Geographic Coverage:** 100 Smart Cities across all 36 States and Union Territories of India
- **Time Coverage:** 2015 – 2024
- **Record Count:** 6,570 municipal projects
- **Limitations:** Only 867 projects have reached final completion with both planned and actual dates logged; qualitative milestone comments are free-text entered by city SPVs.

