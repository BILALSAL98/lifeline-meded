/**
 * Lifeline Rounds™ — Clinical Case Library
 * Each case simulates a real patient encounter.
 * The AI attending draws from these to ask questions, reveal labs, and score the student.
 */

export type RoundsLevel = "MS1" | "MS2" | "MS3" | "MS4" | "Intern" | "Resident";
export type RoundsMode  = "attending" | "resident" | "consult" | "emergency";
export type ScoreCategory = "clinical_reasoning" | "efficiency" | "communication" | "medical_knowledge";

export interface VitalSigns {
  temp:   string;
  hr:     string;
  bp:     string;
  rr:     string;
  o2sat:  string;
  weight?: string;
}

export interface LabResult {
  name:    string;
  value:   string;
  unit:    string;
  flag:    "H" | "L" | "N" | "CR";   // High, Low, Normal, Critical
  normal?: string;
}

export interface ImagingFinding {
  modality: string;
  findings: string;
  impression: string;
}

export interface ClinicalCase {
  id:          string;
  title:       string;
  system:      string;
  difficulty:  1 | 2 | 3 | 4 | 5;
  levels:      RoundsLevel[];
  chiefComplaint: string;

  // Patient info revealed on presentation
  patient: {
    age:    number;
    sex:    "male" | "female";
    pmh:    string[];     // Past medical history
    meds:   string[];
    allergies: string[];
    social: string;       // Social history
  };

  // HPI revealed when student asks
  hpi: string;

  // Vitals (revealed when student examines)
  vitals: VitalSigns;

  // Physical exam (revealed when student asks to examine)
  physicalExam: {
    general: string;
    cv:      string;
    pulm:    string;
    abd:     string;
    neuro:   string;
    extremities?: string;
    skin?: string;
  };

  // Labs (revealed when student orders — gated)
  labs: LabResult[];

  // Imaging (revealed when student orders)
  imaging: ImagingFinding[];

  // The correct diagnosis
  diagnosis:   string;
  ddx:         string[];   // Differential diagnoses to consider

  // Key teaching points
  teachingPoints: string[];

  // Management steps
  management: string[];

  // What the AI attending asks at each stage
  attendingScript: {
    opening:    string;   // First thing attending says
    afterHPI:   string;   // After student presents HPI
    afterExam:  string;   // After student presents exam
    afterLabs:  string;   // After student reviews labs
    finalPimp:  string;   // Final mechanism question
  };

  // Scoring rubric
  scoringCriteria: {
    mustMention:  string[];   // Must be in differential
    mustOrder:    string[];   // Must be ordered
    mustAvoid:    string[];   // Dangerous wrong choices
    keyMechanism: string;     // Mechanism question to ask
  };
}

