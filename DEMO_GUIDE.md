# Hackathon Demonstration Guide (3–5 Minutes Pitch Script)

**System:** SIH26017: Predictive Analytics System for Early Detection of Land Acquisition Delays  
**Authority:** Ministry of Rural Development, Government of India  
**Target Audience:** Smart India Hackathon Judges & Line Ministry Technical Evaluators  
**Estimated Run Time:** 3 minutes 45 seconds – 5 minutes

---

## ⏱️ Pitch Timeline Overview

```
00:00 ──────────────── 01:00 ─── 01:00 ──────── 02:00 ─── 02:00 ──────── 03:15 ─── 03:15 ──────── 04:15 ─── 04:15 ──── 05:00
   Dashboard Overview        High-Risk Project           Explain WHY (SHAP)       Intervention & RBAC      Conclusion &
  & Authentic Data Provenance   Selection from Queue     & WHERE (Leaflet Map)    Audit Trail Demo         Q&A Readiness
```

---

## 🖥️ Pre-Demo Setup Checklist

1. **Verify Backend is Running:**
   ```bash
   py -3.12 -m uvicorn src.api.app:app --host 0.0.0.0 --port 8000
   ```
2. **Open Browser:** Navigate to `http://localhost:8000/app` (or `http://localhost:5173` if running Vite dev server).
3. **Verify Full-Screen:** Press `F11` for clean, professional projection.

---

## 🎙️ Step-by-Step Demonstration Script

### Minute 0:00 – 1:00: Problem Context & Executive Dashboard Overview

> **Spoken Script:**
> *"Respected Judges, infrastructure delays in India cost thousands of crores, and the number one bottleneck cited by the Ministry of Rural Development and MoSPI is **land acquisition friction and Right-of-Way (RoW) disputes** under the RFCTLARR Act 2013.*
> 
> *Today, we present **SIH26017**: an end-to-end Predictive Analytics & Decision Support System designed for early delay detection.*
> 
> *Notice our top KPI cards: our system monitors **1,477 authentic Central Sector infrastructure assets** from the official MoSPI February 2025 publication. Every single number you see is 100% real — our repository enforces a strict **Zero Synthetic Data protocol**.*
> 
> *Our calibrated machine learning engine achieves an out-of-sample **ROC-AUC of 0.9425** and a **PR-AUC of 0.9607**, categorizing national projects into actionable risk tiers: Low, Medium, High, and Critical."*

**Presenter Action on Screen:**
- Point cursor to the KPI cards: Total Projects (1,477), Overall Delay Rate (65.5%), and the Risk Distribution Chart.
- Scroll down slightly to show the **Executive Priority Queue** sorted by descending risk score.

---

### Minute 1:00 – 2:00: Selecting High-Risk Project from Priority Queue

> **Spoken Script:**
> *"Rather than drowning District Collectors in a catalog of 1,477 assets, our system surfaces an **Executive Priority Queue**. At the very top, we see the high-risk infrastructure corridors requiring immediate administrative intervention.*
> 
> *Let's inspect this top project: **Project Code N24000745** (or any top project in CRITICAL tier with risk score 80+). Notice the original sanctioned cost, the planned duration, and the predicted risk score of 85+ (CRITICAL).*
> 
> *Let's click 'Inspect Project' to open the deep-dive decision support sheet."*

**Presenter Action on Screen:**
- Click **"Inspect Project"** on the first project in the Priority Queue.
- The **Project Detail Modal** opens up smoothly with complete financial and schedule telemetry.

---

### Minute 2:00 – 3:15: Explain WHY (SHAP XAI) & WHERE (Geospatial GIS Map)

> **Spoken Script:**
> *"A black-box prediction is useless to an administrative officer. An official needs to know **WHY** a project is delayed and **WHERE** the bottleneck lies.*
> 
> *Here, our integrated **SHAP TreeExplainer** decomposes the exact mathematical drivers:
> 1. The **State Historical Land Acquisition Delay Rate** adds significant risk weight based on past clearance friction in this jurisdiction.
> 2. The project's **Linear Corridor Nature** (highways/rail) requires expansive contiguous land acquisition.
> 3. Its **Approval Date** falls post-RFCTLARR Act 2013, requiring multi-stage Social Impact Assessments and Section 19 R&R declarations.
> 
> *Crucially, notice our responsible AI policy banner: our model **never claims a factor 'caused' a delay** — it identifies statistical factors that 'contributed to elevating delay risk' for human decision support.*
> 
> *Now, let's close this modal for a moment and switch to the **GIS Map tab**.*
> 
> *Here is our interactive Leaflet map plotting projects across all 33 Indian States and Union Territories. We adhere to absolute scientific honesty: because open government records report central sector projects at the State level, each marker is plotted at the **State Administrative Centroid** and explicitly labeled: `State-level centroid` — we never fabricate fake GPS coordinates."*

