/**
 * Lifeline Recall — Background Service Worker (Manifest V3)
 * Handles: context menus, cross-tab messaging, badge updates, alarms
 */

// ─── Extension install / update ───────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    setupContextMenus();
    chrome.storage.local.set({
      apiUrl: "http://localhost:3000",
      userId: null,
      authToken: null,
      defaultDeck: "Lifeline Recall::Captured",
      recentCards: [],
      sessionCount: 0,
      totalCardsSaved: 0,
    });
  } else if (reason === "update") {
    setupContextMenus();
  }
});

// ─── Context menus (right-click) ──────────────────────────────────────────────

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "lifeline-capture",
      title: '📚 Capture with Lifeline Recall',
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "lifeline-separator",
      type: "separator",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "lifeline-capture-qbank",
      title: "Capture as Question Bank",
      parentId: "lifeline-capture",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "lifeline-capture-notes",
      title: "Capture as Lecture Notes",
      parentId: "lifeline-capture",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "lifeline-capture-textbook",
      title: "Capture as Textbook",
      parentId: "lifeline-capture",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "lifeline-open-platform",
      title: "Open Lifeline Platform",
      contexts: ["action"],
    });
  });
}

// ─── Context menu click handler ───────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const sourceTypeMap = {
    "lifeline-capture": "other",
    "lifeline-capture-qbank": "qbank",
    "lifeline-capture-notes": "video",
    "lifeline-capture-textbook": "textbook",
  };

  const sourceType = sourceTypeMap[info.menuItemId] || "other";
  const text = info.selectionText;

  if (!text) return;

  // Tell the content script to open sidebar with this text
  chrome.tabs.sendMessage(tab.id, {
    type: "OPEN_SIDEBAR_WITH_TEXT",
    payload: { text, sourceType },
  });
});

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {

    case "CARDS_SAVED": {
      // Increment badge count and update storage
      chrome.storage.local.get(["totalCardsSaved"], ({ totalCardsSaved = 0 }) => {
        const newTotal = totalCardsSaved + (message.payload?.count || 1);
        chrome.storage.local.set({ totalCardsSaved: newTotal });
        updateBadge(newTotal);
      });
      sendResponse({ ok: true });
      break;
    }

    case "GET_SETTINGS": {
      chrome.storage.local.get(null, (settings) => sendResponse(settings));
      return true; // Keep channel open for async response
    }

    case "OPEN_LIFELINE": {
      const { apiUrl } = message.payload || {};
      const url = apiUrl || "http://localhost:3000/recall";
      chrome.tabs.create({ url });
      sendResponse({ ok: true });
      break;
    }

    case "GENERATE_CARDS_IN_BACKGROUND": {
      const { text, sourceType } = message.payload;

      chrome.storage.local.get(["anthropicApiKey", "openaiApiKey", "groqApiKey"], (s) => {
        const { anthropicApiKey, openaiApiKey, groqApiKey } = s;
        if (!openaiApiKey && !anthropicApiKey && !groqApiKey) {
          sendResponse({ ok: false, error: "no_ai_key" });
          return;
        }
        // Priority: Groq (free) → OpenAI → Anthropic
        const primary = groqApiKey
          ? generateWithGroq(text, sourceType, groqApiKey)
          : openaiApiKey
            ? generateWithOpenAI(text, sourceType, openaiApiKey)
            : generateWithAnthropic(text, sourceType, anthropicApiKey);

        primary
          .then((data) => sendResponse({ ok: true, data }))
          .catch((err) => sendResponse({ ok: false, error: err.message }));
      });
      return true;
    }

    case "TEST_API_KEY": {
      const { provider, key } = message.payload;
      testApiKey(provider, key)
        .then((result) => sendResponse({ ok: true, ...result }))
        .catch((err) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    case "GENERATE_WITH_ANTHROPIC": {
      const { text, sourceType, apiKey } = message.payload;
      generateWithAnthropic(text, sourceType, apiKey)
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    case "GENERATE_WITH_OPENAI": {
      const { text, sourceType, apiKey } = message.payload;
      generateWithOpenAI(text, sourceType, apiKey)
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    case "ASK_AI_QUESTION": {
      const { question, context } = message.payload;
      chrome.storage.local.get(["anthropicApiKey", "openaiApiKey", "groqApiKey"], (s) => {
        const fn = s.groqApiKey
          ? askWithGroq(question, context, s.groqApiKey)
          : s.openaiApiKey
            ? askWithOpenAI(question, context, s.openaiApiKey)
            : s.anthropicApiKey
              ? askWithAnthropic(question, context, s.anthropicApiKey)
              : Promise.reject(new Error("no_ai_key"));
        fn
          .then((answer) => sendResponse({ ok: true, answer }))
          .catch((err) => sendResponse({ ok: false, error: err.message }));
      });
      return true;
    }

    case "SAVE_CARD_IN_BACKGROUND": {
      const { card, apiUrl, authToken, userId } = message.payload;
      fetch(`${apiUrl}/api/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ...card, user_id: userId }),
      })
        .then((r) => r.json())
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    default:
      sendResponse({ ok: false, reason: "unknown_message_type" });
  }
});

// ─── AI Card Generation ───────────────────────────────────────────────────────

const CARD_GEN_PROMPT = `You are an expert USMLE tutor. A medical student has captured text they are struggling to understand. Your job is to create 6 high-yield flashcards that bridge THEIR captured content to what USMLE Step 1 and Step 2 CK actually test.

RULES — follow every one:
1. NEVER create generic or superficial questions. Every card must deepen understanding.
2. Connect the concept to its underlying MECHANISM (pathophysiology, pharmacology, or physiology).
3. Add high-yield USMLE facts that are NOT in the source text but are tested on boards for this topic.
4. Write questions the way USMLE actually phrases them — clinical vignette style when possible.
5. For "basic" cards: front = a specific testable question, back = complete mechanism-based answer.
6. For "vignette" cards: write a realistic patient stem (age, sex, symptoms, vitals, labs), then ask "What is the diagnosis? What is the next best step?"
7. For "cloze" cards: blank out a KEY number, drug name, or mechanism word. Use {{c1::answer}} syntax.
8. Every back/answer must explain WHY, not just WHAT.
9. Include a board pearl in explanation: mnemonic, classic presentation, or high-yield fact students miss.
10. Mix card types: 2 basic, 1 cloze, 1 vignette, 1 comparison or mechanism, 1 mnemonic or clinical pearl.

Return ONLY valid JSON (no markdown, no prose outside JSON):
{
  "topic": "specific USMLE diagnosis or concept",
  "system": "organ system",
  "cards": [
    {
      "card_type": "basic",
      "front": "Precise USMLE-style question targeting mechanism or clinical decision",
      "back": "Complete answer: mechanism + what Step 1/2 tests + clinical consequence",
      "cloze_text": null,
      "explanation": "Board pearl: why this is high-yield, mnemonic, or classic presentation students miss",
      "tags": ["system", "step1", "mechanism"],
      "board_level": "step1"
    },
    {
      "card_type": "cloze",
      "front": "Key fact with {{c1::critical term or number}} blanked — must be board-testable",
      "back": "",
      "cloze_text": "Key fact with {{c1::critical term or number}} blanked",
      "explanation": "Why this specific fact appears on USMLE",
      "tags": ["cloze", "step1"],
      "board_level": "step1"
    },
    {
      "card_type": "vignette",
      "front": "A [age][sex] with [relevant history] presents with [classic symptoms]. [Key lab/vital finding].",
      "back": "",
      "stem": "Full realistic patient vignette stem",
      "question": "What is the most likely diagnosis and what is the next best step in management?",
      "answer_points": ["Diagnosis: [specific diagnosis] — because [classic feature]", "Next step: [specific action] — rationale", "Key teaching: [mechanism or board pearl]"],
      "cloze_text": null,
      "explanation": "Why this presentation is classic for boards",
      "tags": ["vignette", "clinical"],
      "board_level": "step2"
    }
  ]
}

Generate exactly 6 cards mixing these types: basic, cloze, vignette, workup, mnemonic, or flowchart.
Source content:`;

// ─── Key Tester ───────────────────────────────────────────────────────────────
async function testApiKey(provider, key) {
  const cleanKey = (key || "").replace(/\s/g, "");
  if (!cleanKey) throw new Error("No key provided — paste your key first");

  if (provider === "groq") {
    // Use the models list endpoint — simple GET, no body, no model name needed
    let r, body;
    try {
      r = await fetch("https://api.groq.com/openai/v1/models", {
        method: "GET",
        headers: { "Authorization": `Bearer ${cleanKey}` },
      });
      body = await r.text();
    } catch (e) {
      throw new Error("Network error reaching Groq — check internet connection");
    }

    if (r.status === 401) throw new Error(
      "Key invalid (401) — keys start with gsk_. Get one free at console.groq.com/keys"
    );
    if (r.status === 403) throw new Error(
      "Key forbidden (403) — this key may have been revoked. Create a new one at console.groq.com/keys"
    );
    if (!r.ok) throw new Error(`Groq returned ${r.status}: ${body.slice(0, 120)}`);

    // Parse available models and pick the best one
    let available = [];
    try { available = JSON.parse(body).data.map(m => m.id); } catch {}
    const preferred = ["llama-3.3-70b-versatile","llama-3.1-70b-versatile","llama-3.1-8b-instant","llama3-8b-8192","mixtral-8x7b-32768"];
    const best = preferred.find(m => available.includes(m)) || available[0] || "llama-3.1-8b-instant";

    return { message: `✓ Groq key works! Using ${best}. Free AI generation is active.`, model: best };
  }

  if (provider === "openai") {
    let r, body;
    try {
      r = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: { "Authorization": `Bearer ${cleanKey}` },
      });
      body = await r.text();
    } catch (e) {
      throw new Error("Network error reaching OpenAI — check internet connection");
    }
    if (r.status === 401) throw new Error("Key rejected (401) — invalid key or no billing at platform.openai.com/billing");
    if (r.status === 429) throw new Error("Quota exceeded (429) — add credits at platform.openai.com/billing");
    if (!r.ok) throw new Error(`OpenAI returned ${r.status}: ${body.slice(0, 120)}`);
    return { message: "✓ OpenAI key works! GPT-4o mini is active." };
  }

  throw new Error("Unknown provider");
}

// ─── Groq (Free tier — no credit card needed) ────────────────────────────────
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
];

async function generateWithGroq(text, sourceType, apiKey) {
  const cleanKey = (apiKey || "").replace(/\s/g, "");

  // Try stored preferred model first, then the priority list
  const stored = await new Promise(r => chrome.storage.local.get(["groqPreferredModel"], r));
  const modelsToTry = stored.groqPreferredModel
    ? [stored.groqPreferredModel, ...GROQ_MODELS.filter(m => m !== stored.groqPreferredModel)]
    : GROQ_MODELS;

  let lastError;
  for (const model of modelsToTry) {
    let resp;
    try {
      resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${cleanKey}` },
        body: JSON.stringify({
          model,
          max_tokens: 3500,
          messages: [{ role: "user", content: `${CARD_GEN_PROMPT}\n\n${text.slice(0, 3000)}` }],
        }),
      });
    } catch (e) {
      lastError = new Error("Network error connecting to Groq"); continue;
    }

    if (resp.status === 401) throw new Error("OpenAI API error: 401 — Groq key invalid");
    if (resp.status === 404 || resp.status === 400) { lastError = new Error(`Model ${model} unavailable`); continue; }
    if (resp.status === 429) throw new Error("OpenAI API error: 429 — Groq rate limit, try again in a moment");
    if (!resp.ok) { lastError = new Error(`Groq error ${resp.status}`); continue; }

    const data = await resp.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { lastError = new Error("Groq returned no JSON"); continue; }

    const parsed = JSON.parse(jsonMatch[0]);
    parsed.cards = (parsed.cards || []).map((card) => normalizeCard(card, parsed, sourceType, text));
    // Remember which model worked
    chrome.storage.local.set({ groqPreferredModel: model });
    return parsed;
  }
  throw lastError || new Error("All Groq models failed");
}

function normalizeCard(card, parsed, sourceType, text) {
  return {
    card_type: card.card_type || "basic",
    front: card.front || "",
    back: card.back || (card.answer_points ? card.answer_points.join("\n") : ""),
    cloze_text: card.cloze_text || null,
    explanation: card.explanation || "",
    tags: card.tags || [],
    deck: `Step 1::${parsed.system || "General"}::${parsed.topic || "Captured"}`,
    topic: parsed.topic || "Medical Concept",
    system: parsed.system || "General",
    difficulty: 3,
    board_relevance: card.board_level || "both",
    source_type: sourceType,
    source_text: text.slice(0, 200),
    stem: card.stem || card.front,
    question: card.question || "",
    answer_points: card.answer_points || [],
    steps: card.steps || [],
    acronym: card.acronym || "",
    items: card.items || [],
    flowchart: card.flowchart || null,
  };
}

async function generateWithAnthropic(text, sourceType, apiKey) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `${CARD_GEN_PROMPT}\n\n${text.slice(0, 3000)}`,
      }],
    }),
  });

  if (!resp.ok) throw new Error(`Anthropic API error: ${resp.status}`);
  const data = await resp.json();
  const rawText = data.content?.[0]?.text || "";

  // Extract JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Anthropic response");

  const parsed = JSON.parse(jsonMatch[0]);

  // Normalize card structure
  parsed.cards = (parsed.cards || []).map((card) => ({
    card_type:   card.card_type || "basic",
    front:       card.front || "",
    back:        card.back || (card.answer_points ? card.answer_points.join("\n") : ""),
    cloze_text:  card.cloze_text || null,
    explanation: card.explanation || "",
    tags:        card.tags || [],
    deck:        `Step 1::${parsed.system || "General"}::${parsed.topic || "Captured"}`,
    topic:       parsed.topic || "Medical Concept",
    system:      parsed.system || "General",
    difficulty:  3,
    board_relevance: card.board_level || "both",
    source_type: sourceType,
    source_text: text.slice(0, 200),
    // Vignette extras
    stem:         card.stem || card.front,
    question:     card.question || "",
    answer_points: card.answer_points || [],
    // Workup extras
    steps:        card.steps || [],
    // Mnemonic extras
    acronym:      card.acronym || "",
    items:        card.items || [],
    // Flowchart extras
    flowchart:    card.flowchart || null,
  }));

  return parsed;
}