export const ROUNDS_CASES: ClinicalCase[] = [
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: "case_hf_decompensated",
    title: "Decompensated Heart Failure",
    system: "Cardiology",
    difficulty: 3,
    levels: ["MS3", "MS4", "Intern", "Resident"],
    chiefComplaint: "Worsening shortness of breath × 5 days",

    patient: {
      age: 72, sex: "male",
      pmh: ["Ischemic cardiomyopathy (EF 30%)", "Type 2 diabetes", "HTN", "CKD stage 3"],
      meds: ["Carvedilol 12.5mg BID", "Lisinopril 10mg", "Furosemide 40mg daily", "Metformin", "Aspirin"],
      allergies: ["Penicillin (hives)"],
      social: "Retired. 30 pack-year smoking history, quit 10 years ago. No alcohol.",
    },

    hpi: "Mr. Johnson is a 72-year-old man with known ischemic cardiomyopathy (EF 30%) who presents with 5 days of progressive dyspnea. He reports orthopnea requiring 3 pillows (up from his usual 1), paroxysmal nocturnal dyspnea × 2 episodes, and bilateral ankle swelling worse than baseline. He gained 8 lbs in the past week. He admits to eating a large amount of salty food over the holidays and missed his furosemide doses for 2 days. He denies chest pain, fever, or cough.",

    vitals: {
      temp: "37.1°C", hr: "98 bpm (irregular)", bp: "158/94 mmHg",
      rr: "22 breaths/min", o2sat: "89% on room air",
    },

    physicalExam: {
      general:     "Elderly male in mild-to-moderate respiratory distress, sitting upright, diaphoretic",
      cv:          "Irregular rate and rhythm. JVD present at 45°. S3 gallop present. No murmurs.",
      pulm:        "Bibasilar crackles to mid-lung fields bilaterally. Decreased breath sounds at bases.",
      abd:         "Soft, mild RUQ tenderness. Hepatojugular reflux present.",
      neuro:       "Alert and oriented ×3. No focal deficits.",
      extremities: "3+ pitting edema bilateral lower extremities to the knees. Warm.",
    },

    labs: [
      { name: "BNP",           value: "1,840",  unit: "pg/mL",  flag: "CR", normal: "<100"    },
      { name: "Na",            value: "132",    unit: "mEq/L",  flag: "L",  normal: "135-145" },
      { name: "K",             value: "3.8",    unit: "mEq/L",  flag: "N",  normal: "3.5-5.0" },
      { name: "Creatinine",    value: "1.9",    unit: "mg/dL",  flag: "H",  normal: "0.7-1.2" },
      { name: "BUN",           value: "42",     unit: "mg/dL",  flag: "H",  normal: "7-25"    },
      { name: "Troponin I",    value: "0.04",   unit: "ng/mL",  flag: "N",  normal: "<0.04"   },
      { name: "TSH",           value: "2.1",    unit: "mIU/L",  flag: "N",  normal: "0.4-4.0" },
      { name: "WBC",           value: "9.2",    unit: "K/μL",   flag: "N",  normal: "4.5-11"  },
      { name: "Hgb",           value: "10.8",   unit: "g/dL",   flag: "L",  normal: "13.5-17" },
    ],

    imaging: [
      {
        modality: "Chest X-Ray (PA/Lateral)",
        findings: "Cardiomegaly. Bilateral pleural effusions, right > left. Cephalization of pulmonary vasculature. Perihilar haziness with Kerley B lines at costophrenic angles.",
        impression: "Findings consistent with pulmonary edema and bilateral pleural effusions in setting of known cardiomyopathy.",
      },
      {
        modality: "EKG",
        findings: "Irregularly irregular rhythm. No P waves visible. Rate 95 bpm. QRS 0.10s. No ST changes. LBBB not present.",
        impression: "Atrial fibrillation. No acute ischemic changes.",
      },
    ],

    diagnosis: "Acute decompensated heart failure (ADHF) with new-onset atrial fibrillation",
    ddx: [
      "Acute decompensated heart failure",
      "Atrial fibrillation (new vs. chronic)",
      "Acute MI (triggering decompensation)",
      "Pneumonia",
      "Pulmonary embolism",
      "Medication non-compliance + dietary indiscretion",
    ],

    teachingPoints: [
      "The classic 'FAILURE' mnemonic: Fatigue, Activity limitation, Increased dyspnea, Leg edema, Unintentional weight gain, Rales, Elevated JVP/S3",
      "BNP >400 pg/mL is highly specific for HF decompensation. Values 100-400 are a gray zone.",
      "Afib is both a trigger and consequence of HF — ventricular rate control improves hemodynamics",
      "Identify and correct the precipitant: here it is dietary sodium + med non-compliance + new Afib",
      "IV furosemide (dose = PO dose × 2.5) for acute diuresis. Target urine output 200-300 mL/hr initially",
      "Dilemma: creatinine 1.9 — expect worsening with diuresis (cardiorenal syndrome). Treat the HF first.",
    ],

    management: [
      "Supplemental O2 — target SpO2 ≥92%",
      "IV furosemide 100mg (2.5× PO dose) — monitor urine output hourly",
      "Rate control for Afib: IV metoprolol or diltiazem (avoid in low EF — use digoxin or amiodarone)",
      "Daily weights, strict I&O",
      "Hold Metformin (contrast/renal concerns), hold lisinopril temporarily (AKI risk)",
      "Telemetry monitoring",
      "Echocardiogram to assess current EF",
      "Cardiology consult",
      "Anticoagulation consideration for Afib (CHA2DS2-VASc score = 4 → DOAC indicated)",
    ],

    attendingScript: {
      opening:  "Good morning. Room 4 is yours — Mr. Johnson, 72 years old, came in overnight. Walk me through your assessment.",
      afterHPI: "Good. You mentioned orthopnea and PND — explain to me why heart failure causes those symptoms specifically. What's happening physiologically when he lies flat?",
      afterExam:"You found an S3, JVD, and bibasilar crackles. Before I tell you the BNP — what do these three findings tell you together about left ventricular function and filling pressures?",
      afterLabs:"BNP is 1,840. EKG shows Afib. Creatinine 1.9 — up from his baseline of 1.4. Now: he needs aggressive diuresis but his creatinine is rising. How do you approach this tension?",
      finalPimp:"One more — his sodium is 132. In the context of heart failure, what is the mechanism of hyponatremia, and does it change your management?",
    },

    scoringCriteria: {
      mustMention:  ["heart failure", "atrial fibrillation", "acute MI", "pulmonary embolism"],
      mustOrder:    ["BNP", "EKG", "chest x-ray", "troponin", "BMP"],
      mustAvoid:    ["aggressive IV fluids", "beta-blocker dose increase in acute decompensation"],
      keyMechanism: "Explain the Frank-Starling mechanism and why a failing heart cannot compensate.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    id: "case_aortic_dissection",
    title: "Aortic Dissection",
    system: "Cardiology",
    difficulty: 5,
    levels: ["MS4", "Intern", "Resident"],
    chiefComplaint: "Sudden-onset tearing chest pain",

    patient: {
      age: 58, sex: "male",
      pmh: ["Hypertension (poorly controlled)", "Hyperlipidemia"],
      meds: ["Amlodipine 10mg", "Atorvastatin 40mg"],
      allergies: ["NKDA"],
      social: "Works as an accountant. Smokes 1 PPD × 30 years. Occasional alcohol.",
    },

    hpi: "Mr. Torres is a 58-year-old man who presents via EMS with sudden-onset severe chest pain that he describes as 'tearing' or 'ripping,' 10/10 in severity. Onset was approximately 90 minutes ago, sudden and maximal at onset. Pain radiates to his back between the shoulder blades. He denies diaphoresis, nausea, or syncope. EMS noted BP asymmetry: 192/110 right arm, 154/88 left arm. He has never had pain like this before.",

    vitals: {
      temp: "37.0°C", hr: "112 bpm", bp: "192/110 (R arm) / 154/88 (L arm)",
      rr: "18 breaths/min", o2sat: "97% on room air",
    },

    physicalExam: {
      general:  "Diaphoretic male in severe distress, clutching chest",
      cv:       "Tachycardic. Regular rhythm. No murmur appreciated. Bilateral radial pulses — right stronger than left.",
      pulm:     "Clear to auscultation bilaterally.",
      abd:      "Soft, non-tender. Aorta not palpable.",
      neuro:    "Alert, oriented. No focal deficits.",
      extremities: "Pulses 2+ bilateral lower extremities.",
    },

    labs: [
      { name: "Troponin I",    value: "0.02",   unit: "ng/mL",  flag: "N",  normal: "<0.04"    },
      { name: "D-dimer",       value: "3.4",    unit: "μg/mL",  flag: "H",  normal: "<0.5"     },
      { name: "CBC WBC",       value: "13.2",   unit: "K/μL",   flag: "H",  normal: "4.5-11"   },
      { name: "Hgb",           value: "12.1",   unit: "g/dL",   flag: "L",  normal: "13.5-17"  },
      { name: "Creatinine",    value: "1.1",    unit: "mg/dL",  flag: "N",  normal: "0.7-1.2"  },
      { name: "PT/INR",        value: "1.0",    unit: "",        flag: "N",  normal: "0.9-1.1"  },
    ],

    imaging: [
      {
        modality: "Chest X-Ray",
        findings: "Widened mediastinum (>8 cm). Blurring of the aortic knob. No pneumothorax. No pleural effusion.",
        impression: "Widened mediastinum — concern for aortic pathology. CT angiography recommended urgently.",
      },
      {
        modality: "CT Angiography Chest/Abdomen/Pelvis",
        findings: "Type A aortic dissection with intimal flap extending from the aortic root through the ascending aorta, arch, and into the descending thoracic aorta. True lumen compressed at the level of the arch. No involvement of coronary ostia. No pericardial effusion.",
        impression: "Stanford Type A aortic dissection. Surgical emergency.",
      },
    ],

    diagnosis: "Stanford Type A Aortic Dissection",
    ddx: [
      "Aortic dissection (Type A vs. B)",
      "STEMI (especially inferior — RCA involvement in Type A)",
      "Pulmonary embolism",
      "Tension pneumothorax",
      "Acute pericarditis / cardiac tamponade",
    ],

    teachingPoints: [
      "BP asymmetry between arms (>20 mmHg) is a hallmark of aortic dissection — always check both arms",
      "Tearing/ripping pain maximal at onset that radiates to the back = dissection until proven otherwise",
      "Type A (ascending aorta) = SURGICAL EMERGENCY — 1-2% mortality per hour untreated",
      "Type B (descending only) = medical management first unless complications",
      "First medication: IV labetalol or esmolol (reduce HR <60 bpm first, then SBP <120)",
      "NEVER give vasodilators before beta-blockers — reflex tachycardia worsens aortic wall stress",
      "D-dimer is elevated but non-specific — don't use it to diagnose dissection",
      "Widened mediastinum on CXR is a clue, but CT angiography is the gold standard",
    ],

    management: [
      "2 large-bore IVs, type and crossmatch, continuous arterial line monitoring",
      "IV labetalol: 10-20 mg bolus then infusion — target HR <60 bpm",
      "Once HR controlled: add sodium nitroprusside or nicardipine for SBP <120 mmHg",
      "Do NOT give IV fluids aggressively — may worsen dissection pressure",
      "Pain control: morphine IV PRN",
      "STAT cardiothoracic surgery consult — Type A requires emergent OR",
      "NPO immediately",
      "Hold anticoagulation unless coronary involvement confirmed",
      "Serial neuro and vascular checks (pulse exam q1h)",
    ],

    attendingScript: {
      opening:  "This one just came in, needs you now. 58-year-old man, ambulance brought him in. What are you thinking the moment you walk in the room and see him?",
      afterHPI: "BP asymmetry — right arm 192, left arm 154. You mentioned aortic dissection. Tell me: where exactly is the intimal tear based on that BP difference, and what anatomical structure explains it?",
      afterExam:"Before you order imaging — what is your MOST IMPORTANT immediate pharmacologic intervention, and why do you need to do two things in a specific order?",
      afterLabs:"CT is done. Type A dissection. Cardiothoracic surgery is on the way. While you wait — what structures is this dissection threatening, and what are you watching for clinically?",
      finalPimp:"The fellow asks you: why do we use beta-blockers BEFORE vasodilators in dissection? What goes wrong if you give nitroprusside first?",
    },

    scoringCriteria: {
      mustMention:  ["aortic dissection", "STEMI", "pulmonary embolism"],
      mustOrder:    ["CT angiography", "EKG", "type and crossmatch", "arterial line"],
      mustAvoid:    ["thrombolytics", "anticoagulation without coronary involvement", "vasodilators before beta-blockers"],
      keyMechanism: "Explain why beta-blockers must precede vasodilators in aortic dissection management.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    id: "case_sepsis_pneumonia",
    title: "Septic Shock from Pneumonia",
    system: "Infectious Disease",
    difficulty: 4,
    levels: ["MS3", "MS4", "Intern", "Resident"],
    chiefComplaint: "Fever, confusion, and hypotension",

    patient: {
      age: 68, sex: "female",
      pmh: ["Type 2 diabetes", "COPD (GOLD II)", "Hypertension"],
      meds: ["Metformin", "Tiotropium inhaler", "Lisinopril", "Aspirin"],
      allergies: ["Sulfa (rash)"],
      social: "Retired teacher. Nonsmoker. Lives alone. Flu shot this year, no pneumococcal vaccine.",
    },

    hpi: "Ms. Rivera is a 68-year-old woman brought by her daughter with 3 days of productive cough with yellow-green sputum, fever to 39.4°C, and progressive shortness of breath. This morning she was confused and her daughter couldn't wake her normally. She has not been eating or drinking. Daughter reports she seemed 'out of it' and her lips looked bluish.",

    vitals: {
      temp: "39.6°C", hr: "124 bpm", bp: "84/52 mmHg",
      rr: "28 breaths/min", o2sat: "84% on room air → 93% on 6L NC",
      weight: "68 kg",
    },

    physicalExam: {
      general:     "Elderly female, altered, minimally responsive to voice. Ill-appearing, diaphoretic.",
      cv:          "Tachycardic, regular. Peripheral pulses weak. Capillary refill 4 seconds.",
      pulm:        "Dullness to percussion right lower lobe. Bronchial breath sounds RLL. Crackles bilateral bases.",
      abd:         "Soft, non-tender, non-distended.",
      neuro:       "GCS 11 (E3V3M5). No focal deficits. Neck supple.",
      extremities: "Mottled lower extremities. Cool peripherally.",
    },

    labs: [
      { name: "WBC",         value: "22.4",   unit: "K/μL",  flag: "CR", normal: "4.5-11"    },
      { name: "Bands",       value: "18",     unit: "%",     flag: "H",  normal: "<10%"       },
      { name: "Hgb",         value: "11.8",   unit: "g/dL",  flag: "L",  normal: "12-16"      },
      { name: "Platelets",   value: "88",     unit: "K/μL",  flag: "L",  normal: "150-400"    },
      { name: "Na",          value: "128",    unit: "mEq/L", flag: "L",  normal: "135-145"    },
      { name: "Creatinine",  value: "2.8",    unit: "mg/dL", flag: "CR", normal: "0.5-1.1"    },
      { name: "Lactate",     value: "5.2",    unit: "mmol/L",flag: "CR", normal: "<2"         },
      { name: "Procalcitonin",value: "42",    unit: "ng/mL", flag: "CR", normal: "<0.25"      },
      { name: "Glucose",     value: "318",    unit: "mg/dL", flag: "H",  normal: "70-100"     },
      { name: "pH (VBG)",    value: "7.22",   unit: "",      flag: "L",  normal: "7.35-7.45"  },
      { name: "HCO3",        value: "14",     unit: "mEq/L", flag: "L",  normal: "22-28"      },
    ],

    imaging: [
      {
        modality: "Chest X-Ray",
        findings: "Dense right lower lobe consolidation with air bronchograms. Small right pleural effusion. No pneumothorax.",
        impression: "Right lower lobe pneumonia with parapneumonic effusion.",
      },
    ],

    diagnosis: "Septic shock secondary to community-acquired pneumonia (CAP)",
    ddx: [
      "Septic shock (pneumonia)",
      "Cardiogenic shock",
      "Pulmonary embolism with shock",
      "Diabetic ketoacidosis",
      "Meningitis (altered mental status)",
    ],

    teachingPoints: [
      "Septic shock = sepsis + vasopressor requirement + lactate >2 despite adequate fluid resuscitation",
      "Hour-1 Bundle: Lactate → Blood cultures → Antibiotics (within 1h) → 30 mL/kg crystalloid → Vasopressors if MAP <65",
      "CAP empiric coverage: beta-lactam + macrolide OR respiratory fluoroquinolone",
      "Lactate 5.2 indicates severe tissue hypoperfusion — lactate clearance is a resuscitation goal",
      "Norepinephrine is first-line vasopressor in septic shock (not dopamine unless bradycardia)",
      "SOFA score: Respiratory (PaO2/FiO2), Coagulation (platelets), Liver (bilirubin), CV (MAP/pressors), CNS (GCS), Renal (creatinine)",
      "Thrombocytopenia in sepsis suggests DIC — check fibrinogen and PT/PTT",
    ],

    management: [
      "AIRWAY FIRST: supplemental O2; prepare for intubation if GCS worsens",
      "2 large-bore IVs; draw 2 sets blood cultures BEFORE antibiotics",
      "Antibiotics within 1 hour: Ceftriaxone 1g IV + Azithromycin 500mg IV",
      "30 mL/kg (2,040 mL) crystalloid IV over 3 hours",
      "Reassess after fluids: if MAP still <65 → start Norepinephrine (titrate 0.1-0.5 mcg/kg/min)",
      "ICU transfer — telemetry, Foley catheter, target UO >0.5 mL/kg/hr",
      "Check lactate at 2 hours — target >10% clearance",
      "Insulin infusion for glucose >180 mg/dL",
      "Consider hydrocortisone 200mg/day if vasopressor-refractory shock",
    ],

    attendingScript: {
      opening:  "She just came in by EMS. Daughter is in the waiting room. You've seen the vitals. Before you do anything else — tell me what's happening to this patient in one sentence.",
      afterHPI: "Septic shock — correct. What's your Hour-1 Bundle, and what is the single most time-sensitive intervention?",
      afterExam:"RLL consolidation, altered mental status, mottled extremities. Lactate 5.2. After your first 2 liters, her BP is 78/48 and MAP is 58. What do you do now?",
      afterLabs:"Platelets 88 and falling, lactate 5.2, creatinine 2.8 — she's developing multi-organ failure. Walk me through the pathophysiology connecting her pneumonia to all of these findings.",
      finalPimp:"Why is norepinephrine preferred over dopamine in septic shock? What does the SOAP-II trial tell us?",
    },

    scoringCriteria: {
      mustMention:  ["septic shock", "pneumonia", "pulmonary embolism", "cardiogenic shock"],
      mustOrder:    ["blood cultures", "lactate", "chest x-ray", "CBC/BMP"],
      mustAvoid:    ["delay antibiotics for culture results", "give dopamine first-line"],
      keyMechanism: "Explain the pathophysiology connecting bacterial infection to multi-organ failure in sepsis.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    id: "case_nephrotic_child",
    title: "Nephrotic Syndrome in a Child",
    system: "Renal",
    difficulty: 2,
    levels: ["MS1", "MS2", "MS3"],
    chiefComplaint: "Puffy eyes and swollen legs",

    patient: {
      age: 7, sex: "male",
      pmh: ["URI 3 weeks ago, treated conservatively"],
      meds: ["None"],
      allergies: ["NKDA"],
      social: "Second grade student. Lives with parents and one sibling. No sick contacts with similar symptoms.",
    },

    hpi: "Logan is a 7-year-old boy brought by his parents for 2 weeks of progressive periorbital puffiness, worse in the morning, and swelling of his legs. His parents noticed his urine looked 'frothy' in the toilet. He has had decreased energy and appetite. His symptoms started about 10 days after a cold that resolved on its own. He has no hematuria, no painful urination, and no rash.",

    vitals: {
      temp: "36.9°C", hr: "88 bpm", bp: "104/66 mmHg",
      rr: "18 breaths/min", o2sat: "99% on room air",
    },

    physicalExam: {
      general:     "Well-appearing 7-year-old male, periorbital edema pronounced (eyes nearly swollen shut), appears puffy",
      cv:          "Regular rate and rhythm. No murmurs.",
      pulm:        "Clear to auscultation bilaterally.",
      abd:         "Mild ascites present. Soft, non-tender.",
      neuro:       "Alert, playful.",
      extremities: "2+ pitting edema bilateral lower extremities to the knees. Scrotal edema.",
    },

    labs: [
      { name: "Urine Protein",    value: "4+",    unit: "",       flag: "CR", normal: "Negative"  },
      { name: "Urine Blood",      value: "Neg",   unit: "",       flag: "N",  normal: "Negative"  },
      { name: "Urine RBCs",       value: "0-2",   unit: "/hpf",   flag: "N",  normal: "0-2"       },
      { name: "Urine Casts",      value: "Oval fat bodies", unit: "", flag: "H",  normal: "None"  },
      { name: "Serum Albumin",    value: "1.4",   unit: "g/dL",   flag: "CR", normal: "3.5-5.0"  },
      { name: "Total Cholesterol",value: "380",   unit: "mg/dL",  flag: "CR", normal: "<170"      },
      { name: "Triglycerides",    value: "420",   unit: "mg/dL",  flag: "H",  normal: "<150"      },
      { name: "Creatinine",       value: "0.5",   unit: "mg/dL",  flag: "N",  normal: "0.3-0.7"  },
      { name: "C3/C4",            value: "Normal",unit: "",        flag: "N",  normal: "Normal"    },
      { name: "ANA",              value: "Neg",   unit: "",        flag: "N",  normal: "Negative"  },
    ],

    imaging: [],

    diagnosis: "Minimal Change Disease (Nephrotic Syndrome)",
    ddx: [
      "Minimal Change Disease (most likely — children post-URI)",
      "Focal Segmental Glomerulosclerosis",
      "Membranous Nephropathy",
      "IgA Nephropathy (nephritic — less likely, no hematuria)",
      "Lupus nephritis (ANA negative, unlikely)",
    ],

    teachingPoints: [
      "Nephrotic syndrome = proteinuria >3.5 g/day, hypoalbuminemia, edema, hyperlipidemia",
      "In children <8 years with nephrotic syndrome: assume Minimal Change Disease — biopsy not initially needed",
      "MCD: normal light microscopy, foot process effacement on EM — T-cell-mediated podocyte injury",
      "Post-URI trigger is classic for MCD in children",
      "Treatment: prednisone 2 mg/kg/day × 4-6 weeks; 85% respond within 8 weeks",
      "Complication: hypercoagulability (loss of AT-III, Protein C/S) — risk of renal vein thrombosis",
      "NO hematuria, NO hypertension, NO RBC casts, NORMAL C3/C4 — distinguishes nephrotic from nephritic",
    ],

    management: [
      "Prednisone 2 mg/kg/day (max 60 mg/day) × 4-6 weeks",
      "Low-sodium, low-fat diet",
      "Furosemide PRN for severe edema (use cautiously — intravascular volume depleted)",
      "Monitor urine protein daily (urine dipstick at home)",
      "Nephrology referral",
      "Pneumococcal vaccine if not up to date (steroids increase infection risk)",
      "VTE prophylaxis consideration if serum albumin <2.0 g/dL",
      "Biopsy only if: age <1 or >12, hematuria, HTN, low C3, or no steroid response at 8 weeks",
    ],

    attendingScript: {
      opening:  "Logan's here with his mom and dad — they're pretty worried. Seven years old, puffy eyes for two weeks. What's your leading diagnosis before you even examine him?",
      afterHPI: "Post-URI, nephrotic picture, no blood in urine. What's the pathophysiology of the edema in nephrotic syndrome? Walk me through it step by step.",
      afterExam:"Serum albumin 1.4, total protein 4+, no hematuria, normal C3. Before I tell you whether we're doing a biopsy — do you need one? Why or why not?",
      afterLabs:"You've decided on prednisone. His mom asks: 'Will this happen again?' What do you tell her?",
      finalPimp:"His albumin is 1.4. He's at risk for VTE. Explain which proteins he's losing in his urine and why that makes him clot.",
    },

    scoringCriteria: {
      mustMention:  ["nephrotic syndrome", "minimal change disease", "FSGS"],
      mustOrder:    ["urine protein", "serum albumin", "lipid panel", "complement levels"],
      mustAvoid:    ["routine biopsy in a 7-year-old with classic MCD presentation", "aggressive diuresis without caution"],
      keyMechanism: "Explain why nephrotic syndrome causes both edema and hypercoagulability.",
    },
  },
];

// Helper: get cases by system
export function getCasesBySystem(system: string): ClinicalCase[] {
  return ROUNDS_CASES.filter((c) => c.system === system);
}

// Helper: get cases by level
export function getCasesByLevel(level: RoundsLevel): ClinicalCase[] {
  return ROUNDS_CASES.filter((c) => c.levels.includes(level));
}