**Presenter Action on Screen:**
- Scroll through the SHAP Risk Drivers and Favorable Mitigating Factors list.
- Close the modal and click the **"GIS Map"** tab in the top navigation.
- Click a pin marker (e.g. Maharashtra, Uttar Pradesh, or Tamil Nadu) to show the popup with risk badges and the explicit `geo_precision` disclosure.

---

### Minute 3:15 – 4:15: Actionable Recommendation, Admin Intervention & Audit Trail

> **Spoken Script:**
> *"Now let's turn predictive intelligence into **administrative action**.*
> 
> *Returning to our project modal, the system generates a plain-language **Recommended Administrative Directive** mapped directly from the top SHAP driver: for example, 'Convene State Central Sector Projects Coordination Committee (CSPCC); schedule joint review with District Collector / CALA for encumbrance-free land handover.'*
> 
> *Notice our user profile in the top-right: we are logged in as **Shri R. K. Sharma (Joint Secretary, MoRD) with Admin clearance**.*
> 
> *As an administrator, I can immediately record an official intervention right here. I select the category: **'SLAO Field Deployment & Joint Verification'**, enter my operational directive: **'Directed CALA and District Collector to complete joint survey of remaining 18.4 km RoW by end of month'**, and click Submit.*
> 
> *The intervention is instantly recorded and attached to this project's permanent timeline.*
> 
> *Now, let's click the **'Audit Trail'** button in the header.*
> 
> *Notice the tamper-evident log in SQLite: it records who took the action, their role, the timestamp, the target project code, and the operational notes. This establishes complete administrative accountability."*

**Presenter Action on Screen:**
- Switch back to the project modal.
- In the "Record Administrative Intervention" form, select an action and enter a brief operational note.
- Click **"Submit Official Intervention"** and point out the green success confirmation.
- Close the modal and click the **"Audit Trail"** button in the top navbar.
- Point to the newly created `INTERVENTION_CREATED` record with ISO timestamp and admin details.

---

### Minute 4:15 – 5:00: Role Separation, Zero-Fabrication Guarantee & Wrap-Up

> **Spoken Script:**
> *"Finally, we demonstrate role separation. By clicking **'Switch'** in the navbar, we seamlessly toggle to **'Public Auditor (Viewer Clearance)'**.*
> 
> *Now, if an auditor inspects a project, they have full visibility into the predictive scores and SHAP explainability, but the intervention form and internal audit log are disabled in accordance with government data governance standards.*
> 
> *To summarize:*
> - *100% authentic government data (MoSPI & PMGSY).*
> - *State-of-the-art predictive performance: **0.9425 ROC-AUC, 0.9607 PR-AUC**.*
> - *Explainable AI via SHAP and plain-language action directives.*
> - *Interactive Leaflet GIS with honest precision disclosures.*
> - *Administrative role-based intervention logging and immutable audit trails.*
> 
> *Thank you, and we are now ready for your questions."*

**Presenter Action on Screen:**
- Click **"Switch"** next to the user badge to switch to `Viewer`.
- Open the project modal briefly to show the read-only notice: *"Viewing mode (Auditor clearance). Intervention logging requires MoRD Administrative credentials."*
- Return to the Dashboard view and await judge questions.

---

## ❓ Anticipated Judge Questions & Bulletproof Responses

### Q1: "How do you ensure there is no data leakage in your model?"
> **Answer:** *"All 19 baseline features are strictly restricted to variables knowable at the original project sanction date (sanctioned cost, planned duration, approval year/month, line ministry, linear corridor flag, and empirical Bayes historical state/agency delay rates). All post-hoc execution outcomes — such as revised costs, cumulative expenditures, physical progress percentages, or actual commissioning dates — are strictly quarantined. Our automated leakage audit verified that no feature has a correlation $|r| \ge 0.42$ with the outcome."*

### Q2: "Why didn't you plot exact sub-meter GPS coordinates on the map?"
> **Answer:** *"In accordance with our strict non-fabrication directive, we refuse to invent synthetic latitude and longitude coordinates. The MoSPI Central Sector Flash Report reports projects at the State/UT level. We therefore map projects to authentic State Administrative Centroids and explicitly label each marker with `State-level centroid (MoSPI official location)`. We believe scientific honesty is paramount for government deployment."*

### Q3: "Can this model be used to automatically penalize contractors?"
> **Answer:** *"No. Under our Responsible AI framework (documented in `RESPONSIBLE_AI.md`), this system is designed strictly for human-in-the-loop decision support. SHAP feature attributions represent statistical risk associations, not legal proof of fault. It serves to alert District Collectors and Project Directors to deploy proactive mitigation before timeline slips occur."*