async function generateWithOpenAI(text, sourceType, apiKey) {
  // Try models in order: gpt-4o-mini (cheap, widely available) → gpt-3.5-turbo (widest access)
  const models = ["gpt-4o-mini", "gpt-3.5-turbo"];
  let lastError;

  for (const model of models) {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model,
        max_tokens: 3500,
        messages: [{ role: "user", content: `${CARD_GEN_PROMPT}\n\n${text.slice(0, 3000)}` }],
      }),
    });

    if (resp.status === 401) {
      throw new Error("OpenAI API error: 401 — key rejected. Check your key is correct and your account has billing/credits.");
    }
    if (resp.status === 429) {
      throw new Error("OpenAI API error: 429 — rate limit or quota exceeded. Check your usage at platform.openai.com.");
    }
    if (!resp.ok) {
      lastError = new Error(`OpenAI API error: ${resp.status}`);
      continue; // Try next model
    }

    const data = await resp.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { lastError = new Error("No JSON in OpenAI response"); continue; }

    const parsed = JSON.parse(jsonMatch[0]);
    parsed.cards = (parsed.cards || []).map((card) => normalizeCard(card, parsed, sourceType, text));
    return parsed;
  }

  throw lastError || new Error("OpenAI generation failed");
}

async function askWithAnthropic(question, context, apiKey) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `You are a medical education tutor. Answer the question below based on the provided context. Be concise, accurate, and clinically relevant.\n\nContext:\n${context.slice(0, 2000)}\n\nQuestion: ${question}`,
      }],
    }),
  });
  if (!resp.ok) throw new Error(`Anthropic error: ${resp.status}`);
  const data = await resp.json();
  return data.content?.[0]?.text || "No answer returned.";
}

