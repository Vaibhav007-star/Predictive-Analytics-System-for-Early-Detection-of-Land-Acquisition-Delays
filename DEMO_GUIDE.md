# Hackathon Demonstration Guide (5–7 Minutes Master Pitch Script)

**System:** SIH26017: Predictive Analytics System for Early Detection of Land Acquisition Delays  
**Authority:** Ministry of Rural Development, Government of India  
**Target Audience:** Smart India Hackathon Grand Finale Judges & Line Ministry Technical Evaluators  
**Estimated Run Time:** 5 minutes 30 seconds – 7 minutes

---

## ⏱️ Pitch Timeline Overview

```
00:00 ─────── 01:00 ─────── 02:00 ─────── 03:00 ─────── 04:00 ─────── 05:00 ─────── 06:00 ─────── 07:00
 Executive    SHAP XAI      What-If      RFCTLARR      Weibull       Corridor      Contagion     Wrap-Up &
 Dashboard   Explainability  Sandbox    Statutory      Survival      Studio        Cascade       Judges Q&A
 (MoSPI 1.4k) (Math Drivers) (Twin)     & Notices      Hazards       (Leaflet)     Network
```

---

## 🖥️ Pre-Demo Setup Checklist

1. **Verify Backend is Running:**
   ```bash
   .\.venv\Scripts\python.exe -m uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Open Browser:** Navigate to `http://localhost:8000/app` (or `http://localhost:5173` if running Vite dev server).
3. **Verify Full-Screen:** Press `F11` for a clean presentation view.
4. **Initial User Session:** Default is set to **MoRD Admin (Executive Clearance)**.

---

## 🎙️ Step-by-Step Demonstration Script

### Minute 0:00 – 1:00: Problem Context & Executive Dashboard Overview

> **Spoken Script:**
> *"Respected Judges, infrastructure delays in India cost the national exchequer thousands of crores, and the primary bottleneck cited across line ministries is **land acquisition friction and Right-of-Way (RoW) encumbrances** under the RFCTLARR Act 2013.*
> 
> *Today, we present **SIH26017**: an enterprise-grade AI decision support and predictive analytics platform engineered for early delay detection.*
> 
> *Notice our top KPI cards: our platform actively monitors **1,477 authentic Central Sector infrastructure assets** directly ingested from the official MoSPI February 2025 Flash Report and PMGSY OMMAS. Every single record is 100% genuine — our repository adheres to a strict **Zero Synthetic Data protocol**.*
> 
> *Our calibrated machine learning engine achieves a state-of-the-art **ROC-AUC of 0.9425** and a **PR-AUC of 0.9607**, categorizing projects into transparent risk tiers: Low, Medium, High, and Critical."*

**Presenter Action on Screen:**
- Highlight the portfolio summary: 1,477 Projects, ₹31.8 Lakh Cr Portfolio Outlay, 65.5% National Delay Baseline.
- Point to the **Risk Distribution Chart** and scroll down to the **Executive Priority Queue**.

---

### Minute 1:00 – 2:00: Deep Inspection & Mathematical SHAP Explainability

> **Spoken Script:**
> *"Black-box predictions are unacceptable to District Collectors and Project Directors. When an administrative officer intervenes, they need to know **WHY** a project is at risk.*
> 
> *Let's click 'Inspect Project' on one of our top critical assets from the priority queue.*
> 
> *Inside the project inspection sheet, our integrated **SHAP TreeExplainer** mathematically isolates the exact feature contributions:
> 1. The **State Historical Land Acquisition Friction** adds statistical delay weight based on clearance precedents in this jurisdiction.
> 2. The **Linear Corridor Nature** (highways/railways) necessitates vast contiguous RoW handover.
> 3. The **Approval Date** falls post-RFCTLARR Act 2013, requiring multi-stage Social Impact Assessments and Section 19 R&R declarations.
> 
> *In line with responsible AI principles, our system never claims a factor 'caused' a delay — it states that it 'contributed to elevating delay risk' for human decision support."*

**Presenter Action on Screen:**
- Click **"Inspect Project"** on the first row of the Priority Queue.
- Scroll through the SHAP Risk Drivers and Favorable Mitigating Factors.

---

### Minute 2:00 – 3:00: What-If Counterfactual Policy Sandbox (Digital Twin)

