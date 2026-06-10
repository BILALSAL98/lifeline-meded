/**
 * Lifeline Recall — Extension Popup
 * Handles login, quick capture, stats display, and navigation.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const settings = await getSettings();
  const loggedIn = !!(settings.userId && settings.authToken);

  renderUI(loggedIn, settings);
  setupEventListeners(loggedIn, settings);
  setupApiKeyUI();
});

async function setupApiKeyUI() {
  const stored = await new Promise(r =>
    chrome.storage.local.get(["anthropicApiKey", "openaiApiKey"], r)
  );

  // ── Groq key (FREE — recommended) ────────────────────────────────────────
  const groqInput  = document.getElementById("groq-key-input");
  const groqSave   = document.getElementById("save-groq-btn");
  const groqTest   = document.getElementById("test-groq-btn");
  const groqStatus = document.getElementById("groq-key-status");

  if (groqInput && stored.groqApiKey) {
    groqInput.value = stored.groqApiKey;
    if (groqStatus) { groqStatus.style.display = "block"; groqStatus.textContent = "✓ Groq key saved — free AI active"; }
  }
  if (groqSave) {
    groqSave.addEventListener("click", async () => {
      const key = (groqInput?.value || "").trim();
      if (!key) { chrome.storage.local.remove("groqApiKey"); groqStatus.style.display = "none"; showToast("Groq key removed."); return; }
      await new Promise(r => chrome.storage.local.set({ groqApiKey: key }, r));
      groqStatus.style.display = "block"; groqStatus.textContent = "✓ Groq key saved — free AI active";
      groqStatus.style.color = "#78c840";
      showToast("✓ Groq key saved — free AI generation active!");
    });
  }
  if (groqTest) {
    groqTest.addEventListener("click", async () => {
      const key = (groqInput?.value || "").trim();
      if (!key) { showToast("Paste your Groq key first (starts with gsk_)"); return; }
      groqTest.textContent = "…"; groqTest.disabled = true;
      groqStatus.style.display = "block";
      groqStatus.textContent = "Testing connection to Groq…";
      groqStatus.style.color = "rgba(255,255,255,0.4)";

      chrome.runtime.sendMessage({ type: "TEST_API_KEY", payload: { provider: "groq", key } }, (res) => {
        groqTest.textContent = "Test"; groqTest.disabled = false;

        if (chrome.runtime.lastError) {
          groqStatus.textContent = "✗ Extension error — refresh the extension at chrome://extensions and try again";
          groqStatus.style.color = "#f87171";
          return;
        }
        if (res?.ok) {
          groqStatus.textContent = res.message;
          groqStatus.style.color = "#78c840";
          // Auto-save key and best model on successful test
          chrome.storage.local.set({ groqApiKey: key, groqPreferredModel: res.model || "llama-3.1-8b-instant" });
          showToast("✓ Groq key verified and saved!");
        } else {
          const errMsg = res?.error || "Connection failed — try refreshing the extension first";
          groqStatus.textContent = "✗ " + errMsg;
          groqStatus.style.color = "#f87171";
        }
      });
    });
  }

  // ── OpenAI key ────────────────────────────────────────────────────────────
  const topInput   = document.getElementById("openai-key-input");
  const topBtn     = document.getElementById("save-openai-key-btn");
  const topTest    = document.getElementById("test-openai-btn");
  const topStatus  = document.getElementById("openai-key-status");

  if (topInput && stored.openaiApiKey) {
    topInput.value = stored.openaiApiKey;
    if (topStatus) { topStatus.style.display = "block"; topStatus.textContent = "✓ OpenAI key saved"; }
  }
  if (topBtn) {
    topBtn.addEventListener("click", async () => {
      const key = (topInput?.value || "").trim();
      if (!key) { chrome.storage.local.remove("openaiApiKey"); topStatus.style.display = "none"; showToast("OpenAI key removed."); return; }
      await new Promise(r => chrome.storage.local.set({ openaiApiKey: key }, r));
      topStatus.style.display = "block"; topStatus.textContent = "✓ OpenAI key saved"; topStatus.style.color = "#78c840";
      showToast("✓ OpenAI key saved!");
    });
  }
  if (topTest) {
    topTest.addEventListener("click", async () => {
      const key = (topInput?.value || "").trim();
      if (!key) { showToast("Paste your OpenAI key first"); return; }
      topTest.textContent = "…"; topTest.disabled = true;
      topStatus.style.display = "block"; topStatus.textContent = "Testing…"; topStatus.style.color = "rgba(255,255,255,0.4)";
      chrome.runtime.sendMessage({ type: "TEST_API_KEY", payload: { provider: "openai", key } }, (res) => {
        topTest.textContent = "Test"; topTest.disabled = false;
        if (chrome.runtime.lastError) {
          topStatus.textContent = "✗ Extension error — refresh the extension and try again";
          topStatus.style.color = "#f87171"; return;
        }
        if (res?.ok) {
          topStatus.textContent = res.message; topStatus.style.color = "#78c840";
          chrome.storage.local.set({ openaiApiKey: key });
          showToast("✓ Key verified and saved!");
        } else {
          topStatus.textContent = "✗ " + (res?.error || "Test failed"); topStatus.style.color = "#f87171";
        }
      });
    });
  }

  // Anthropic key
  const anthropicInput  = document.getElementById("anthropic-key-input");
  const anthropicBtn    = document.getElementById("save-api-key-btn");
  const anthropicStatus = document.getElementById("api-key-status");
  if (anthropicInput && stored.anthropicApiKey) {
    anthropicInput.value = stored.anthropicApiKey;
    if (anthropicStatus) anthropicStatus.style.display = "block";
  }
  if (anthropicBtn) {
    anthropicBtn.addEventListener("click", async () => {
      const key = (anthropicInput?.value || "").trim();
      if (!key) {
        chrome.storage.local.remove("anthropicApiKey");
        if (anthropicStatus) anthropicStatus.style.display = "none";
        showToast("Anthropic key removed.");
        return;
      }
      await new Promise(r => chrome.storage.local.set({ anthropicApiKey: key }, r));
      if (anthropicStatus) anthropicStatus.style.display = "block";
      showToast("✓ Anthropic key saved — Claude generation active!");
    });
  }

  // OpenAI key
  const openaiInput  = document.getElementById("openai-key-input");
  const openaiBtn    = document.getElementById("save-openai-key-btn");
  const openaiStatus = document.getElementById("openai-key-status");
  if (openaiInput && stored.openaiApiKey) {
    openaiInput.value = stored.openaiApiKey;
    if (openaiStatus) openaiStatus.style.display = "block";
  }
  if (openaiBtn) {
    openaiBtn.addEventListener("click", async () => {
      const key = (openaiInput?.value || "").trim();
      if (!key) {
        chrome.storage.local.remove("openaiApiKey");
        if (openaiStatus) openaiStatus.style.display = "none";
        showToast("OpenAI key removed.");
        return;
      }
      await new Promise(r => chrome.storage.local.set({ openaiApiKey: key }, r));
      if (openaiStatus) openaiStatus.style.display = "block";
      showToast("✓ OpenAI key saved — GPT-4o generation active!");
    });
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderUI(loggedIn, settings) {
  const notConnected = document.getElementById("not-connected");
  const connected = document.getElementById("connected");
  const dot = document.getElementById("status-dot");
  const disconnectBtn = document.getElementById("disconnect-btn");

  if (loggedIn) {
    notConnected.style.display = "none";
    connected.style.display = "block";
    dot.classList.add("connected");
    disconnectBtn.style.display = "block";
    renderStats(settings);
    renderRecentCards(settings.recentCards || []);
  } else {
    notConnected.style.display = "block";
    connected.style.display = "none";
    dot.classList.add("disconnected");

    const apiInput = document.getElementById("api-url-input");
    if (apiInput) apiInput.value = settings.apiUrl || "http://localhost:3000";
  }
}

function renderStats(settings) {
  document.getElementById("stat-total").textContent = settings.totalCardsSaved || 0;
  document.getElementById("stat-sessions").textContent = settings.sessionCount || 0;

  // Today's cards from local storage (stored as date-keyed)
  const today = new Date().toDateString();
  const todayKey = `cards_${today}`;
  chrome.storage.local.get([todayKey], (res) => {
    document.getElementById("stat-today").textContent = res[todayKey] || 0;
  });
}

function renderRecentCards(recent) {
  if (!recent || !recent.length) return;
  const section = document.getElementById("recent-section");
  const list = document.getElementById("recent-cards");
  section.style.display = "block";

  list.innerHTML = recent.slice(0, 4).map((card) => `
    <div class="recent-card">
      <div class="recent-card-dot"></div>
      <div class="recent-card-text">${escapeHtml(card.front || card.clozeText || "Card")}</div>
    </div>
  `).join("");
}

// ─── Event listeners ──────────────────────────────────────────────────────────

function setupEventListeners(loggedIn, settings) {
  // Connect account
  const connectBtn = document.getElementById("connect-btn");
  if (connectBtn) {
    connectBtn.addEventListener("click", handleConnect);
  }

  // Open settings link
  const settingsLink = document.getElementById("open-settings-link");
  if (settingsLink) {
    settingsLink.addEventListener("click", (e) => {
      e.preventDefault();
      const url = (document.getElementById("api-url-input")?.value || "http://localhost:3000") + "/dashboard/settings";
      chrome.tabs.create({ url });
    });
  }

  // Quick generate
  const genBtn = document.getElementById("quick-generate-btn");
  if (genBtn) genBtn.addEventListener("click", handleQuickGenerate);

  // Quick textarea — Enter + Shift for newline, Enter alone to generate
  const textarea = document.getElementById("quick-text");
  if (textarea) {
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleQuickGenerate();
      }
    });
  }

  // Save all
  const saveAllBtn = document.getElementById("quick-save-all");
  if (saveAllBtn) saveAllBtn.addEventListener("click", handleSaveAll);

  // Anki export
  const ankiBtn = document.getElementById("quick-anki-export");
  if (ankiBtn) ankiBtn.addEventListener("click", handleAnkiExport);

  // Open Lifeline
  // Anki Card Creator — opens the full-page creator
  const openCreator = () => chrome.tabs.create({ url: chrome.runtime.getURL("cards.html") });
  document.getElementById("open-card-creator-btn")?.addEventListener("click", openCreator);
  document.getElementById("open-card-creator-btn-2")?.addEventListener("click", openCreator);

  // Round Room — opens the AI voice consultation page
  const openRoundRoom = () => chrome.tabs.create({ url: chrome.runtime.getURL("roundroom.html") });
  document.getElementById("open-roundroom-btn")?.addEventListener("click", openRoundRoom);
  document.getElementById("open-roundroom-btn-2")?.addEventListener("click", openRoundRoom);

  document.getElementById("open-lifeline-btn")?.addEventListener("click", () => {
    chrome.tabs.create({ url: settings.apiUrl || "http://localhost:3000/dashboard" });
  });

  document.getElementById("open-recall-btn")?.addEventListener("click", () => {
    chrome.tabs.create({ url: (settings.apiUrl || "http://localhost:3000") + "/recall" });
  });

  // Disconnect
  document.getElementById("disconnect-btn")?.addEventListener("click", handleDisconnect);

  // Help
  document.getElementById("help-btn")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://lifeline-meded.com/help/extension" });
  });
}

// ─── Connect ──────────────────────────────────────────────────────────────────

async function handleConnect() {
  const apiUrl = document.getElementById("api-url-input")?.value?.trim();
  const token = document.getElementById("token-input")?.value?.trim();
  const btn = document.getElementById("connect-btn");

  if (!apiUrl || !token) {
    showToast("Please fill in both fields.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Connecting...";

  try {
    // Verify token by calling /api/auth/me
    const res = await fetch(`${apiUrl}/api/auth/me/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let userId = "demo-user";
    if (res.ok) {
      const data = await res.json();
      userId = data.id || data.user_id || "demo-user";
    }

    await saveSettings({ apiUrl, authToken: token, userId });
    showToast("✓ Connected to Lifeline!");
    setTimeout(() => window.location.reload(), 800);
  } catch {
    // Allow connection even if API isn't running (for local dev)
    await saveSettings({ apiUrl, authToken: token, userId: "local-user" });
    showToast("✓ Connected (local mode)");
    setTimeout(() => window.location.reload(), 800);
  } finally {
    btn.disabled = false;
    btn.textContent = "Connect Account";
  }
}

async function handleDisconnect() {
  if (!confirm("Disconnect from Lifeline? Your saved cards won't be deleted.")) return;
  await saveSettings({ userId: null, authToken: null });
  window.location.reload();
}

// ─── Quick Generate ───────────────────────────────────────────────────────────

let quickGeneratedCards = [];

async function handleQuickGenerate() {
  const text = document.getElementById("quick-text")?.value?.trim();
  const sourceType = document.getElementById("quick-source")?.value || "other";
  const btn = document.getElementById("quick-generate-btn");
  const resultEl = document.getElementById("quick-result");
  const labelEl = document.getElementById("quick-result-label");
  const listEl = document.getElementById("quick-cards-list");
  const saveAllBtn = document.getElementById("quick-save-all");

  if (!text || text.length < 20) {
    showToast("Please paste some text first (at least 20 characters).");
    return;
  }

  showLoading("Generating with AI...");
  btn.disabled = true;

  try {
    const settings = await getSettings();
    let result;

    if (settings.userId && settings.authToken) {
      try {
        const res = await new Promise((resolve) => {
          chrome.runtime.sendMessage({
            type: "GENERATE_CARDS_IN_BACKGROUND",
            payload: {
              text,
              sourceType,
              apiUrl: settings.apiUrl || "http://localhost:3000",
              authToken: settings.authToken,
              userId: settings.userId,
            },
          }, resolve);
        });
        result = res.ok ? res.data : localGenerate(text, sourceType);
      } catch {
        result = localGenerate(text, sourceType);
      }
    } else {
      result = localGenerate(text, sourceType);
    }

    quickGeneratedCards = result.cards || [];
    hideLoading();

    if (!quickGeneratedCards.length) {
      showToast("No cards generated. Try more specific medical text.");
      return;
    }

    resultEl.style.display = "block";
    labelEl.textContent = `${quickGeneratedCards.length} cards generated`;
    // Show Anki export always; show Save All only if connected
    const ankiExportBtn = document.getElementById("quick-anki-export");
    if (ankiExportBtn) ankiExportBtn.style.display = "block";
    saveAllBtn.style.display = "block";
    saveAllBtn.textContent = `💾 Save All ${quickGeneratedCards.length} Cards to Lifeline`;

    listEl.innerHTML = quickGeneratedCards.map((card, i) => {
      const typeLabels = { basic: "Basic", cloze: "Cloze", vignette: "Vignette", comparison: "Compare" };
      const displayFront = card.card_type === "cloze"
        ? (card.cloze_text || card.front).replace(/\{\{c\d+::(.*?)\}\}/g, "[$1]")
        : card.front;
      return `
        <div class="quick-card">
          <div class="quick-card-type ${card.card_type}">${typeLabels[card.card_type] || "Basic"}</div>
          <div class="quick-card-q">${escapeHtml(displayFront)}</div>
          ${card.back ? `<div class="quick-card-a">${escapeHtml(card.back.slice(0, 120))}${card.back.length > 120 ? "..." : ""}</div>` : ""}
        </div>
      `;
    }).join("");

    // Increment today counter
    const today = new Date().toDateString();
    chrome.storage.local.get([`cards_${today}`], (res) => {
      chrome.storage.local.set({ [`cards_${today}`]: (res[`cards_${today}`] || 0) + quickGeneratedCards.length });
    });

  } catch (err) {
    hideLoading();
    showToast("Error: " + err.message);
  } finally {
    btn.disabled = false;
  }
}

function handleAnkiExport() {
  if (!quickGeneratedCards.length) return;
  const header = "#separator:tab\n#html:false\n#tags column:3\n";
  const rows = quickGeneratedCards.map(card => {
    let front = (card.card_type === "cloze" ? (card.cloze_text || card.front) : card.front) || "";
    let back  = card.back || "";
    if (card.card_type === "vignette") {
      front = [(card.stem || card.front || ""), (card.question || "")].filter(Boolean).join(" — ");
      back  = (card.answer_points || [card.back]).filter(Boolean).join(" | ");
    }
    if (card.explanation) back += (back ? " | 💡 " : "💡 ") + card.explanation;
    const tags = (card.tags || []).join(" ");
    return `${front.replace(/\t|\n/g," ")}\t${back.replace(/\t|\n/g," ")}\t${tags}`;
  }).join("\n");

  const blob = new Blob([header + rows], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `lifeline-recall-${new Date().toISOString().slice(0,10)}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  showToast("📦 Anki file downloaded! Import via File → Import in Anki.");
}

async function handleSaveAll() {
  if (!quickGeneratedCards.length) return;
  const settings = await getSettings();

  if (!settings.userId || !settings.authToken) {
    showToast("Connect your Lifeline account to save cards.");
    return;
  }

  const btn = document.getElementById("quick-save-all");
  btn.disabled = true;
  btn.textContent = "Saving...";

  let saved = 0;
  for (const card of quickGeneratedCards) {
    try {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: "SAVE_CARD_IN_BACKGROUND",
          payload: {
            card,
            apiUrl: settings.apiUrl,
            authToken: settings.authToken,
            userId: settings.userId,
          },
        }, (res) => {
          if (res?.ok) saved++;
          resolve();
        });
      });
    } catch { /* continue */ }
  }

  // Update stats
  const newTotal = (settings.totalCardsSaved || 0) + saved;
  const newSessions = (settings.sessionCount || 0) + 1;
  const newRecent = [...quickGeneratedCards.slice(0, 3), ...(settings.recentCards || [])].slice(0, 10);
  await saveSettings({ totalCardsSaved: newTotal, sessionCount: newSessions, recentCards: newRecent });

  chrome.runtime.sendMessage({ type: "CARDS_SAVED", payload: { count: saved } });

  btn.textContent = `✓ ${saved} cards saved!`;
  document.getElementById("stat-total").textContent = newTotal;
  showToast(`✓ ${saved} cards saved to Lifeline!`);
}

