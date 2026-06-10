/**
 * Lifeline Recall — Shared utilities
 * Used by content.js, youtube.js, popup.js, and background.js
 */

const LIFELINE_API = "http://localhost:3000"; // Change to production URL when deployed

// ─── Storage helpers ─────────────────────────────────────────────────────────

export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      {
        apiUrl: LIFELINE_API,
        userId: null,
        authToken: null,
        defaultDeck: "Lifeline Recall::Captured",
        defaultSourceType: "auto",
        recentCards: [],
        sessionCount: 0,
      },
      resolve
    );
  });
}

export async function saveSettings(updates) {
  return new Promise((resolve) => {
    chrome.storage.local.set(updates, resolve);
  });
}

export async function isLoggedIn() {
  const { userId, authToken } = await getSettings();
  return !!(userId && authToken);
}

// ─── AI card generation ───────────────────────────────────────────────────────

/**
 * Generate flashcards from raw text.
 * Calls the Lifeline API if the user is logged in.
 * Falls back to a local rule-based generator for demo purposes.
 */
export async function generateCards(text, sourceType = "other", topic = null) {
  const { apiUrl, userId, authToken } = await getSettings();

  if (userId && authToken) {
    try {
      const res = await fetch(`${apiUrl}/api/cards/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text, source_type: sourceType, user_id: userId }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("[Lifeline] API unavailable, using local generator:", e);
    }
  }

  // Local fallback generator — works without login/API
  return localCardGenerator(text, sourceType, topic);
}

/**
 * Save cards to the user's Lifeline account.
 */
export async function saveCards(cards) {
  const { apiUrl, userId, authToken, recentCards } = await getSettings();

  if (!userId || !authToken) return { success: false, reason: "not_logged_in" };

  try {
    const results = await Promise.all(
      cards.map((card) =>
        fetch(`${apiUrl}/api/cards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ ...card, user_id: userId }),
        }).then((r) => r.json())
      )
    );

    // Cache recent cards locally
    const updated = [...cards.slice(0, 3), ...recentCards].slice(0, 10);
    await saveSettings({ recentCards: updated, sessionCount: (await getSettings()).sessionCount + 1 });

    return { success: true, cards: results };
  } catch (e) {
    return { success: false, reason: "api_error", error: e.message };
  }
}

// ─── Local card generator (no API required) ───────────────────────────────────

function localCardGenerator(text, sourceType, topic) {
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const detectedTopic = topic || detectTopic(text);
  const detectedSystem = detectSystem(text);
  const deck = `Lifeline Recall::${detectedSystem}::${detectedTopic}`;

  const cards = [];

  // Card 1: Basic question from first substantial sentence
  if (sentences[0]) {
    cards.push({
      card_type: "basic",
      front: `Explain: ${detectedTopic}`,
      back: sentences.slice(0, 2).join(". ") + ".",
      explanation: "Captured from " + sourceTypeLabel(sourceType),
      tags: [detectedSystem.toLowerCase(), detectedTopic.toLowerCase().replace(/\s+/g, "-"), sourceType],
      deck,
      topic: detectedTopic,
      system: detectedSystem,
      difficulty: 3,
      board_relevance: "step1",
      source_type: sourceType,
      source_text: text.slice(0, 150) + "...",
    });
  }

  // Card 2: Cloze from a middle sentence if available
  if (sentences.length >= 2) {
    const clozeSource = sentences[1] || sentences[0];
    const words = clozeSource.split(" ");
    // Pick a meaningful word to blank (avoid articles/prepositions)
    const skipWords = new Set(["the", "a", "an", "is", "are", "was", "were", "of", "in", "on", "at", "to", "for", "by", "with"]);
    const targetIdx = words.findIndex((w, i) => i > 2 && !skipWords.has(w.toLowerCase()) && w.length > 4);
    if (targetIdx !== -1) {
      const clozeText = words
        .map((w, i) => (i === targetIdx ? `{{c1::${w}}}` : w))
        .join(" ");
      cards.push({
        card_type: "cloze",
        front: clozeText,
        back: "",
        cloze_text: clozeText,
        explanation: "Key term from captured content",
        tags: [detectedSystem.toLowerCase(), "cloze", sourceType],
        deck,
        topic: detectedTopic,
        system: detectedSystem,
        difficulty: 2,
        board_relevance: "step1",
        source_type: sourceType,
        source_text: text.slice(0, 150),
      });
    }
  }

  // Card 3: High-yield summary card
  if (sentences.length >= 3) {
    cards.push({
      card_type: "basic",
      front: `What is the clinical significance of ${detectedTopic}?`,
      back: sentences.slice(-2).join(". ") + ".",
      explanation: "Clinical summary from " + sourceTypeLabel(sourceType),
      tags: [detectedSystem.toLowerCase(), "clinical", "high-yield"],
      deck,
      topic: detectedTopic,
      system: detectedSystem,
      difficulty: 3,
      board_relevance: "both",
      source_type: sourceType,
      source_text: text.slice(0, 150),
    });
  }

  return {
    topic: detectedTopic,
    system: detectedSystem,
    cards,
    study_guide: {
      sections: [
        {
          heading: "Captured Content",
          section_type: "concept",
          content: sentences.slice(0, 5),
        },
      ],
    },
  };
}