> **Spoken Script:**
> *"Now, instead of just diagnosing delays, our system allows administrators to test solutions before committing public funds.*
> 
> *Let's switch to the **'What-If Sandbox' tab**.*
> 
> *Here is our **Digital Twin Engine**. Notice what happens when we adjust operational levers:
> - If we activate **'Dedicated SLAO Taskforce'**, state administrative friction drops.
> - If we toggle **'80% Contiguous RoW Handover Guarantee'** prior to civil contractor mobilization, risk plunges by over 12 points.
> - If we enable **'Contract Package Splitting'** and allocate a **10% Compensation Escrow Pre-Funding**, look at the simulated outcome:
> 
> *Our risk drops from 85 (CRITICAL) down to 58 (MEDIUM). The digital twin computes **14 Months of Gestation Overrun Avoided** and **₹340 Crores of Capital Cost Inflation Prevented**."*

**Presenter Action on Screen:**
- Click the **"What-If Sandbox"** tab inside the modal (or navigate to the top-level **Policy Sandbox** view).
- Slide the **Contract Package Splitting** to 2 or 3 packages.
- Check the **"Dedicated SLAO Taskforce"** and **"80% Contiguous RoW Handover Guarantee"** boxes.
- Point out the dynamic calculation of avoided months and saved capital escalation in ₹ Crores.

---

### Minute 3:00 – 4:00: RFCTLARR Act 2013 Statutory Compliance & Notice Drafter

> **Spoken Script:**
> *"Now let's switch to the **'RFCTLARR 2013 Advisory' tab**.*
> 
> *Linear delays often become legal disasters under **Section 25 of the 2013 Act**, which mandates that if an award under Section 23 is not declared within 12 months of the Section 19 publication, the entire acquisition lapses.*
> 
> *Our statutory engine tracks these milestones in real time. It detects the current phase, calculates lapsing risk, and provides immediate compliance directives.*
> 
> *Even better: with one click, District Collectors can draft **Gazette-Formatted Statutory Notices** — including Form 11 Preliminary Notification, Form 15 Objection Hearings, and Form 19 Award Declarations — completely formatted according to Central and State RFCTLARR Rules."*

**Presenter Action on Screen:**
- Click the **"RFCTLARR 2013 Advisory"** tab.
- Point out the **Section 25 Lapsing Risk Gauge** and statutory milestone progress bar.
- Click **"Generate Official Compliance Memorandum"**, showing the pre-populated official notice with project details, statutory citations, and signature block for the District Collector.

---

### Minute 4:00 – 5:00: Dynamic Survival Analysis & Weibull Hazard Curves

> **Spoken Script:**
> *"Next, let's examine the temporal dynamics by opening the **'Survival Hazard Curve' tab**.*
> 
> *Static delay predictions fail to capture that delay risk changes as a project ages. Our system fits a continuous-time **Weibull Survival Distribution** $S(t) = \exp(-(t/\lambda)^k)$.*
> 
> *Notice our curve: during the initial 12 months, the hazard rate is low. But our engine pinpoints the **Peak Danger Window at Month 18 to 28** — precisely when civil contractors mobilize and encounter unacquired land pockets.*
> 
> *It also generates empirical 80% and 95% completion confidence intervals, giving finance and planning departments reliable forecasting data."*

**Presenter Action on Screen:**
- Click the **"Survival Hazard Curve"** tab.
- Point to the **Delay Survival Probability S(t)** and the highlighted **Peak Danger Window**.
- Show the table of monthly hazard rates $h(t)$ and cumulative hazard $H(t)$.
- Close the modal.

---

### Minute 5:00 – 6:00: Linear Corridor Alignment Studio (GeoJSON & Leaflet)

> **Spoken Script:**
> *"Now, let's explore our geospatial capabilities by clicking **'Corridor Studio'** in the top navigation.*
> 
> *Here, we analyze linear infrastructure routes — such as the **Delhi-Mumbai Expressway** and the **Western Dedicated Freight Corridor**.*
> 
> *Our engine traces the exact polyline, computes geodesic Haversine distances, and performs automated environmental buffer screening:
> - **Forest Diversion Overlap:** Quantifies environmental buffer stretches requiring MoEFCC Stage-I clearances.
> - **Hydrologic River Crossings:** Identifies major river bridge spans requiring Central Water Commission approvals.
> - **Settlement Density:** Estimates peri-urban displacement friction.*
> 
> *These feed into a composite **Corridor Vulnerability Index** with actionable clearance directives."*

