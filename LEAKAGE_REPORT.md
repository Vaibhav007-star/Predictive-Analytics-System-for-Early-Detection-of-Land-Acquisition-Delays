# SIH26017: Comprehensive Data Leakage & Integrity Report

> **STRICT DIRECTIVE:** All predictors must be strictly knowable at project baseline (approval time). Future-leaking execution fields are prohibited.

## ✅ LEAKAGE AUDIT STATUS: PASSED (ZERO LEAKAGE VERIFIED)

- All features represent baseline parameters knowable at project approval.
- No post-hoc outcome variables (anticipated dates, revised costs, progress %, expenditure) are present in the feature space.
- No feature exhibits trivial target correlation ($|r| < 0.90$).

### Feature-to-Target Correlation & Mutual Information Audit
| Feature Name | Pearson Correlation ($r$) | Mutual Information | Leakage Risk Assessment |
| :--- | :---: | :---: | :--- |
| `log_orig_cost` | -0.0574 | 0.0000 | **SAFE** |
| `is_mega_project` | -0.0424 | 0.0000 | **SAFE** |
| `planned_duration_months` | -0.1622 | 0.0455 | **SAFE** |
| `log_planned_duration` | -0.1917 | 0.0750 | **SAFE** |
| `approval_year` | -0.3957 | 0.1615 | **SAFE** |
| `approval_month` | -0.0313 | 0.0000 | **SAFE** |
| `post_larr_act_2013` | -0.0897 | 0.0102 | **SAFE** |
| `is_linear_infrastructure` | +0.0396 | 0.0267 | **SAFE** |
| `sector_road_transport_and_highways` | +0.0691 | 0.0068 | **SAFE** |
| `sector_power` | -0.0511 | 0.0161 | **SAFE** |
| `sector_railways` | -0.0593 | 0.0000 | **SAFE** |
| `sector_urban_development` | +0.0145 | 0.0106 | **SAFE** |
| `sector_petroleum` | +0.0626 | 0.0002 | **SAFE** |
| `sector_coal` | -0.1221 | 0.0000 | **SAFE** |
| `sector_water_resources` | +0.0337 | 0.0127 | **SAFE** |
| `sector_civil_aviation` | -0.0169 | 0.0042 | **SAFE** |
| `sector_other` | +0.0097 | 0.0000 | **SAFE** |
| `agency_hist_delay_rate` | +0.4173 | 0.1064 | **SAFE** |
| `state_hist_delay_rate` | +0.2935 | 0.0445 | **SAFE** |

### Forbidden Variables Confirmed Excluded
- `projects.ant_commissioning_date` (Excluded: post-hoc completion / outcome variable)
- `projects.rev_commissioning_date` (Excluded: post-hoc completion / outcome variable)
- `projects.ant_cost_cr` (Excluded: post-hoc completion / outcome variable)
- `projects.rev_cost_cr` (Excluded: post-hoc completion / outcome variable)
- `projects.cost_overrun_pct` (Excluded: post-hoc completion / outcome variable)
- `projects.cumulative_exp_cr` (Excluded: post-hoc completion / outcome variable)
- `projects.expenditure_ratio` (Excluded: post-hoc completion / outcome variable)
- `projects.physical_progress_pct` (Excluded: post-hoc completion / outcome variable)
- `projects.delay_months` (Excluded: post-hoc completion / outcome variable)
- `projects.is_delayed` (Excluded: post-hoc completion / outcome variable)
- `projects.source_page` (Excluded: post-hoc completion / outcome variable)
- `projects.source_dataset` (Excluded: post-hoc completion / outcome variable)
- `projects.split` (Excluded: post-hoc completion / outcome variable)
- `projects.project_code` (Excluded: post-hoc completion / outcome variable)
- `projects.project_name` (Excluded: post-hoc completion / outcome variable)