// ─── Detection helpers ────────────────────────────────────────────────────────

const SYSTEM_KEYWORDS = {
  Cardiology: ["heart", "cardiac", "myocardial", "atrial", "ventricular", "arrhythmia", "ecg", "ekg", "pericardial", "coronary", "aortic", "mitral", "ejection fraction"],
  Renal: ["kidney", "renal", "glomerular", "nephrotic", "nephritic", "creatinine", "proteinuria", "hematuria", "gfr", "aki", "ckd", "tubular"],
  Pulmonology: ["lung", "pulmonary", "respiratory", "asthma", "copd", "pneumonia", "bronchial", "alveolar", "pleural", "oxygen", "dyspnea"],
  Neurology: ["brain", "neural", "stroke", "cerebral", "meningitis", "seizure", "epilepsy", "parkinson", "dementia", "cranial", "nerve"],
  Gastroenterology: ["liver", "hepatic", "bowel", "colon", "stomach", "gastric", "pancreatic", "biliary", "cirrhosis", "hepatitis", "portal"],
  Endocrine: ["thyroid", "diabetes", "insulin", "cortisol", "adrenal", "pituitary", "hormone", "glucose", "hba1c", "thyrotoxicosis"],
  Hematology: ["blood", "anemia", "hemoglobin", "platelet", "leukemia", "lymphoma", "coagulation", "thrombosis", "clotting"],
  Immunology: ["immune", "autoimmune", "antibody", "antigen", "lupus", "rheumatoid", "inflammation"],
  Pharmacology: ["drug", "dose", "mechanism", "receptor", "inhibitor", "agonist", "antagonist", "pharmacokinetics", "side effect"],
};

function detectSystem(text) {
  const lower = text.toLowerCase();
  let bestSystem = "General";
  let bestScore = 0;
  for (const [system, keywords] of Object.entries(SYSTEM_KEYWORDS)) {
    const score = keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestSystem = system;
    }
  }
  return bestSystem;
}

function detectTopic(text) {
  // Extract likely topic from first sentence or capitalized terms
  const firstSentence = text.split(/[.!?\n]/)[0].trim();
  if (firstSentence.length < 60) return firstSentence;
  // Find capitalized multi-word phrases
  const caps = text.match(/[A-Z][a-z]+ (?:[A-Z][a-z]+ )?(?:Disease|Syndrome|Disorder|Failure|Infection|Anemia|Nephropathy|Cardiomyopathy)/g);
  if (caps && caps[0]) return caps[0];
  return "Medical Concept";
}

function sourceTypeLabel(type) {
  const labels = { qbank: "Question Bank", video: "Video/Lecture", textbook: "Textbook", notes: "Notes", youtube: "YouTube", other: "Web Page" };
  return labels[type] || "Web Page";
}

// ─── Page type detection ──────────────────────────────────────────────────────

export function detectPageSourceType() {
  const url = window.location.href.toLowerCase();
  const hostname = window.location.hostname.toLowerCase();

  if (hostname.includes("youtube.com")) return "video";
  if (hostname.includes("amboss.com") || hostname.includes("uworld.com") || hostname.includes("amboss") || url.includes("question")) return "qbank";
  if (hostname.includes("ncbi.nlm.nih.gov") || hostname.includes("pubmed")) return "textbook";
  if (hostname.includes("uptodate.com") || hostname.includes("mdcalc.com")) return "textbook";
  return "other";
}