// ─── Storage ──────────────────────────────────────────────────────────────────

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get({
      apiUrl: "http://localhost:3000",
      userId: null,
      authToken: null,
      recentCards: [],
      sessionCount: 0,
      totalCardsSaved: 0,
    }, resolve);
  });
}

function saveSettings(updates) {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (current) => {
      chrome.storage.local.set({ ...current, ...updates }, resolve);
    });
  });
}

// ─── Local card generator ─────────────────────────────────────────────────────

function localGenerate(text, sourceType) {
  const system = detectSystem(text);
  const topic  = detectTopic(text, system);
  const deck   = `Step 1::${system}::${topic}`;
  const tags   = [system.toLowerCase(), sourceType];

  const facts = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 400)
    .slice(0, 6);

  const cards = [];

  // Card 1 — targeted question based on content
  if (facts[0]) {
    const front = /strongest|most common|most frequent/i.test(facts[0])
      ? `What is the most common risk factor / strongest association for ${topic}?`
      : /mechanism|pathophys|causes|leads to|due to/i.test(facts[0])
      ? `What is the mechanism/pathophysiology of ${topic}?`
      : /treat|manage|drug|medication|therap/i.test(facts[0])
      ? `What is the first-line treatment for ${topic}?`
      : `What is the key clinical significance of ${topic}?`;

    cards.push({
      card_type: "basic", front, back: facts[0],
      explanation: `High-yield ${system} concept — know this for Step 1 & 2.`,
      tags, deck, topic, system, difficulty: 3, board_relevance: "step1",
      source_type: sourceType, source_text: text.slice(0, 200),
    });
  }

  // Card 2 — Cloze with meaningful blank (percentage, number, or medical term)
  const clozeSource = facts[1] || facts[0];
  if (clozeSource) {
    const clozeText = makeCloze(clozeSource);
    if (clozeText !== clozeSource) {
      cards.push({
        card_type: "cloze", front: clozeText, back: "", cloze_text: clozeText,
        explanation: "Key fact — fill in the blank.",
        tags: [...tags, "cloze"], deck, topic, system, difficulty: 2, board_relevance: "step1",
        source_type: sourceType, source_text: text.slice(0, 200),
      });
    }
  }

  // Card 3 — Mechanism if not already covered
  const mechFact = facts.find((f) => /mechanism|pathophys|causes|leads to|results in/i.test(f));
  if (mechFact && mechFact !== facts[0]) {
    cards.push({
      card_type: "basic",
      front: `Explain the mechanism: ${topic}`,
      back: mechFact,
      explanation: "Mechanism questions are highest-yield for Step 1.",
      tags: [...tags, "mechanism"], deck, topic, system, difficulty: 4, board_relevance: "both",
      source_type: sourceType, source_text: text.slice(0, 200),
    });
  }

  return { cards, topic, system };
}

