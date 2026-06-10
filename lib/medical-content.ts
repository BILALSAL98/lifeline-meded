/**
 * Lifeline Medical Education — Medical Content Library
 * High-yield content organized by system and topic.
 * Each topic is structured for board exam preparation (Step 1 + Step 2).
 */

export interface ContentBullet {
  text: string;
  highYield?: boolean;   // Mark as high-yield for boards
  step?: "step1" | "step2" | "both";
}

export interface ContentSection {
  id: string;
  heading: string;
  type: "concept" | "pathophysiology" | "presentation" | "diagnostics" | "management" | "pharmacology" | "pearls" | "traps" | "comparison";
  icon: string;
  bullets: ContentBullet[];
}

export interface MedicalTopic {
  id: string;
  name: string;
  system: string;
  subtopics?: string[];
  lifeline_summary: string;   // One-paragraph high-yield summary
  sections: ContentSection[];
  tags: string[];
  difficulty: 1 | 2 | 3;
  board_relevance: "step1" | "step2" | "both";
}

export interface MedicalSystem {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: MedicalTopic[];
}

export const MEDICAL_CONTENT: MedicalSystem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "cardiology",
    name: "Cardiology",
    icon: "❤️",
    color: "#f87171",
    topics: [
      {
        id: "heart_failure",
        name: "Heart Failure",
        system: "Cardiology",
        difficulty: 3,
        board_relevance: "both",
        tags: ["HFrEF", "HFpEF", "BNP", "EF", "RAAS", "diuretics"],
        lifeline_summary: "Heart failure occurs when the heart cannot pump sufficient blood to meet the body's metabolic demands. HFrEF (EF <40%) is primarily systolic dysfunction; HFpEF (EF ≥50%) is diastolic dysfunction. BNP is the key biomarker. Treatment of HFrEF: ACEi/ARB + beta-blocker + diuretic + spironolactone — all reduce mortality. Precipitants: AFib, MI, hypertension, medication non-compliance, dietary sodium.",
        sections: [
          {
            id: "hf_patho", heading: "Pathophysiology", type: "pathophysiology", icon: "🔬",
            bullets: [
              { text: "Reduced CO → compensatory sympathetic activation (tachycardia, vasoconstriction) and RAAS activation (Na+/water retention)", highYield: true, step: "step1" },
              { text: "Chronic SNS + RAAS activation → cardiac remodeling: hypertrophy, fibrosis, myocyte apoptosis", step: "step1" },
              { text: "Frank-Starling: increased preload initially compensates, but failing heart operates on descending limb — more volume = less output", highYield: true, step: "step1" },
              { text: "LV failure → ↑ LVEDP → ↑ pulmonary capillary pressure → pulmonary edema", step: "step1" },
              { text: "RV failure → ↑ systemic venous pressure → JVD, hepatomegaly, peripheral edema", step: "step1" },
            ]
          },
          {
            id: "hf_sx", heading: "Clinical Presentation", type: "presentation", icon: "🩺",
            bullets: [
              { text: "Left HF: dyspnea on exertion, orthopnea (3-pillow), PND, cardiac asthma, S3 gallop, crackles", highYield: true, step: "both" },
              { text: "Right HF: JVD, hepatomegaly, ascites, bilateral pitting edema, hepatojugular reflux", highYield: true },
              { text: "Mnemonic FAILURE: Fatigue, Activity limitation, Increased dyspnea, Leg edema, Unintentional weight gain, Rales, Elevated JVP/S3" },
              { text: "S3 gallop = most specific for systolic dysfunction. S4 = stiff ventricle (diastolic)." },
              { text: "Cheyne-Stokes respirations in severe HF (oscillating between apnea and hyperpnea)" },
            ]
          },
          {
            id: "hf_dx", heading: "Diagnostics", type: "diagnostics", icon: "🧪",
            bullets: [
              { text: "BNP >400 pg/mL = HF likely; <100 = HF unlikely. Best test to rule OUT HF in dyspneic patient", highYield: true, step: "both" },
              { text: "CXR: cardiomegaly, cephalization, Kerley B lines, perihilar haziness, pleural effusions", highYield: true },
              { text: "Echo: gold standard — measures EF, wall motion, valvular disease. EF <40% = HFrEF", highYield: true },
              { text: "EKG: look for LVH, prior MI, arrhythmia (AFib common trigger)" },
              { text: "Labs: BMP (electrolytes, creatinine), CBC (anemia as trigger), TSH, troponin (rule out ACS)" },
            ]
          },
          {
            id: "hf_tx", heading: "Management", type: "management", icon: "💊",
            bullets: [
              { text: "HFrEF mortality-reducing drugs: ACEi/ARB, beta-blocker (carvedilol, metoprolol), spironolactone, SGLT2 inhibitor (dapagliflozin)", highYield: true, step: "both" },
              { text: "Diuretics: furosemide for symptom relief (edema, congestion) — do NOT reduce mortality alone", highYield: true },
              { text: "HFpEF: treat underlying cause (HTN, AFib, CAD). Diuretics for congestion. No mortality benefit proven for specific HFpEF drug", step: "step2" },
              { text: "Acute decompensation: IV furosemide (2.5× PO dose), O2, rate control if AFib, nitrates if hypertensive", step: "step2" },
              { text: "Device therapy: ICD if EF ≤35% despite ≥3 months optimal medical therapy", step: "step2" },
            ]
          },
          {
            id: "hf_pearls", heading: "Board Pearls", type: "pearls", icon: "💡",
            bullets: [
              { text: "Beta-blockers IMPROVE EF over time despite being negative inotropes acutely — reverse remodeling", highYield: true },
              { text: "Do NOT add beta-blocker during acute decompensation. Start only when euvolemic and stable", highYield: true },
              { text: "SGLT2 inhibitors reduce HF hospitalizations and CV death in both HFrEF and HFpEF" },
              { text: "Hydralazine + nitrate = alternative to ACEi/ARB in Black patients or with renal failure" },
              { text: "Cardiorenal syndrome: aggressive diuresis worsens creatinine. Treat the HF; accept transient creatinine rise" },
            ]
          },
        ]
      },
      {
        id: "stemi",
        name: "Myocardial Infarction (STEMI/NSTEMI)",
        system: "Cardiology",
        difficulty: 3,
        board_relevance: "both",
        tags: ["ACS", "troponin", "PCI", "tPA", "STEMI", "NSTEMI"],
        lifeline_summary: "ACS spectrum: unstable angina → NSTEMI → STEMI. Troponin rises 3–6h after infarction, peaks 12–24h. STEMI: primary PCI within 90 min (door-to-balloon). NSTEMI: anticoagulation + antiplatelet, cath within 24–48h. Inferior STEMI (II,III,aVF) = RCA. Anterior (V1-V4) = LAD. Lateral (I,aVL,V5-V6) = LCx. RV MI: hypotension + clear lungs — avoid nitrates, give fluids.",
        sections: [
          {
            id: "mi_patho", heading: "Pathophysiology", type: "pathophysiology", icon: "🔬",
            bullets: [
              { text: "Plaque rupture → platelet aggregation → thrombus formation → coronary occlusion", highYield: true },
              { text: "STEMI = complete occlusion → transmural ischemia → ST elevation → Q waves if untreated" },
              { text: "NSTEMI = partial occlusion → subendocardial ischemia → troponin rise WITHOUT persistent ST elevation" },
              { text: "Demand ischemia (Type 2 MI): tachyarrhythmia, hypotension, anemia — no plaque rupture" },
            ]
          },
          {
            id: "mi_dx", heading: "Diagnostics & Localization", type: "diagnostics", icon: "🧪",
            bullets: [
              { text: "Troponin I or T: rises 3-6h, peaks 12-24h, normalizes 7-10 days (troponin T). Serial levels at 0h and 3h", highYield: true, step: "both" },
              { text: "Inferior STEMI (II, III, aVF) → RCA territory. ALWAYS get right-sided leads (V3R, V4R) to rule out RV MI", highYield: true },
              { text: "Anterior STEMI (V1-V4) → LAD. Highest mortality — supplies most of LV anterior wall" },
              { text: "New LBBB + symptoms = treat as STEMI (Sgarbossa criteria)" },
              { text: "Wellens syndrome: T-wave changes in V2-V3 = critical LAD stenosis before STEMI" },
            ]
          },
          {
            id: "mi_tx", heading: "Management", type: "management", icon: "💊",
            bullets: [
              { text: "STEMI: Primary PCI within 90 min (door-to-balloon). If PCI unavailable within 120 min → thrombolytics (tPA) within 30 min (door-to-needle)", highYield: true, step: "step2" },
              { text: "Dual antiplatelet: Aspirin 325mg immediately + P2Y12 inhibitor (ticagrelor preferred over clopidogrel)", highYield: true },
              { text: "Anticoagulation: heparin UFH or bivalirudin during PCI" },
              { text: "Post-MI: DAPT for 12 months, ACEi (reduces remodeling), high-intensity statin, beta-blocker", step: "step2" },
              { text: "RV MI: AVOID nitrates (preload-dependent). Give IV fluids. Rate control if AFib" },
              { text: "Cardiogenic shock: emergent PCI, IABP or Impella for hemodynamic support" },
            ]
          },
          {
            id: "mi_complications", heading: "Complications", type: "traps", icon: "⚠️",
            bullets: [
              { text: "Day 1-3: arrhythmias (VF/VT), cardiogenic shock, acute MR (papillary muscle rupture)", highYield: true },
              { text: "Day 3-5: free wall rupture → tamponade (Beck's triad). VSD rupture → loud holosystolic murmur", highYield: true },
              { text: "Weeks: Dressler syndrome (pericarditis), LV aneurysm (persistent ST elevation, mural thrombus)" },
              { text: "Papillary muscle rupture: acute MR, holosystolic murmur, pulmonary edema — surgical emergency" },
            ]
          }
        ]
      },
      {
        id: "afib",
        name: "Atrial Fibrillation",
        system: "Cardiology",
        difficulty: 2,
        board_relevance: "both",
        tags: ["CHA2DS2-VASc", "DOAC", "rate control", "rhythm control", "cardioversion"],
        lifeline_summary: "AFib: irregularly irregular rhythm, absent P waves. Most common sustained arrhythmia. Risk: embolic stroke (5× normal). CHA2DS2-VASc score guides anticoagulation: ≥2 in men (≥3 in women) → DOAC. Rate control first (goal HR <110 at rest). Rhythm control if symptoms persist. Cardioversion requires anticoagulation for ≥3 weeks if AFib >48h (or TEE to exclude LAA thrombus).",
        sections: [
          {
            id: "afib_dx", heading: "Diagnosis & Classification", type: "diagnostics", icon: "🧪",
            bullets: [
              { text: "EKG: absent P waves, irregularly irregular QRS, fibrillatory baseline (coarse/fine)", highYield: true },
              { text: "Paroxysmal (<7 days, self-terminating), Persistent (>7 days), Long-standing persistent (>1 year), Permanent (accepted, no rhythm control)" },
              { text: "Rapid ventricular response (RVR): HR >100 — causes hemodynamic compromise, tachycardia-induced cardiomyopathy" },
            ]
          },
          {
            id: "afib_stroke", heading: "Stroke Risk & Anticoagulation", type: "management", icon: "💊",
            bullets: [
              { text: "CHA2DS2-VASc: CHF(1) + HTN(1) + Age≥75(2) + DM(1) + Stroke/TIA(2) + Vascular disease(1) + Age 65-74(1) + Sex female(1)", highYield: true, step: "both" },
              { text: "Score ≥2 (men) or ≥3 (women): anticoagulate. DOACs preferred over warfarin for non-valvular AFib", highYield: true },
              { text: "DOACs: apixaban (most favorable safety), rivaroxaban (once daily), dabigatran, edoxaban" },
              { text: "Valvular AFib (rheumatic mitral stenosis, mechanical valve) → warfarin only (DOACs contraindicated)" },
            ]
          },
          {
            id: "afib_rate", heading: "Rate & Rhythm Control", type: "management", icon: "💊",
            bullets: [
              { text: "Rate control: beta-blockers (metoprolol) or CCBs (diltiazem, verapamil). Digoxin for HFrEF", highYield: true },
              { text: "Rhythm control: electrical cardioversion. Antiarrhythmics: amiodarone (most effective, most toxic), flecainide, propafenone (no structural heart disease)" },
              { text: "Cardioversion: if AFib >48h or unknown duration → anticoagulate ≥3 weeks OR TEE to exclude LAA thrombus before cardioversion" },
              { text: "Ablation: catheter-based PVI — for paroxysmal AFib refractory to drugs" },
            ]
          }
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "renal",
    name: "Renal",
    icon: "🫘",
    color: "#60a5fa",
    topics: [
      {
        id: "aki",
        name: "Acute Kidney Injury (AKI)",
        system: "Renal",
        difficulty: 3,
        board_relevance: "both",
        tags: ["FENa", "pre-renal", "ATN", "contrast nephropathy", "creatinine"],
        lifeline_summary: "AKI: abrupt ↑ creatinine ≥0.3 mg/dL in 48h or ≥50% rise in 7 days. Pre-renal (most common): FENa <1%, responds to fluids. Intrinsic (ATN most common): FENa >2%, muddy brown casts, tubular injury. Post-renal: hydronephrosis on ultrasound. ATN causes: ischemia, contrast, aminoglycosides, myoglobin. Contrast nephropathy: creatinine rises 48-72h post-contrast; prevent with IV saline pre/post procedure.",
        sections: [
          {
            id: "aki_class", heading: "Classification", type: "concept", icon: "📋",
            bullets: [
              { text: "Pre-renal: ↓ effective circulating volume → ↑ BUN:Cr ratio (>20:1), FENa <1%, responds to fluids", highYield: true },
              { text: "Intrinsic renal: ATN (most common), glomerulonephritis, interstitial nephritis, vascular", highYield: true },
              { text: "Post-renal: obstruction at any level (BPH, stones, tumor). Bilateral or unilateral with solitary kidney" },
              { text: "FENa = (urine Na × plasma Cr) / (plasma Na × urine Cr) × 100. FENa <1% = pre-renal (or contrast, myoglobin)", highYield: true },
            ]
          },
          {
            id: "aki_causes", heading: "ATN — Causes & Pathology", type: "pathophysiology", icon: "🔬",
            bullets: [
              { text: "Ischemic ATN: hypotension, sepsis, surgery → tubular cell death in S3 segment (PCT) and thick ascending limb", highYield: true },
              { text: "Nephrotoxic ATN: contrast (avoid in CKD, DM, volume depletion), aminoglycosides (proximal tubule), myoglobin (rhabdomyolysis), cisplatin", highYield: true },
              { text: "UA findings in ATN: granular (muddy brown) casts, renal tubular epithelial cells", highYield: true },
              { text: "AIN (acute interstitial nephritis): drugs (NSAIDs, beta-lactams, PPIs, sulfa), eosinophilia, rash, fever, WBC casts" },
            ]
          },
          {
            id: "aki_tx", heading: "Management", type: "management", icon: "💊",
            bullets: [
              { text: "Pre-renal: IV fluids (isotonic saline). Avoid nephrotoxins. Treat underlying cause", highYield: true },
              { text: "Contrast nephropathy prevention: IV isotonic saline 1 mL/kg/h for 3-12h before and after. Hold metformin 48h post-contrast", step: "step2" },
              { text: "Rhabdomyolysis: aggressive IV fluids (target UO 200-300 mL/h), alkalinize urine (sodium bicarbonate)", step: "step2" },
              { text: "Indications for emergent dialysis: AEIOU — Acidosis, Electrolyte (K+ >6.5), Ingestion (toxin), Overload (fluid refractory), Uremia (symptoms)", highYield: true },
            ]
          }
        ]
      },
      {
        id: "nephrotic",
        name: "Nephrotic Syndrome",
        system: "Renal",
        difficulty: 2,
        board_relevance: "step1",
        tags: ["proteinuria", "hypoalbuminemia", "MCD", "FSGS", "membranous", "edema"],
        lifeline_summary: "Nephrotic syndrome: massive proteinuria (>3.5 g/day) + hypoalbuminemia + pitting edema + hyperlipidemia + lipiduria. Mechanism: protein loss → ↓ oncotic pressure → edema; liver compensates with ↑ VLDL → hyperlipidemia. Most common causes: children = Minimal Change Disease; adults = Membranous nephropathy (primary). Complications: hypercoagulability (loss of AT-III, Protein C/S → DVT, renal vein thrombosis). MCD responds to steroids (85%).",
        sections: [
          {
            id: "neph_causes", heading: "Causes by Age", type: "concept", icon: "📋",
            bullets: [
              { text: "Children (<8 yr): Minimal Change Disease (80-90%). Assume MCD; biopsy not initially needed", highYield: true },
              { text: "Adults: Membranous nephropathy (most common primary). Anti-PLA2R antibody positive (75%).", highYield: true },
              { text: "FSGS: most common secondary nephrotic in US. Associated with HIV, heroin, sickle cell, obesity", step: "step1" },
              { text: "Diabetic nephropathy: most common cause of nephrotic syndrome overall (primary + secondary combined)", highYield: true },
              { text: "MCD histology: normal LM; foot process effacement on EM (pathognomonic). T-cell mediated podocyte injury" },
              { text: "Membranous: 'spike and dome' on EM (sub-epithelial deposits). Secondary: hepatitis B, SLE, malignancy, NSAIDs", highYield: true },
            ]
          },
          {
            id: "neph_coag", heading: "Hypercoagulability Mechanism", type: "pathophysiology", icon: "🔬",
            bullets: [
              { text: "Loss in urine: Antithrombin III, Protein C, Protein S → thrombophilic state", highYield: true },
              { text: "Renal vein thrombosis: most associated with membranous nephropathy (not MCD)", highYield: true },
              { text: "Presentation of renal vein thrombosis: flank pain, hematuria, sudden worsening proteinuria, Doppler US confirms" },
              { text: "DVT/PE risk: anticoagulate if albumin <2.0 or known thrombus" },
            ]
          },
          {
            id: "neph_vs_nephritic", heading: "Nephrotic vs. Nephritic", type: "comparison", icon: "↔",
            bullets: [
              { text: "NEPHROTIC: massive proteinuria, hypoalbuminemia, edema, hyperlipidemia, lipiduria, NO hematuria, NORMAL BP", highYield: true },
              { text: "NEPHRITIC: hematuria, RBC casts, hypertension, oliguria, mild proteinuria, ↓ GFR, NORMAL albumin", highYield: true },
              { text: "Key clue: 'frothy urine' + periorbital edema = nephrotic; 'cola-colored urine' + HTN = nephritic" },
              { text: "Complement: ↓ C3 in post-strep GN, MPGN, SLE (nephritic). Normal in MCD, membranous (nephrotic)" },
            ]
          }
        ]
      },
      {
        id: "acid_base",
        name: "Acid-Base Disorders",
        system: "Renal",
        difficulty: 3,
        board_relevance: "step1",
        tags: ["pH", "pCO2", "bicarbonate", "anion gap", "compensation", "metabolic acidosis"],
        lifeline_summary: "Step 1: pH acidosis or alkalosis? Step 2: Primary disorder = CO2 (respiratory) or HCO3 (metabolic)? Step 3: Is compensation adequate? Step 4: If metabolic acidosis → calculate anion gap (Na - Cl - HCO3; normal 8-12). If AG elevated → calculate delta-delta to detect mixed disorder. Key formulas: respiratory compensation for metabolic acidosis = 1.5×HCO3 + 8 ± 2 (Winter's formula). Metabolic compensation for respiratory acidosis: acute = HCO3 rises 1 per 10 CO2; chronic = 3.5 per 10.",
        sections: [
          {
            id: "ab_approach", heading: "Systematic Approach", type: "concept", icon: "📋",
            bullets: [
              { text: "Step 1: pH — <7.35 = acidosis, >7.45 = alkalosis", highYield: true },
              { text: "Step 2: Primary driver — ↑CO2 = respiratory acidosis; ↓CO2 = respiratory alkalosis; ↓HCO3 = metabolic acidosis; ↑HCO3 = metabolic alkalosis", highYield: true },
              { text: "Step 3: Check compensation — respiratory disorders: metabolic compensation takes 3-5 days (chronic vs. acute distinction)", highYield: true },
              { text: "Step 4: Anion gap = Na - (Cl + HCO3). Normal: 8-12 mEq/L. AG >12 = MUDPILES mnemonic" },
            ]
          },
          {
            id: "ab_metabolic", heading: "Metabolic Acidosis", type: "concept", icon: "📋",
            bullets: [
              { text: "MUDPILES (high AG): Methanol, Uremia, DKA/alcoholic KA, Propylene glycol/Paraldehyde, Isoniazid/Iron, Lactic acidosis, Ethylene glycol, Salicylates", highYield: true },
              { text: "Normal AG metabolic acidosis (hyperchloremic): HARDUP — Hyperalimentation, Addison's, RTA, Diarrhea, Ureteral diversion, Pancreatic fistula", highYield: true },
              { text: "Winter's formula (expected PCO2 for metabolic acidosis): PCO2 = 1.5×HCO3 + 8 ± 2. If measured PCO2 > expected → concurrent respiratory acidosis", highYield: true },
              { text: "Delta-delta: if AG metabolic acidosis → check for concurrent metabolic alkalosis (delta-delta >2) or normal AG acidosis (delta-delta <1)" },
            ]
          },
          {
            id: "ab_resp", heading: "Respiratory Disorders & Compensation", type: "concept", icon: "📋",
            bullets: [
              { text: "Respiratory acidosis: ↓ ventilation (COPD, opioids, NMJ disease). Acute: HCO3 ↑ 1 per 10 CO2. Chronic: HCO3 ↑ 3.5 per 10 CO2", highYield: true },
              { text: "Respiratory alkalosis: ↑ ventilation (anxiety, pain, high altitude, salicylates, pregnancy, PE). Acute: HCO3 ↓ 2 per 10 CO2. Chronic: ↓ 5 per 10", highYield: true },
              { text: "Metabolic alkalosis: vomiting (Cl- loss), diuretics, hyperaldosteronism. Urine Cl- <25 = Cl-responsive (vomiting/diuretics); Urine Cl- >40 = Cl-unresponsive (Conn)" },
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pulmonology",
    name: "Pulmonology",
    icon: "🫁",
    color: "#38bdf8",
    topics: [
      {
        id: "copd",
        name: "COPD",
        system: "Pulmonology",
        difficulty: 2,
        board_relevance: "both",
        tags: ["FEV1", "FVC", "emphysema", "chronic bronchitis", "GOLD", "O2 therapy"],
        lifeline_summary: "COPD: obstructive pattern on PFTs (FEV1/FVC <0.70). Two types: emphysema (destroyed alveoli, ↓ DLCO, pink puffer) and chronic bronchitis (productive cough >3 months/year × 2 years, blue bloater). Smoking cessation is the only intervention that slows FEV1 decline. O2 therapy if PaO2 ≤55 or SpO2 ≤88% — only therapy proven to reduce mortality. AECOPD triggers: infection (most common), PE, non-compliance. Target SpO2 88-92% to avoid CO2 retention.",
        sections: [
          {
            id: "copd_types", heading: "Emphysema vs. Chronic Bronchitis", type: "comparison", icon: "↔",
            bullets: [
              { text: "Emphysema: destruction of alveolar walls → ↓ surface area → ↑ dead space. Pink puffer: thin, pursed-lip breathing, barrel chest, ↓ breath sounds", highYield: true },
              { text: "Chronic bronchitis: mucus gland hyperplasia → ↑ mucus → productive cough ≥3 months/year × ≥2 consecutive years. Blue bloater: obese, cyanotic, cor pulmonale" },
              { text: "PFTs: both show ↓ FEV1/FVC (<0.70). Emphysema: ↑ TLC, ↑ RV, ↓ DLCO (loss of alveoli). Chronic bronchitis: DLCO preserved" },
            ]
          },
          {
            id: "copd_tx", heading: "Management", type: "management", icon: "💊",
            bullets: [
              { text: "Smoking cessation: ONLY therapy that slows disease progression and FEV1 decline", highYield: true },
              { text: "Mild (GOLD 1-2): SABA (albuterol) PRN; add LAMA (tiotropium) for persistent symptoms", highYield: true },
              { text: "Moderate-severe: LAMA + LABA (dual bronchodilation). Add ICS if ≥2 exacerbations/year or eos ≥300", step: "step2" },
              { text: "Home O2: PaO2 ≤55 mmHg OR SpO2 ≤88% at rest (or with exertion/sleep). ≥15 hours/day. ONLY therapy reducing mortality (other than smoking cessation)", highYield: true },
              { text: "AECOPD: bronchodilators + systemic steroids (5-day course) + antibiotics if bacterial trigger (↑ sputum, ↑ purulence, ↑ dyspnea = Anthonisen criteria)" },
            ]
          },
          {
            id: "copd_pearls", heading: "Board Pearls", type: "pearls", icon: "💡",
            bullets: [
              { text: "Target SpO2 88-92% in COPD — excess O2 causes CO2 retention (Haldane effect + loss of hypoxic drive)", highYield: true },
              { text: "Alpha-1 antitrypsin deficiency: panacinar emphysema in young nonsmoker; also causes liver disease (cirrhosis)", highYield: true },
              { text: "Roflumilast (PDE-4 inhibitor): reduces exacerbations in severe COPD. Side effect: diarrhea, weight loss" },
              { text: "Pursed-lip breathing: prolongs expiration → auto-PEEP → keeps airways open → reduces air trapping" },
            ]
          }
        ]
      },
      {
        id: "pneumonia",
        name: "Pneumonia",
        system: "Pulmonology",
        difficulty: 2,
        board_relevance: "step2",
        tags: ["CAP", "HAP", "atypical", "empiric antibiotics", "CURB-65"],
        lifeline_summary: "CAP (community-acquired): most common cause = S. pneumoniae (lobar consolidation, rusty sputum). Atypical: Mycoplasma (walking pneumonia, IgM cold agglutinins), Chlamydia, Legionella (water, GI symptoms, hyponatremia). CURB-65 guides admission: Confusion, Urea>7, RR≥30, BP<90/60, Age≥65. Empiric CAP: beta-lactam + macrolide OR respiratory fluoroquinolone. HAP (≥48h admitted): cover MRSA and Pseudomonas.",
        sections: [
          {
            id: "pna_organisms", heading: "Pathogens & Clues", type: "concept", icon: "📋",
            bullets: [
              { text: "S. pneumoniae: most common CAP. Lobar consolidation, rusty sputum, herpes labialis, responds to penicillin", highYield: true },
              { text: "Atypical pneumonia: Mycoplasma (young adults, 'walking pneumonia', cold agglutinins, rash, bullous myringitis)", highYield: true },
              { text: "Legionella: water systems, AC units. GI prodrome, hyponatremia, ↑ LFTs, Pontiac fever (mild form). Urine antigen test = best rapid diagnosis", highYield: true },
              { text: "Aspiration: right lower lobe (sitting) or right upper/posterior segment (supine). Treat anaerobes → amoxicillin-clavulanate or clindamycin" },
              { text: "Pneumocystis jirovecii (PCP): CD4 <200, bilateral interstitial infiltrates, ↑ LDH, BAL diagnosis. Treat: TMP-SMX + steroids if PaO2 <70" },
              { text: "Klebsiella: alcoholics, currant-jelly sputum, upper lobes. Pseudomonas: structural lung disease, ICU, CF" },
            ]
          },
          {
            id: "pna_tx", heading: "Treatment", type: "management", icon: "💊",
            bullets: [
              { text: "CAP outpatient (healthy, no comorbidities): amoxicillin OR doxycycline OR azithromycin", step: "step2" },
              { text: "CAP inpatient (non-ICU): beta-lactam + macrolide OR respiratory fluoroquinolone (levofloxacin, moxifloxacin)", highYield: true, step: "step2" },
              { text: "CAP ICU: beta-lactam + azithromycin (or FQ). Add MRSA coverage (vancomycin) if risk factors", step: "step2" },
              { text: "CURB-65: 0-1 = outpatient; 2 = consider admission; ≥3 = admit (ICU if ≥4)", highYield: true },
              { text: "HAP (≥48h) or VAP: anti-Pseudomonal coverage (piperacillin-tazobactam, cefepime) ± MRSA coverage (vancomycin, linezolid)" },
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neurology",
    name: "Neurology",
    icon: "🧠",
    color: "#a78bfa",
    topics: [
      {
        id: "stroke",
        name: "Stroke & TIA",
        system: "Neurology",
        difficulty: 3,
        board_relevance: "both",
        tags: ["tPA", "tNIHSS", "ischemic", "hemorrhagic", "TIA", "ABCD2"],
        lifeline_summary: "Ischemic stroke (85%): sudden focal neurological deficit. IV tPA if: ischemic, symptom onset ≤4.5h, no contraindications, BP <185/110. Door-to-needle ≤60 min. NEVER give tPA for hemorrhagic stroke — CT head first always. TIA = transient (<24h, usually <1h) neurological symptoms with no infarct on imaging. ABCD2 score predicts 2-day stroke risk. High-risk TIA (ABCD2 ≥4 or DWI lesion): hospitalize urgently.",
        sections: [
          {
            id: "stroke_syndromes", heading: "Vascular Syndromes", type: "concept", icon: "📋",
            bullets: [
              { text: "MCA (most common): contralateral face/arm > leg weakness, hemineglect (R hemisphere), aphasia (L dominant hemisphere), gaze deviation toward lesion", highYield: true },
              { text: "ACA: contralateral leg > arm weakness, urinary incontinence, abulia, grasp reflex", highYield: true },
              { text: "PCA: contralateral homonymous hemianopia WITH macular sparing (most distinctive finding)", highYield: true },
              { text: "Wallenberg (PICA): ipsilateral face, contralateral body numbness; dysphagia, hoarseness, Horner's, vertigo, ataxia. 'Don't-cross syndrome'", highYield: true },
              { text: "Lacunar infarcts: pure motor (posterior limb internal capsule), pure sensory (thalamus), ataxic hemiparesis" },
            ]
          },
          {
            id: "stroke_tpa", heading: "tPA Eligibility", type: "management", icon: "💊",
            bullets: [
              { text: "Inclusion: ischemic stroke, onset ≤4.5h (≤3h is safest), measurable deficit, CT negative for hemorrhage", highYield: true },
              { text: "Key exclusions: BP >185/110 (must treat first), prior ICH, INR >1.7, platelets <100K, glucose <50 or >400, recent major surgery <14 days", highYield: true },
              { text: "BP management: lower to <185/110 BEFORE tPA; maintain <180/105 DURING and for 24h after", step: "step2" },
              { text: "Mechanical thrombectomy: large vessel occlusion (MCA, ICA, basilar) + NIHSS ≥6 + within 24h of onset (up to 24h with mismatch imaging)", step: "step2" },
              { text: "DO NOT delay tPA for MRI. CT is sufficient to exclude hemorrhage. Door-to-needle ≤60 minutes." },
            ]
          },
          {
            id: "stroke_secondary", heading: "Secondary Prevention", type: "management", icon: "💊",
            bullets: [
              { text: "Cardioembolic (AFib, LV thrombus): anticoagulate (DOAC, warfarin). Start 4-14 days after large infarct", highYield: true },
              { text: "Non-cardioembolic: DAPT (aspirin + clopidogrel × 21 days for minor stroke/TIA), then aspirin alone", step: "step2" },
              { text: "Carotid stenosis: CEA if symptomatic stenosis 70-99% (benefit >50% with experienced surgeon). Stenting alternative", step: "step2" },
              { text: "Risk factor control: BP <130/80, LDL <70, statin (high-intensity), stop smoking, exercise, control DM" },
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "endocrine",
    name: "Endocrine",
    icon: "⚗️",
    color: "#fbbf24",
    topics: [
      {
        id: "dka",
        name: "Diabetic Ketoacidosis (DKA)",
        system: "Endocrine",
        difficulty: 3,
        board_relevance: "both",
        tags: ["ketones", "anion gap", "insulin", "potassium", "type 1 DM"],
        lifeline_summary: "DKA: hyperglycemia (>250) + anion gap metabolic acidosis (pH <7.3, HCO3 <18) + ketonemia/ketonuria. Cause: insulin deficiency → fat breakdown → ketones → acidosis. Occurs in Type 1 DM (rarely Type 2). Key potassium paradox: initial serum K+ elevated (acidosis drives K+ extracellularly) but total body depleted. Insulin drives K+ into cells → hypokalemia. Replace K+ BEFORE insulin if K+ <3.5. Treat with insulin infusion + aggressive IV fluids + K+ supplementation.",
        sections: [
          {
            id: "dka_patho", heading: "Pathophysiology", type: "pathophysiology", icon: "🔬",
            bullets: [
              { text: "Insulin deficiency → lipolysis → free fatty acids → liver converts to ketone bodies (acetoacetate, β-hydroxybutyrate)", highYield: true },
              { text: "Anion gap metabolic acidosis from accumulation of ketoacids. Kussmaul respirations = compensatory hyperventilation", highYield: true },
              { text: "Osmotic diuresis from hyperglycemia → total body fluid, K+, Na+, Mg2+, phosphate depletion", highYield: true },
              { text: "K+ paradox: acidosis → H+/K+ exchange → extracellular shift → high serum K+ DESPITE total body depletion. Insulin correction → K+ drops precipitously" },
            ]
          },
          {
            id: "dka_tx", heading: "Management", type: "management", icon: "💊",
            bullets: [
              { text: "IV fluids: 1-2L isotonic saline rapidly (treat shock/dehydration). Switch to 0.45% NaCl + dextrose when glucose <250", highYield: true },
              { text: "Potassium: CRITICAL. If K+ <3.5 → hold insulin, replace K+ first. If K+ 3.5-5.0 → give insulin + add K+ to fluids. If K+ >5.0 → give insulin, hold K+ supplementation", highYield: true },
              { text: "Insulin: regular insulin infusion 0.1 units/kg/h. Do NOT give until K+ ≥3.5", highYield: true },
              { text: "Resolution criteria: glucose <200, pH >7.3, HCO3 >18, anion gap closed", step: "step2" },
              { text: "Cerebral edema: rare but feared complication, especially in children with overly rapid fluid resuscitation" },
            ]
          }
        ]
      },
      {
        id: "thyroid",
        name: "Thyroid Disorders",
        system: "Endocrine",
        difficulty: 2,
        board_relevance: "both",
        tags: ["TSH", "T3", "T4", "Graves", "Hashimoto", "thyroid storm"],
        lifeline_summary: "TSH is the best initial test for thyroid disorders. High TSH = primary hypothyroidism → levothyroxine. Low TSH = hyperthyroidism → further workup (free T4, radioiodine uptake). Graves disease: autoimmune (TSI antibodies), diffuse goiter, ophthalmopathy, pretibial myxedema. Treat: methimazole (preferred, avoid in 1st trimester), PTU, radioiodine, or thyroidectomy. Hashimoto: most common hypothyroidism; anti-TPO antibodies; lymphocytic infiltration; treat with levothyroxine. Thyroid storm: ICU emergency — beta-blocker + PTU + KI + steroids.",
        sections: [
          {
            id: "thyroid_hypo", heading: "Hypothyroidism", type: "concept", icon: "📋",
            bullets: [
              { text: "Primary (most common): ↑ TSH + ↓ free T4. Causes: Hashimoto's, post-radioiodine, post-thyroidectomy", highYield: true },
              { text: "Secondary: ↓ TSH + ↓ free T4 (pituitary failure). Tertiary: ↓ TRH (hypothalamic)" },
              { text: "Hashimoto's: anti-TPO and anti-thyroglobulin antibodies, lymphocytic infiltration, may have transient hyperthyroidism (hashitoxicosis)", step: "step1" },
              { text: "Symptoms: fatigue, weight gain, cold intolerance, constipation, dry skin, bradycardia, hyponatremia, hyperlipidemia, macrocytic anemia" },
              { text: "Treatment: levothyroxine (T4). Monitor TSH every 6-8 weeks until stable. Avoid T3 (liothyronine) unless myxedema coma", highYield: true },
            ]
          },
          {
            id: "thyroid_hyper", heading: "Hyperthyroidism", type: "concept", icon: "📋",
            bullets: [
              { text: "Graves disease: TSI (thyroid-stimulating immunoglobulin) antibody stimulates TSH receptor. Diffuse goiter, ophthalmopathy (exophthalmos), pretibial myxedema", highYield: true },
              { text: "Toxic multinodular goiter (Plummer): older patients, multiple autonomously functioning nodules, ↑ uptake in nodules on scan" },
              { text: "Subacute thyroiditis (de Quervain): painful goiter post-viral, transient hyperthyroidism → hypothyroidism → recovery. Low radioiodine uptake" },
              { text: "Treatment: methimazole (1st-line, except 1st trimester → PTU). Radioiodine (definitive). Thyroidectomy. Beta-blocker for symptoms", highYield: true },
            ]
          },
          {
            id: "thyroid_storm", heading: "Thyroid Storm", type: "management", icon: "💊",
            bullets: [
              { text: "Precipitant: surgery, infection, MI, stress. Life-threatening: HR >150, hyperthermia, altered mental status, cardiovascular collapse", highYield: true },
              { text: "Treatment order (mnemonic BBKPS): Beta-blocker (propranolol first) → PTU (blocks synthesis + conversion) → KI/Lugol's (blocks release, give AFTER PTU) → Potassium iodide → Steroids (hydrocortisone, blocks T4→T3 conversion)", highYield: true },
              { text: "NEVER give KI before PTU — iodine provides substrate for more hormone synthesis if synthesis not first blocked" },
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "gi",
    name: "Gastroenterology",
    icon: "🏥",
    color: "#fb923c",
    topics: [
      {
        id: "cirrhosis",
        name: "Cirrhosis & Complications",
        system: "Gastroenterology",
        difficulty: 3,
        board_relevance: "both",
        tags: ["portal hypertension", "ascites", "SBP", "HE", "varices", "hepatorenal"],
        lifeline_summary: "Cirrhosis = irreversible hepatic fibrosis. Portal HTN (>10 mmHg) → varices, splenomegaly, ascites, caput medusae. Complications: SBP (PMN >250/mm³ in ascitic fluid → cefotaxime), hepatic encephalopathy (lactulose + rifaximin), hepatorenal syndrome (terlipressin + albumin), varices (octreotide + ceftriaxone + endoscopy). Screen for HCC every 6 months (AFP + US). TIPS for refractory ascites or variceal bleeding. Child-Pugh and MELD scores for prognosis.",
        sections: [
          {
            id: "cirr_comp", heading: "Complications", type: "concept", icon: "📋",
            bullets: [
              { text: "Portal hypertension → esophageal varices (risk of catastrophic hemorrhage), splenomegaly (thrombocytopenia), ascites, caput medusae, hemorrhoids", highYield: true },
              { text: "Spontaneous bacterial peritonitis (SBP): fever, abdominal pain, altered mental status in cirrhotic. Diagnostic: PMN >250/mm³ in ascitic fluid", highYield: true },
              { text: "SBP organism: usually E. coli or Klebsiella (gram-negative enteric). Treat: cefotaxime IV. Prophylaxis: norfloxacin/ciprofloxacin if prior SBP or protein <1.5", highYield: true },
              { text: "Hepatic encephalopathy: ammonia accumulation → asterixis, confusion, coma. Precipitants: GI bleed, infection, constipation, sedatives, renal failure" },
              { text: "HE treatment: lactulose (acidifies gut, traps NH4+), rifaximin (reduces ammonia-producing bacteria), protein restriction (mild, don't over-restrict)" },
              { text: "Hepatorenal syndrome: functional renal failure in cirrhosis. Terlipressin + albumin (vasoconstrict splanchnic → ↑ renal perfusion). Liver transplant definitive" },
            ]
          },
          {
            id: "cirr_varices", heading: "Variceal Bleeding", type: "management", icon: "💊",
            bullets: [
              { text: "Acute variceal bleed: Octreotide IV immediately (↓ splanchnic flow), then EGD within 12h. Ceftriaxone prophylaxis (reduces infection and mortality)", highYield: true },
              { text: "Primary prophylaxis: non-selective beta-blocker (propranolol, nadolol) OR EVL (endoscopic variceal ligation)", step: "step2" },
              { text: "Secondary prophylaxis: beta-blocker + EVL. TIPS if fails" },
              { text: "TIPS (transjugular intrahepatic portosystemic shunt): refractory ascites or bleeding. Risk: worsens hepatic encephalopathy" },
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "hematology",
    name: "Hematology",
    icon: "🩸",
    color: "#f472b6",
    topics: [
      {
        id: "anemia",
        name: "Anemia",
        system: "Hematology",
        difficulty: 2,
        board_relevance: "step1",
        tags: ["MCV", "iron deficiency", "B12", "anemia of chronic disease", "hemolysis"],
        lifeline_summary: "Classify by MCV: microcytic (MCV <80) = IDA, ACD, thalassemia, sideroblastic; normocytic (80-100) = ACD, hemolysis, aplastic, hemorrhage; macrocytic (>100) = B12/folate deficiency, liver disease, hypothyroidism, drugs (hydroxyurea, methotrexate). Iron deficiency: low ferritin (most sensitive), low serum iron, HIGH TIBC. ACD: high/normal ferritin, low TIBC. B12 deficiency: hypersegmented neutrophils, subacute combined degeneration (posterior and lateral columns).",
        sections: [
          {
            id: "anemia_microcytic", heading: "Microcytic Anemia (MCV <80)", type: "concept", icon: "📋",
            bullets: [
              { text: "Iron deficiency: low ferritin (best marker of stores), low serum iron, HIGH TIBC, high RDW. Most common anemia worldwide", highYield: true },
              { text: "ACD (anemia of chronic disease): HIGH/normal ferritin (acute phase reactant), LOW serum iron, LOW TIBC. Fe gets trapped in macrophages", highYield: true },
              { text: "Thalassemia: low RDW (uniform small cells, unlike IDA), target cells, normal/high ferritin, elevated Hgb A2 or F on electrophoresis" },
              { text: "Sideroblastic: ring sideroblasts on Prussian blue stain. Causes: alcohol, lead, pyridoxine deficiency, isoniazid, myelodysplastic syndrome" },
            ]
          },
          {
            id: "anemia_macro", heading: "Macrocytic Anemia (MCV >100)", type: "concept", icon: "📋",
            bullets: [
              { text: "B12 deficiency: hypersegmented neutrophils (>5 lobes), subacute combined degeneration (dorsal/lateral columns — position + vibration sense, UMN signs), high methylmalonic acid + homocysteine", highYield: true },
              { text: "Folate deficiency: identical CBC to B12. NO neurological symptoms. Only ↑ homocysteine (NOT methylmalonic acid). Occurs faster (3 months vs. years for B12)", highYield: true },
              { text: "Megaloblastic anemia: defective DNA synthesis → large RBCs, hypersegmented neutrophils, pancytopenia in severe cases" },
              { text: "Non-megaloblastic macrocytosis: liver disease (↑ lipid in membrane), hypothyroidism, reticulocytosis (big cells), drugs" },
            ]
          },
          {
            id: "anemia_hemolytic", heading: "Hemolytic Anemia", type: "concept", icon: "📋",
            bullets: [
              { text: "Labs: ↑ LDH, ↑ indirect bilirubin, ↓ haptoglobin, reticulocytosis, hemoglobinuria (intravascular only)", highYield: true },
              { text: "Intravascular hemolysis: transfusion reaction, PNH, G6PD crisis, mechanical hemolysis. Free Hgb → ↓ haptoglobin, hemoglobinuria" },
              { text: "G6PD deficiency: X-linked. Heinz bodies. Triggers: oxidative stress (dapsone, primaquine, nitrofurantoin, fava beans, infections). Bite cells on smear" },
              { text: "Sickle cell: deoxygenation → HbS polymerization → sickling. Vaso-occlusive crisis: pain, ACS, stroke, priapism. Hydroxyurea (↑ HbF) reduces crises", highYield: true },
              { text: "AIHA (autoimmune): warm (IgG, SLEP, CLL, methyldopa) → spherocytes, positive DAT. Cold (IgM, Mycoplasma, EBV) → agglutination in cold, treat by warming" },
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "id",
    name: "Infectious Disease",
    icon: "🦠",
    color: "#34d399",
    topics: [
      {
        id: "sepsis",
        name: "Sepsis & Septic Shock",
        system: "Infectious Disease",
        difficulty: 3,
        board_relevance: "step2",
        tags: ["SOFA", "lactate", "Hour-1 Bundle", "norepinephrine", "blood cultures"],
        lifeline_summary: "Sepsis = life-threatening organ dysfunction from dysregulated host response to infection (SOFA score ≥2). Septic shock = sepsis + vasopressors needed + lactate >2 after adequate fluids. Hour-1 Bundle: (1) Measure lactate, (2) Blood cultures ×2 BEFORE antibiotics, (3) Broad-spectrum antibiotics within 1 hour, (4) 30 mL/kg IV crystalloid, (5) Vasopressors if MAP <65. Norepinephrine = first-line vasopressor. Mortality ~7% per hour of antibiotic delay.",
        sections: [
          {
            id: "sepsis_bundle", heading: "Hour-1 Bundle (Surviving Sepsis)", type: "management", icon: "💊",
            bullets: [
              { text: "1. Measure serum lactate (lactate >4 = high mortality, requires aggressive resuscitation)", highYield: true },
              { text: "2. Blood cultures ×2 sets (peripheral ± central) BEFORE antibiotics — takes <5 min, does not justify delaying antibiotics", highYield: true },
              { text: "3. Broad-spectrum antibiotics WITHIN 1 HOUR of recognition — #1 priority. Each hour delay → ~7% ↑ mortality", highYield: true },
              { text: "4. 30 mL/kg IV crystalloid for hypotension (MAP <65) or lactate ≥4 mmol/L", highYield: true },
              { text: "5. Vasopressors if MAP <65 despite adequate resuscitation. Norepinephrine = first-line", highYield: true },
            ]
          },
          {
            id: "sepsis_pressors", heading: "Vasopressors & ICU Care", type: "management", icon: "💊",
            bullets: [
              { text: "Norepinephrine (alpha-1 + beta-1): first-line. Increases SVR + maintains CO. Least tachycardia vs. dopamine", highYield: true },
              { text: "Vasopressin: add-on to norepinephrine. V1 receptor → pure vasoconstriction. Dose: 0.03-0.04 units/min (fixed dose)" },
              { text: "Dopamine: avoid in septic shock (SOAP-II trial: ↑ arrhythmias + trend toward higher mortality vs. norepinephrine). Use only if bradycardia", highYield: true },
              { text: "Hydrocortisone 200-300 mg/day: for septic shock refractory to ≥2 vasopressors. Reduces vasopressor requirement" },
              { text: "Lactate clearance: recheck at 2h. Goal >10% clearance. Guides adequacy of resuscitation better than CVP" },
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pharmacology",
    name: "Pharmacology",
    icon: "💊",
    color: "#e879f9",
    topics: [
      {
        id: "antibiotics",
        name: "Antibiotic Mechanisms & Resistance",
        system: "Pharmacology",
        difficulty: 2,
        board_relevance: "step1",
        tags: ["beta-lactam", "aminoglycoside", "macrolide", "fluoroquinolone", "resistance"],
        lifeline_summary: "Antibiotics by mechanism: cell wall synthesis (beta-lactams, vancomycin), protein synthesis (aminoglycosides 30S, tetracyclines 30S, macrolides 50S, linezolid 50S, chloramphenicol 50S), cell membrane (polymyxins, daptomycin), DNA gyrase/topoisomerase (fluoroquinolones), folate synthesis (TMP-SMX). Key resistance: MRSA → vancomycin (or daptomycin, linezolid). VRE → linezolid or daptomycin. ESBL → carbapenems. Remember: 'Buy AT 30, CELL at 50' mnemonic.",
        sections: [
          {
            id: "abx_mechanism", heading: "Mechanisms of Action", type: "concept", icon: "📋",
            bullets: [
              { text: "Cell wall (bactericidal): Beta-lactams (penicillins, cephalosporins, carbapenems, aztreonam) — inhibit penicillin-binding proteins. Vancomycin — binds D-Ala-D-Ala", highYield: true },
              { text: "30S ribosome (bactericidal): Aminoglycosides (gentamicin, tobramycin, amikacin). Tetracyclines (bacteriostatic). Mnemonic: '30S = Aminoglycosides and Tetracyclines'", highYield: true },
              { text: "50S ribosome (bacteriostatic): Macrolides, Lincosamides (clindamycin), Chloramphenicol, Linezolid. Mnemonic: 'Buy AT 30, CELL at 50'", highYield: true },
              { text: "DNA synthesis: Fluoroquinolones → inhibit DNA gyrase (gram-negative) and topoisomerase IV (gram-positive). Metronidazole → free radicals damage DNA (anaerobes)" },
              { text: "Folate synthesis: Sulfonamides (PABA analog → inhibit dihydropteroate synthase). TMP (inhibit dihydrofolate reductase). TMP-SMX = synergistic block of folate pathway" },
            ]
          },
          {
            id: "abx_resistance", heading: "Key Resistance Patterns", type: "pearls", icon: "💡",
            bullets: [
              { text: "MRSA: altered PBP2a (mecA gene) → beta-lactams ineffective. Treat with vancomycin, daptomycin, linezolid", highYield: true },
              { text: "VRE: vancomycin-resistant Enterococcus. Modified D-Ala-D-Lac → poor vancomycin binding. Treat with linezolid, daptomycin", highYield: true },
              { text: "ESBL (extended-spectrum beta-lactamase): Klebsiella, E. coli. Hydrolyzes most beta-lactams. Treat with carbapenems", highYield: true },
              { text: "CRE (carbapenem-resistant Enterobacteriaceae): KPC enzyme. Extremely limited options. Ceftazidime-avibactam, colistin" },
              { text: "Pseudomonas: intrinsic resistance to many antibiotics. Use anti-pseudomonal: piperacillin-tazobactam, cefepime, meropenem, ciprofloxacin, tobramycin" },
            ]
          }
        ]
      }
    ]
  },
];

// Helper functions
export function getSystemById(id: string): MedicalSystem | undefined {
  return MEDICAL_CONTENT.find(s => s.id === id);
}

export function getTopicById(systemId: string, topicId: string): MedicalTopic | undefined {
  return getSystemById(systemId)?.topics.find(t => t.id === topicId);
}

export function getAllTopics(): MedicalTopic[] {
  return MEDICAL_CONTENT.flatMap(s => s.topics);
}