async function askWithGroq(question, context, apiKey) {
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey.trim()}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: `You are a USMLE medical tutor. Answer concisely and clinically.\n\nContext: ${context.slice(0, 1500)}\n\nQuestion: ${question}`,
      }],
    }),
  });
  if (!resp.ok) throw new Error(`Groq error: ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "No answer returned.";
}

async function askWithOpenAI(question, context, apiKey) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey.trim()}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `You are a medical education tutor. Answer the question below based on the provided context. Be concise, accurate, and clinically relevant.\n\nContext:\n${context.slice(0, 2000)}\n\nQuestion: ${question}`,
      }],
    }),
  });
  if (resp.status === 401) throw new Error("OpenAI API error: 401");
  if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "No answer returned.";
}

async function fetchLifelineAPI(apiUrl, authToken, userId, text, sourceType) {
  const resp = await fetch(`${apiUrl}/api/cards/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ text, source_type: sourceType, user_id: userId }),
  });
  if (!resp.ok) throw new Error(`Lifeline API error: ${resp.status}`);
  return resp.json();
}

// ─── Keyboard shortcut → open sidebar ────────────────────────────────────────
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-sidebar") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "OPEN_SIDEBAR_DEFAULT" }, () => {
          // If content script not loaded yet, inject it first
          if (chrome.runtime.lastError) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ["content.js"],
            }, () => {
              setTimeout(() => {
                chrome.tabs.sendMessage(tabs[0].id, { type: "OPEN_SIDEBAR_DEFAULT" });
              }, 300);
            });
          }
        });
      }
    });
  }
});

// ─── Badge helpers ────────────────────────────────────────────────────────────

function updateBadge(count) {
  const text = count > 99 ? "99+" : count > 0 ? String(count) : "";
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
}

// Clear badge when popup opens
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
});

// ─── Alarm: daily reminder ────────────────────────────────────────────────────

chrome.alarms.create("daily-drill-reminder", {
  periodInMinutes: 1440, // 24 hours
});

chrome.alarms.onAlarm.addListener(({ name }) => {
  if (name === "daily-drill-reminder") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Lifeline Recall",
      message: "Your daily drill is ready. Review your cards and stay on streak! 🔥",
    });
  }
});