function makeCloze(sentence) {
  const numMatch = sentence.match(/>\d+%|\d+%|≥\d+%|<\d+%|\d+\s*(?:mmHg|mg|g|L|mL)/);
  if (numMatch) return sentence.replace(numMatch[0], `{{c1::${numMatch[0]}}}`);

  const MEDICAL = ["hypertension","dissection","aortic","cocaine","precipitant","stenosis",
    "infarction","ischemia","embolism","thrombosis","fibrillation","edema","hemorrhage",
    "anemia","sepsis","pneumonia","cirrhosis","nephrotic","proteinuria","hematuria",
    "creatinine","albumin","troponin","aldosterone","cortisol","insulin","warfarin","heparin"];

  const words = sentence.split(" ");
  for (let i = 0; i < words.length; i++) {
    const clean = words[i].replace(/[^a-zA-Z-]/g,"").toLowerCase();
    if (MEDICAL.some((t) => clean.includes(t) || t.includes(clean)) && clean.length > 5) {
      const b = [...words]; b[i] = `{{c1::${words[i]}}}`; return b.join(" ");
    }
  }

  const STOP = new Set(["the","a","an","is","are","was","were","of","in","on","at","to","for","by","with","and","or","but","that","this","it","be","been","have","has","had","very","also","such","some","any","all","from","than","then","when","where","which","who","how","what","especially","sometimes","noted","particularly"]);
  const candidates = words.filter((w) => w.replace(/[^a-zA-Z]/g,"").length > 6 && !STOP.has(w.toLowerCase()));
  if (candidates.length) {
    const target = candidates[Math.floor(candidates.length * 0.4)];
    return sentence.replace(target, `{{c1::${target}}}`);
  }
  return sentence;
}

