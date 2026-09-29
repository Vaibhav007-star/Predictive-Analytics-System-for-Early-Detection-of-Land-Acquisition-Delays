# SIH26017: Comprehensive Data Quality & Audit Report

> **STRICT COMPLIANCE NOTICE:** All metrics in this report are mathematically computed from authentic government datasets. No data, labels, dates, or statistics have been fabricated.

## Executive Summary
- **MoSPI Central Sector Projects:** 1,477 records | Delay rate: 65.1% | Mean delay: 20.7 months
- **PMGSY District Rural Road Records:** 2,272 district-level entries across all Indian States
- **Smart Cities Mission Projects:** 6,570 projects across 36 States/UTs

## Detailed Dataset Audits
### Data Quality: MoSPI Central Sector Projects (Feb 2025)
- **Total Records:** 1,477
- **Unique Keys:** 1,477
- **Duplicates:** 0 (0.0%)

#### Column Completeness & Missing Values
| Column Name | Missing Count | Missing (%) |
| :--- | :---: | :---: |
| `project_code` | 0 | 0.0% |
| `project_name` | 0 | 0.0% |
| `sector` | 0 | 0.0% |
| `agency` | 0 | 0.0% |
| `state` | 0 | 0.0% |
| `approval_date` | 0 | 0.0% |
| `orig_commissioning_date` | 0 | 0.0% |
| `rev_commissioning_date` | 1,477 | 100.0% |
| `ant_commissioning_date` | 0 | 0.0% |
| `orig_cost_cr` | 0 | 0.0% |
| `rev_cost_cr` | 1,132 | 76.64% |
| `ant_cost_cr` | 0 | 0.0% |
| `cumulative_exp_cr` | 0 | 0.0% |
| `physical_progress_pct` | 0 | 0.0% |
| `delay_months` | 0 | 0.0% |
| `is_delayed` | 0 | 0.0% |
| `cost_overrun_pct` | 0 | 0.0% |
| `expenditure_ratio` | 0 | 0.0% |
| `source_page` | 0 | 0.0% |
| `source_dataset` | 0 | 0.0% |

#### Date Field Validation
| Date Column | Populated | Invalid Count | Invalid (%) | Min Date | Max Date |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `approval_date` | 1,477 | 0 | 0.0% | 1991-01-01 | 2024-12-01 |
| `orig_commissioning_date` | 1,477 | 0 | 0.0% | 2012-12-01 | 2033-07-01 |
| `rev_commissioning_date` | 0 | 0 | 0.0% | N/A | N/A |
| `ant_commissioning_date` | 1,477 | 0 | 0.0% | 2014-03-01 | 2034-09-01 |

### Data Quality: PMGSY District Infrastructure Progress
- **Total Records:** 2,272
- **Unique Keys:** 716
- **Duplicates:** 1556 (68.49%)

#### Column Completeness & Missing Values
| Column Name | Missing Count | Missing (%) |
| :--- | :---: | :---: |
| `state_name` | 0 | 0.0% |
| `district_name` | 0 | 0.0% |
| `pmgsy_scheme` | 0 | 0.0% |
| `no_of_road_work_sanctioned` | 0 | 0.0% |
| `no_of_bridges_sanctioned` | 0 | 0.0% |
| `no_of_road_works_completed` | 0 | 0.0% |
| `no_of_bridges_completed` | 0 | 0.0% |
| `no_of_road_works_balance` | 0 | 0.0% |
| `no_of_bridges_balance` | 0 | 0.0% |
| `length_road_sanctioned_km` | 0 | 0.0% |
| `cost_sanctioned_lakhs` | 0 | 0.0% |
| `length_road_completed_km` | 0 | 0.0% |
| `expenditure_occurred_lakhs` | 0 | 0.0% |
| `length_road_balance_km` | 0 | 0.0% |
| `budget` | 0 | 0.0% |
| `work_completion_rate_pct` | 0 | 0.0% |
| `length_completion_rate_pct` | 0 | 0.0% |
| `source_dataset` | 0 | 0.0% |

### Data Quality: Smart Cities Mission Masterdata
- **Total Records:** 6,570
- **Unique Keys:** 6,570
- **Duplicates:** 0 (0.0%)

#### Column Completeness & Missing Values
| Column Name | Missing Count | Missing (%) |
| :--- | :---: | :---: |
| `project_id` | 0 | 0.0% |
| `state_name` | 0 | 0.0% |
| `city_name` | 0 | 0.0% |
| `project_name` | 0 | 0.0% |
| `category` | 0 | 0.0% |
| `sector` | 0 | 0.0% |
| `implementing_agency` | 0 | 0.0% |
| `planned_end_date` | 4,338 | 66.03% |
| `actual_completion_date` | 5,627 | 85.65% |
| `delay_days` | 5,707 | 86.86% |
| `is_delayed` | 5,707 | 86.86% |
| `estimated_cost_cr` | 119 | 1.81% |
| `actual_cost_cr` | 0 | 0.0% |
| `milestone` | 0 | 0.0% |
| `has_land_acquisition_mention` | 0 | 0.0% |
| `has_clearance_mention` | 0 | 0.0% |
| `milestones_achieved_text` | 0 | 0.0% |
| `source_dataset` | 0 | 0.0% |

#### Date Field Validation
| Date Column | Populated | Invalid Count | Invalid (%) | Min Date | Max Date |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `planned_end_date` | 2,232 | 0 | 0.0% | 2001-07-19 | 2035-04-15 |
| `actual_completion_date` | 943 | 0 | 0.0% | 2010-05-06 | 2022-06-17 |