**Presenter Action on Screen:**
- Click the **"Corridor Studio"** tab in the navbar.
- Select a corridor from the dropdown (e.g., *Delhi-Mumbai Expressway* or *Western Dedicated Freight Corridor*).
- The map automatically centers and displays the polyline route, waypoints, environmental metrics (Forest %, River Crossings, Settlement Density), and clearance action plan.

---

### Minute 6:00 – 7:00: Infrastructure Contagion Network & Delay Cascade Simulator

> **Spoken Script:**
> *"Finally, infrastructure projects do not exist in isolation. Delays in one asset ripple into adjacent freight lines, ports, and power plants.*
> 
> *Let's click **'Contagion Network'** in the top navbar.*
> 
> *This is our **Multi-Relational Knowledge Graph**, linking 1,477 infrastructure assets across shared implementing agencies, administrative jurisdictions, and logistics corridors.*
> 
> *Let's run our **Delay Cascade Simulator**:
> - We select an epicenter asset.
> - We inject a simulated **18-month delay shock**.
> - Watch the contagion propagation engine: it traces dependencies and calculates that this single delay induces secondary delays across dependent projects, triggering substantial cascaded cost escalation.*
> 
> *This gives Central Sector Coordination Committees (CSPCC) macro-prudential oversight across the national infrastructure pipeline."*

**Presenter Action on Screen:**
- Click **"Contagion Network"** in the navbar.
- Show the network topology metrics (Total Nodes, Total Dependency Links).
- In the Cascade Simulator panel, select an epicenter project and click **"Simulate Delay Cascade & Capital Ripple"**.
- Point out the cascaded projects list, secondary delay months, and total cascade escalation in ₹ Crores.

---

### Minute 7:00+: Summary, Admin Role Separation & Judges Q&A

> **Spoken Script:**
> *"In summary, SIH26017 bridges predictive machine learning, statutory law, geospatial intelligence, and network theory into an integrated national decision support system:
> 1. **100% authentic government records** (MoSPI & PMGSY) with Zero Synthetic Data.
> 2. **Calibrated ML & XAI** (0.9425 ROC-AUC with SHAP mathematical attribution).
> 3. **Digital Twin Policy Sandbox** (Real-time counterfactual lever testing).
> 4. **RFCTLARR 2013 Compliance & Notice Drafter** (Section 25 lapse prevention).
> 5. **Weibull Survival Analysis** (Peak danger window & confidence intervals).
> 6. **Linear Corridor Studio** (Environmental friction & buffer screening).
> 7. **Contagion Knowledge Graph** (Macro-prudential delay cascade simulation).*
> 
> *Thank you, and we welcome your questions."*

---

## ❓ Anticipated Grand Finale Judge Questions & Authoritative Answers

### Q1: "How do you guarantee that there is no data leakage in your model?"
> **Answer:** *"All 19 baseline features are strictly restricted to variables knowable at the original project sanction date (sanctioned cost, planned duration, approval year/month, line ministry, linear corridor flag, and empirical Bayes historical state/agency delay rates). All post-hoc execution outcomes — such as revised costs, cumulative expenditures, physical progress percentages, or actual commissioning dates — are strictly quarantined. Our automated leakage audit verified that no feature has a correlation $|r| \ge 0.42$ with the outcome."*

### Q2: "Why use both SHAP and Weibull Survival Analysis?"
> **Answer:** *"SHAP explains **WHAT** baseline factors contribute to a project's overall delay risk at sanction time. Weibull Survival Analysis models **WHEN** that risk is most acute across time $t$. By combining both, an administrator knows what risk drivers to target and exactly when in the project lifecycle (the Peak Danger Window) to mobilize field taskforces."*

### Q3: "How does the Contagion Engine model delay propagation?"
> **Answer:** *"The Contagion Engine builds an adjacency graph based on shared administrative jurisdictions, common implementing agencies, and shared multimodal logistics corridors. When an epicenter project suffers a delay shock, the topological engine propagates delays through inter-asset links scaled by connection strength and threshold damping, preventing uncontrolled runaways while surfacing critical systemic bottlenecks."*

### Q4: "Is this system compliant with government IT and data security standards?"
> **Answer:** *"Yes. It implements HMAC-SHA256 authenticated sessions with Role-Based Access Control (Admin vs Viewer) and maintains an append-only, tamper-evident SQLite audit log tracking every user action, timestamp, target project, and administrative directive."*