function detectTopic(text, system) {
  const syndromeMatch = text.match(/[A-Z][a-z]+(?: [A-Z][a-z]+)* (?:Disease|Syndrome|Disorder|Failure|Dissection|Infarction|Nephropathy|Stenosis|Embolism)/);
  if (syndromeMatch) return syndromeMatch[0];
  const conditionMatch = text.match(/(?:acute |chronic )?[A-Z][a-z]+(?: [A-Z][a-z]+)*(?= (?:is|are|was|presents|causes|occurs|results))/);
  if (conditionMatch && conditionMatch[0].length > 4) return conditionMatch[0];
  const first = text.split(/[.,]/)[0].trim();
  if (first.length < 60) { const noun = first.match(/[A-Z][a-z]+(?: [a-z]+){0,3}/); if (noun) return noun[0]; }
  return system + " Pathology";
}

function detectSystem(text) {
  const lower = text.toLowerCase();
  const map = {
    Cardiology: ["heart","cardiac","myocardial","atrial","ecg"],
    Renal: ["kidney","renal","nephrotic","glomerular","creatinine"],
    Pulmonology: ["lung","pulmonary","asthma","copd","respiratory"],
    Neurology: ["brain","stroke","neural","seizure","cranial"],
    Gastroenterology: ["liver","hepatic","bowel","gastric","cirrhosis"],
    Endocrine: ["thyroid","diabetes","insulin","cortisol","glucose"],
    Hematology: ["blood","anemia","hemoglobin","platelet","coagulation"],
    Pharmacology: ["drug","dose","receptor","inhibitor","mechanism of action"],
  };
  for (const [sys, kw] of Object.entries(map)) {
    if (kw.some((k) => lower.includes(k))) return sys;
  }
  return "General";
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function showLoading(msg = "Loading...") {
  document.getElementById("loading-text").textContent = msg;
  document.getElementById("loading-overlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loading-overlay").style.display = "none";
}

function showToast(msg) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function escapeHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
