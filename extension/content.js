/**
 * Lifeline Recall — Content Script v3.0
 * Clean, simple UI. Edit uses wrap.querySelector (not shadow.getElementById).
 */

(function () {
  "use strict";

  if (window.__lifelineRecallLoaded) return;
  window.__lifelineRecallLoaded = true;

  let selectedText      = "";
  let sidebarOpen       = false;
  let generatedCards    = [];
  let isGenerating      = false;
  let currentSourceType = detectPageSourceType();
  let sidebarCards      = [];          // manually created cards
  let creatorCardType   = "basic";
  let creatorTags       = [];
  let lastFocusedField  = "front";     // "front" | "back"
  let liveCardGroups    = [];          // { id, topic, cards[], videoTitle, dismissed }[]

  // Load saved manual cards
  try {
    const saved = localStorage.getItem("ll_sidebar_cards");
    if (saved) sidebarCards = JSON.parse(saved);
  } catch {}

  // ── Shadow DOM ────────────────────────────────────────────────────────────────
  const host = document.createElement("div");
  host.id = "__lifeline-recall-root__";
  host.style.cssText = "position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;pointer-events:none;";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  // ── Styles ────────────────────────────────────────────────────────────────────
  // Brand palette: pure black, rainbow spectrum, green #78c840 CTA
  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    #ll-btn {
      position: fixed; display: none; align-items: center; gap: 8px;
      padding: 9px 16px; background: #0d1b2a; border: 1.5px solid #78c840; border-radius: 20px;
      cursor: pointer; font-family: -apple-system, 'Segoe UI', sans-serif;
      font-size: 13px; font-weight: 600; color: #78c840; pointer-events: all !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5); transition: transform 0.12s;
      z-index: 2147483647; user-select: none;
    }
    #ll-btn:hover { transform: translateY(-1px); }
    .ll-btn-dot { width: 8px; height: 8px; border-radius: 50%; background: #78c840; flex-shrink: 0; }
    #ll-sidebar {
      position: fixed; top: 0; right: 0; width: 400px; height: 100vh;
      background: #0d1b2a; border-left: 1px solid rgba(255,255,255,0.06);
      display: flex; flex-direction: column; pointer-events: all !important;
      transform: translateX(100%); transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
      box-shadow: -8px 0 48px rgba(0,0,0,0.7); font-family: -apple-system, 'Segoe UI', sans-serif;
      z-index: 2147483647;
    }
    #ll-sidebar.open { transform: translateX(0); }
    .ll-hdr {
      padding: 22px 20px 18px; flex-shrink: 0; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #0d1b2a 35%, #1a0f3a 65%, #2d0a18 100%);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .ll-hdr::after {
      content:''; position:absolute; top:-30px; right:-30px; width:140px; height:140px;
      border-radius:50%;
      background: radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(120,200,64,0.08) 50%, transparent 70%);
      pointer-events:none;
    }
    .ll-hdr-title-row {
      display: flex; align-items: center; gap: 10px;
    }
    .ll-logo {
      width: 36px; height: 50px; object-fit: contain; flex-shrink: 0; filter: drop-shadow(0 0 6px rgba(120,200,64,0.4));
    }
    .ll-hdr-title {
      font-size: 22px; font-weight: 900; color: #fff; letter-spacing: 0.04em;
      text-transform: uppercase; line-height: 1.1; margin-bottom: 5px;
    }
    .ll-hdr-sub { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.03em; }
    .ll-close {
      position: absolute; top: 16px; right: 16px; width: 28px; height: 28px;
      border: none; background: rgba(255,255,255,0.08); border-radius: 7px;
      cursor: pointer; color: rgba(255,255,255,0.5); font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; pointer-events: all !important; font-family: inherit;
    }
    .ll-close:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .ll-rainbow {
      height: 3px; flex-shrink: 0;
      background: linear-gradient(90deg, #9b5fe0 0%, #4f8ef7 12%, #00c9b1 24%, #4caf50 36%, #a8e063 48%, #ffc107 60%, #ff9800 72%, #f44336 84%, #e91e63 100%);
    }
    .ll-body {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 11px; background: #0d1b2a;
    }
    .ll-body::-webkit-scrollbar { width: 4px; }
    .ll-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
    .ll-card { background: #152035; border-radius: 12px; border: 1px solid rgba(255,255,255,0.07); padding: 13px; }
    .ll-card.teal-border { border-left: 3px solid #00c896; }
    .ll-card.amber-border { border-left: 3px solid #e8a020; }
    .ll-sec-lbl { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.13em; margin-bottom: 9px; display: block; }
    .ll-sec-amber { color: #e8a020; }
    .ll-sec-teal  { color: #00c896; }
    .ll-sec-yellow{ color: #f5c518; }
    .ll-sec-white { color: rgba(255,255,255,0.35); }
    .ll-source-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 3px; }
    .ll-source-sub { font-size: 11px; color: rgba(255,255,255,0.38); }
    .ll-check-row { display: flex; align-items: center; gap: 8px; padding: 3px 0; }
    .ll-check-icon { color: #00c896; font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .ll-check-text { font-size: 13px; color: rgba(255,255,255,0.8); }
    .ll-stars { font-size: 14px; color: #fbbf24; letter-spacing: 1px; margin-right: 6px; }
    .ll-relevance-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 5px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
    .ll-relevance-desc { font-size: 12px; color: rgba(255,255,255,0.42); line-height: 1.55; }
    .ll-preview-q { font-size: 15px; font-weight: 700; color: #fff; line-height: 1.5; margin-bottom: 10px; }
    .ll-preview-a { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.55; margin-bottom: 10px; }
    .ll-preview-reveal {
      padding: 8px 14px; border-radius: 8px; background: rgba(0,200,150,0.1);
      border: 1px solid rgba(0,200,150,0.2); color: #00c896; font-size: 12px; font-weight: 600;
      cursor: pointer; font-family: inherit; transition: all 0.15s; pointer-events: all !important;
    }
    .ll-preview-reveal:hover { background: rgba(0,200,150,0.2); }
    .ll-challenge-attending { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 7px; }
    .ll-challenge-q { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.6; margin-bottom: 12px; }
    .ll-challenge-row { display: flex; gap: 8px; align-items: center; }
    .ll-challenge-input {
      flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 9px; padding: 10px 12px; font-size: 13px; color: rgba(255,255,255,0.85);
      outline: none; font-family: inherit; transition: border-color 0.2s;
    }
    .ll-challenge-input:focus { border-color: rgba(120,200,64,0.45); }
    .ll-challenge-submit {
      padding: 10px 18px; border-radius: 9px; border: none; background: #78c840;
      color: #0d1b2a; font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: background 0.15s; pointer-events: all !important; white-space: nowrap;
    }
    .ll-challenge-submit:hover { background: #8fd84a; }
    .ll-challenge-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .ll-challenge-response {
      margin-top: 10px; padding: 10px 12px; border-radius: 9px;
      background: rgba(120,200,64,0.07); border: 1px solid rgba(120,200,64,0.18);
      font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.6; display: none;
    }
    .ll-textarea {
      width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 11px 13px; font-size: 13px; color: rgba(255,255,255,0.85);
      line-height: 1.6; resize: vertical; min-height: 70px; max-height: 130px;
      outline: none; font-family: inherit; transition: border-color 0.2s;
    }
    .ll-textarea:focus { border-color: rgba(120,200,64,0.45); }
    .ll-lbl { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); display: block; margin-bottom: 6px; }
    .ll-gen {
      width: 100%; padding: 13px; border-radius: 10px; border: none;
      background: #78c840; color: #0d1b2a; font-size: 14px; font-weight: 700;
      cursor: pointer; transition: background 0.15s; pointer-events: all !important; font-family: inherit;
    }
    .ll-gen:hover:not(:disabled) { background: #8fd84a; }
    .ll-gen:disabled { opacity: 0.45; cursor: not-allowed; }
    .ll-spin {
      width: 14px; height: 14px; border: 2px solid rgba(13,27,42,0.3); border-top-color: #0d1b2a;
      border-radius: 50%; animation: _spin 0.7s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;
    }
    @keyframes _spin { to { transform: rotate(360deg); } }
    .ll-all-cards-toggle {
      width: 100%; padding: 10px 14px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.03);
      color: rgba(255,255,255,0.45); font-size: 12px; font-weight: 600; cursor: pointer;
      font-family: inherit; transition: all 0.15s; text-align: left;
      display: flex; align-items: center; justify-content: space-between; pointer-events: all !important;
    }
    .ll-all-cards-toggle:hover { background: rgba(255,255,255,0.07); color: #fff; }
    .ll-mini-card { background: #1a2840; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); padding: 12px 14px; transition: border-color 0.15s; }
    .ll-mini-card:hover { border-color: rgba(120,200,64,0.2); }
    .ll-mini-type { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.25); margin-bottom: 5px; }
    .ll-mini-q { font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; line-height: 1.5; margin-bottom: 4px; }
    .ll-mini-a { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.5; display: none; margin-bottom: 4px; }
    .ll-mini-a.vis { display: block; }
    .ll-mini-btns { display: flex; gap: 6px; margin-top: 8px; }
    .ll-mini-btn { padding: 4px 11px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.12s; pointer-events: all !important; }
    .ll-mini-btn:hover { color: #fff; background: rgba(255,255,255,0.09); }
    .ll-mini-btn.edit:hover { color: #78c840; border-color: rgba(120,200,64,0.25); }
    .ll-mini-btn.flip:hover { color: #00c896; border-color: rgba(0,200,150,0.25); }
    .ll-btn-row { display: flex; gap: 8px; }
    .ll-btn-green { flex: 1; padding: 11px; border-radius: 10px; border: 1.5px solid rgba(120,200,64,0.35); background: rgba(120,200,64,0.1); color: #78c840; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; pointer-events: all !important; }
    .ll-btn-green:hover { background: rgba(120,200,64,0.2); }
    .ll-btn-muted { flex: 1; padding: 11px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; pointer-events: all !important; }
    .ll-btn-muted:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .ll-ask { border-top: 1px solid rgba(255,255,255,0.06); padding: 14px 16px; flex-shrink: 0; display: none; background: #0d1b2a; }
    .ll-ask-lbl { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); margin-bottom: 8px; display: block; text-transform: uppercase; letter-spacing: 0.08em; }
    .ll-ask-row { display: flex; gap: 8px; align-items: flex-end; }
    .ll-ask-ta { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 9px; padding: 8px 11px; font-size: 12px; color: rgba(255,255,255,0.85); outline: none; font-family: inherit; resize: none; line-height: 1.45; transition: border-color 0.2s; }
    .ll-ask-ta:focus { border-color: rgba(120,200,64,0.4); }
    .ll-ask-go { padding: 8px 14px; border-radius: 9px; border: none; background: #78c840; color: #0d1b2a; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.15s; pointer-events: all !important; white-space: nowrap; }
    .ll-ask-go:hover { background: #8fd84a; }
    .ll-ask-go:disabled { opacity: 0.45; cursor: not-allowed; }
    .ll-ask-ans { margin-top: 9px; padding: 10px 12px; background: rgba(120,200,64,0.05); border: 1px solid rgba(120,200,64,0.15); border-radius: 9px; font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.6; display: none; }
    .ll-ask-err { color: rgba(248,113,113,0.8); border-color: rgba(248,113,113,0.18); background: rgba(248,113,113,0.05); }
    .ll-ftr { padding: 10px 16px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: #0a1422; }
    .ll-ftr-link { font-size: 11px; color: rgba(255,255,255,0.18); cursor: pointer; background: none; border: none; font-family: inherit; transition: color 0.15s; pointer-events: all !important; }
    .ll-ftr-link:hover { color: rgba(120,200,64,0.7); }
    .ll-ftr-badge { font-size: 11px; color: rgba(120,200,64,0.5); font-weight: 600; }
    .ll-empty { text-align: center; padding: 40px 16px; color: rgba(255,255,255,0.28); font-size: 13px; line-height: 1.7; }
    .ll-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 32px 16px; gap: 10px; }
    .ll-success-icon { font-size: 40px; }
    .ll-success-title { font-size: 18px; font-weight: 700; color: #fff; }
    .ll-success-sub { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }
    .ll-open-btn { padding: 10px 22px; border-radius: 10px; background: #78c840; color: #0d1b2a; font-size: 13px; font-weight: 700; border: none; cursor: pointer; font-family: inherit; pointer-events: all !important; }
    .ll-open-btn:hover { background: #8fd84a; }
    .ll-new-btn { padding: 7px 14px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08); background: none; color: rgba(255,255,255,0.3); font-size: 12px; cursor: pointer; font-family: inherit; pointer-events: all !important; }
    .ll-new-btn:hover { color: #fff; }
    .ll-setup-card { background: #152035; border: 1px solid rgba(120,200,64,0.2); border-radius: 12px; padding: 16px; }
    .ll-setup-card h3 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .ll-setup-card p { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.65; margin-bottom: 8px; }
    .ll-setup-card a { color: #78c840; }
    .ll-edit-field { padding: 10px 0 0; }
    .ll-edit-lbl { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.09em; display: block; margin-bottom: 5px; }
    .ll-edit-ta { width: 100%; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(120,200,64,0.35); border-radius: 8px; padding: 8px 10px; font-size: 13px; color: rgba(255,255,255,0.88); line-height: 1.5; resize: vertical; outline: none; font-family: inherit; }
    .ll-edit-ta:focus { border-color: rgba(120,200,64,0.65); }
    .ll-edit-ta.muted { border-color: rgba(255,255,255,0.1); }
    .ll-edit-in { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 7px 10px; font-size: 12px; color: rgba(255,255,255,0.85); outline: none; font-family: inherit; }
    .ll-edit-gap { height: 10px; }

    /* ── Sidebar tabs ── */
    .ll-tabs {
      display: flex; border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0; background: #0a1422;
    }
    .ll-tab {
      flex: 1; padding: 11px 6px; font-size: 12px; font-weight: 700;
      color: rgba(255,255,255,0.35); cursor: pointer; border: none;
      background: transparent; font-family: inherit; transition: all 0.15s;
      border-bottom: 2px solid transparent; pointer-events: all !important;
    }
    .ll-tab.active { color: #78c840; border-bottom-color: #78c840; }
    .ll-tab:hover:not(.active) { color: rgba(255,255,255,0.7); }

    /* ── Card type selector ── */
    .ll-type-row { display: flex; gap: 6px; }
    .ll-type-btn {
      flex: 1; padding: 8px 4px; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700;
      cursor: pointer; font-family: inherit; transition: all 0.15s;
      text-align: center; pointer-events: all !important;
    }
    .ll-type-btn:hover { border-color: rgba(120,200,64,0.3); color: rgba(255,255,255,0.8); }
    .ll-type-btn.active { background: rgba(120,200,64,0.15); border-color: #78c840; color: #78c840; }

    /* ── Deck row ── */
    .ll-deck-row { display: flex; gap: 6px; }
    .ll-deck-input {
      flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 9px; padding: 9px 11px; font-size: 12px; color: rgba(255,255,255,0.85);
      outline: none; font-family: inherit; transition: border-color 0.2s;
    }
    .ll-deck-input:focus { border-color: rgba(120,200,64,0.45); }
    .ll-deck-select {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 9px; padding: 9px 6px; font-size: 11px; color: rgba(255,255,255,0.45);
      cursor: pointer; outline: none; font-family: inherit;
    }

    /* ── Rich text toolbar + editor ── */
    .ll-field-lbl {
      font-size: 9px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.12em; color: rgba(255,255,255,0.3); display: block; margin-bottom: 5px;
    }
    .ll-toolbar {
      display: flex; gap: 2px; padding: 5px 7px; background: #1a2840;
      border: 1px solid rgba(255,255,255,0.08); border-bottom: none;
      border-radius: 8px 8px 0 0; flex-wrap: wrap;
    }
    .ll-tb-btn {
      padding: 4px 8px; border-radius: 4px; border: none; background: transparent;
      color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700;
      cursor: pointer; transition: all 0.12s; font-family: inherit; line-height: 1.2;
      pointer-events: all !important;
    }
    .ll-tb-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .ll-tb-div { width: 1px; background: rgba(255,255,255,0.1); margin: 2px 3px; align-self: stretch; }
    .ll-tb-c1 { padding:3px 7px; border-radius:4px; border:none; cursor:pointer; font-size:10px; font-weight:700; font-family:inherit; background:rgba(96,165,250,0.15); color:#60a5fa; pointer-events:all !important; }
    .ll-tb-c2 { padding:3px 7px; border-radius:4px; border:none; cursor:pointer; font-size:10px; font-weight:700; font-family:inherit; background:rgba(251,191,36,0.15); color:#fbbf24; pointer-events:all !important; }
    .ll-tb-c3 { padding:3px 7px; border-radius:4px; border:none; cursor:pointer; font-size:10px; font-weight:700; font-family:inherit; background:rgba(248,113,113,0.15); color:#f87171; pointer-events:all !important; }
    .ll-tb-c1:hover { background:rgba(96,165,250,0.28); }
    .ll-tb-c2:hover { background:rgba(251,191,36,0.28); }
    .ll-tb-c3:hover { background:rgba(248,113,113,0.28); }

    .ll-rich-editor {
      min-height: 80px; max-height: 150px; overflow-y: auto;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 0 0 8px 8px; padding: 10px 12px;
      font-size: 13px; color: rgba(255,255,255,0.88);
      line-height: 1.65; outline: none; font-family: inherit;
    }
    .ll-rich-editor:focus { border-color: rgba(120,200,64,0.4); background: rgba(120,200,64,0.02); }
    .ll-rich-editor:empty::before { content: attr(data-ph); color: rgba(255,255,255,0.2); pointer-events: none; }
    .ll-rich-editor b, .ll-rich-editor strong { font-weight:700; }
    .ll-rich-editor i, .ll-rich-editor em { font-style:italic; }
    .ll-rich-editor u { text-decoration:underline; }
    .ll-rich-editor s { text-decoration:line-through; }
    .ll-rich-editor code { font-family:monospace; font-size:11px; background:rgba(255,255,255,0.08); padding:1px 4px; border-radius:3px; color:#78c840; }
    .ll-rich-editor ul, .ll-rich-editor ol { padding-left:18px; }
    .ll-rich-editor::-webkit-scrollbar { width:3px; }
    .ll-rich-editor::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
    .cloze-hl { border-radius:3px; padding:0 3px; font-weight:700; }
    .cloze-hl.c1 { background:rgba(96,165,250,0.2); color:#60a5fa; }
    .cloze-hl.c2 { background:rgba(251,191,36,0.2); color:#fbbf24; }
    .cloze-hl.c3 { background:rgba(248,113,113,0.2); color:#f87171; }

    /* ── Tags ── */
    .ll-tags-box {
      display: flex; flex-wrap: wrap; gap: 5px; align-items: center;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
      border-radius: 9px; padding: 7px 10px; min-height: 36px; cursor: text;
    }
    .ll-tags-box:focus-within { border-color: rgba(120,200,64,0.4); }
    .ll-tag-pill {
      display: flex; align-items: center; gap: 4px;
      background: rgba(120,200,64,0.12); border: 1px solid rgba(120,200,64,0.25);
      color: #78c840; border-radius: 5px; padding: 2px 8px;
      font-size: 11px; font-weight: 600;
    }
    .ll-tag-pill button { background:none; border:none; color:rgba(120,200,64,0.6); cursor:pointer; font-size:13px; line-height:1; padding:0; pointer-events:all !important; }
    .ll-tag-pill button:hover { color:#78c840; }
    .ll-tag-in { background:transparent; border:none; outline:none; color:rgba(255,255,255,0.8); font-size:12px; font-family:inherit; min-width:80px; flex:1; }
    .ll-tag-in::placeholder { color:rgba(255,255,255,0.2); }

    /* ── Created cards list ── */
    .ll-created-card {
      background: #1a2840; border-radius: 9px; border: 1px solid rgba(255,255,255,0.07);
      padding: 10px 12px; position: relative;
    }
    .ll-created-card-type { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:rgba(255,255,255,0.25); margin-bottom:4px; }
    .ll-created-card-front { font-size:12px; color:rgba(255,255,255,0.85); line-height:1.45; font-weight:500; padding-right:24px; }
    .ll-created-card-del { position:absolute; top:8px; right:8px; width:20px; height:20px; border:none; background:rgba(248,113,113,0.1); border-radius:4px; color:rgba(248,113,113,0.6); font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-family:inherit; pointer-events:all !important; }
    .ll-created-card-del:hover { background:rgba(248,113,113,0.2); color:#f87171; }
    .ll-export-created { width:100%; padding:11px; border-radius:10px; border:1.5px solid rgba(120,200,64,0.35); background:rgba(120,200,64,0.1); color:#78c840; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; pointer-events:all !important; }
    .ll-export-created:hover { background:rgba(120,200,64,0.2); }

    /* ── Live Feed ── */
    @keyframes ll-slidein { from { opacity:0; transform:translateY(-14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes ll-slideout { from { opacity:1; transform:translateY(0); max-height:300px; } to { opacity:0; transform:translateY(-8px); max-height:0; padding:0; margin:0; } }
    .ll-live-group {
      background: #152035; border-radius: 12px; border: 1px solid rgba(120,200,64,0.2);
      border-left: 3px solid #78c840; padding: 13px;
      animation: ll-slidein 0.35s cubic-bezier(0.2,0,0,1);
    }
    .ll-live-group.past {
      border-left-color: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.05);
      background: rgba(255,255,255,0.02); opacity: 0.55;
    }
    .ll-live-badge {
      display:inline-flex; align-items:center; gap:5px; padding:3px 9px;
      background:rgba(120,200,64,0.12); border:1px solid rgba(120,200,64,0.25);
      border-radius:20px; font-size:10px; font-weight:700; color:#78c840;
      margin-bottom:9px; text-transform:uppercase; letter-spacing:0.06em;
    }
    .ll-live-badge.past { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); color:rgba(255,255,255,0.3); }
    .ll-live-pulse { width:6px; height:6px; border-radius:50%; background:#78c840; animation:_spin 0s; box-shadow:0 0 0 0 rgba(120,200,64,0.6); animation: ll-pulse 1.4s infinite; }
    @keyframes ll-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(120,200,64,0.6);} 50%{box-shadow:0 0 0 5px rgba(120,200,64,0);} }
    .ll-live-card-item {
      background: #1a2840; border-radius: 9px; padding: 10px 12px;
      border: 1px solid rgba(255,255,255,0.06); margin-bottom: 7px;
    }
    .ll-live-card-type { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:rgba(255,255,255,0.25); margin-bottom:4px; }
    .ll-live-card-front { font-size:12px; color:rgba(255,255,255,0.85); line-height:1.5; font-weight:500; }
    .ll-live-actions { display:flex; gap:7px; margin-top:10px; }
    .ll-live-add { flex:1; padding:8px; border-radius:8px; border:none; background:#78c840; color:#0d1b2a; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; pointer-events:all !important; transition:background 0.15s; }
    .ll-live-add:hover { background:#8fd84a; }
    .ll-live-add.saved { background:rgba(120,200,64,0.15); color:#78c840; cursor:default; }
    .ll-live-dismiss { padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.4); font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; pointer-events:all !important; transition:all 0.15s; }
    .ll-live-dismiss:hover { background:rgba(255,255,255,0.07); color:#fff; }
    .ll-live-empty { text-align:center; padding:50px 20px; color:rgba(255,255,255,0.25); font-size:13px; line-height:1.8; }
    .ll-live-empty strong { display:block; font-size:26px; margin-bottom:12px; }
    .ll-past-header { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:rgba(255,255,255,0.2); padding:8px 0 4px; border-top:1px solid rgba(255,255,255,0.05); margin-top:4px; }
    .ll-live-dot { width:8px; height:8px; border-radius:50%; background:#78c840; display:inline-block; animation: ll-pulse 1.4s infinite; margin-right:4px; vertical-align:middle; }
  `;
  shadow.appendChild(style);

  // ── Floating button ────────────────────────────────────────────────────────────
  const btn = document.createElement("div");
  btn.id = "ll-btn";
  btn.innerHTML = `<div class="ll-btn-dot"></div><span>Capture with Lifeline</span>`;
  shadow.appendChild(btn);

  // ── Sidebar ───────────────────────────────────────────────────────────────────
  const sidebar = document.createElement("div");
  sidebar.id = "ll-sidebar";
  sidebar.innerHTML = `
    <div class="ll-hdr">
      <div class="ll-hdr-title-row">
        <img class="ll-logo" src="${chrome.runtime.getURL('icons/lifeline-logo.svg')}" alt="" />
        <div>
          <div class="ll-hdr-title">Lifeline Capture</div>
          <div class="ll-hdr-sub">AI-powered USMLE retention engine</div>
        </div>
      </div>
      <button class="ll-close" id="ll-close">✕</button>
    </div>
    <div class="ll-rainbow"></div>
    <div class="ll-tabs">
      <button class="ll-tab active" data-tab="create">✦ Create Card</button>
      <button class="ll-tab" data-tab="capture">⚡ AI Capture</button>
      <button class="ll-tab" data-tab="live" id="ll-live-tab">📺 Live</button>
    </div>
    <div class="ll-body" id="ll-body">
      <div class="ll-empty" id="ll-capture-empty" style="display:none;">
        <strong style="color:rgba(255,255,255,0.6);display:block;margin-bottom:10px;font-size:15px;">Highlight any text to capture</strong>
        Select a passage from any page, click the Lifeline button, then click ⚡ AI Capture.
      </div>
    </div>
    <div class="ll-ask" id="ll-ask-panel">
      <span class="ll-ask-lbl">🤖 Ask AI about this content</span>
      <div class="ll-ask-row">
        <textarea class="ll-ask-ta" id="ll-ask-input" rows="2" placeholder="e.g. What is the mechanism? First-line treatment?"></textarea>
        <button class="ll-ask-go" id="ll-ask-btn">Ask</button>
      </div>
      <div class="ll-ask-ans" id="ll-ask-ans"></div>
    </div>
    <div class="ll-ftr">
      <button class="ll-ftr-link" id="ll-open-lf">Open Lifeline →</button>
      <div class="ll-ftr-badge" id="ll-badge"></div>
    </div>
  `;
  shadow.appendChild(sidebar);

  // ── Static listeners ───────────────────────────────────────────────────────────
  shadow.getElementById("ll-close").addEventListener("click", closeSidebar);
  shadow.getElementById("ll-open-lf").addEventListener("click", () => chrome.runtime.sendMessage({ type: "OPEN_LIFELINE" }));

  // ── Tab switching ─────────────────────────────────────────────────────────────
  shadow.querySelectorAll(".ll-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      shadow.querySelectorAll(".ll-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const which = tab.dataset.tab;
      if (which === "create") showCreatorView();
      else if (which === "live") showLiveView();
      else showCaptureView();
    });
  });
  shadow.getElementById("ll-ask-btn").addEventListener("click", handleAskAI);
  shadow.getElementById("ll-ask-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAskAI(); }
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    if (selectedText) { openSidebarWithText(selectedText); hideBtn(); }
  });

  document.addEventListener("mouseup", (e) => {
    if (inShadow(e.target)) return;
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : "";
      if (text.length >= 30) { selectedText = text; showBtn(sel); }
      else if (!inShadow(e.target)) hideBtn();
    }, 10);
  });
  document.addEventListener("mousedown", (e) => { if (!inShadow(e.target)) hideBtn(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sidebarOpen) closeSidebar(); });

  // YouTube / cross-script bridge
  window.addEventListener("__lifeline_open_sidebar__", (e) => {
    const { text, sourceType } = (e && e.detail) || {};
    if (text) { currentSourceType = sourceType || "video"; openSidebarWithText(text); }
  });
  document.addEventListener("__lifeline_from_youtube__", (e) => {
    const { text, sourceType, liveCards: cards, topic, videoTitle } = (e && e.detail) || {};
    if (cards?.length) {
      // Add new group to the top of the live feed
      liveCardGroups.unshift({ id: Date.now(), topic: topic || "Live Topic", videoTitle: videoTitle || "", cards, dismissed: false });
      // Keep only last 20 groups to avoid memory bloat
      if (liveCardGroups.length > 20) liveCardGroups.length = 20;
      // Open sidebar to live tab, or refresh if already there
      if (!sidebarOpen) { openSidebar(); showLiveView(); }
      else {
        const activeTab = shadow.querySelector(".ll-tab.active");
        if (activeTab?.dataset.tab === "live") renderLiveView();
        else {
          // Badge the live tab
          const liveTabEl = shadow.getElementById("ll-live-tab");
          if (liveTabEl) liveTabEl.textContent = "📺 Live 🔴";
        }
      }
      return;
    }
    if (text) { currentSourceType = sourceType || "video"; openSidebarWithText(text); }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "OPEN_SIDEBAR_WITH_TEXT") {
      const { text, sourceType } = msg.payload || {};
      if (sourceType) currentSourceType = sourceType;
      openSidebarWithText(text);
    }
    if (msg.type === "OPEN_SIDEBAR_DEFAULT") {
      openSidebar();
      showCreatorView();
    }
  });

  loadBadge();

  // ── Ask AI ────────────────────────────────────────────────────────────────────
  function handleAskAI() {
    const input  = shadow.getElementById("ll-ask-input");
    const askBtn = shadow.getElementById("ll-ask-btn");
    const ans    = shadow.getElementById("ll-ask-ans");
    if (!input || !askBtn || !ans) return;
    const question = (input.value || "").trim();
    if (!question) return;

    askBtn.disabled = true; askBtn.textContent = "…";
    ans.className = "ll-ask-ans"; ans.style.display = "block";
    ans.textContent = "Thinking…";

    chrome.runtime.sendMessage(
      { type: "ASK_AI_QUESTION", payload: { question, context: selectedText } },
      (res) => {
        askBtn.disabled = false; askBtn.textContent = "Ask";
        if (chrome.runtime.lastError || !res) {
          ans.className = "ll-ask-ans ll-ask-err";
          ans.textContent = "⚠ Add an OpenAI key in the extension popup to use AI Q&A.";
          return;
        }
        if (res.ok) {
          ans.textContent = res.answer;
        } else {
          ans.className = "ll-ask-ans ll-ask-err";
          ans.textContent = res.error?.includes("no_ai_key")
            ? "⚠ Add an OpenAI key in the extension popup to use AI Q&A."
            : "⚠ " + (res.error || "Could not get an answer — check your API key.");
        }
      }
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function inShadow(el) { try { return shadow.contains(el) || el === host; } catch { return false; } }

  function showBtn(sel) {
    if (!sel || !sel.rangeCount) return;
    const r = sel.getRangeAt(0).getBoundingClientRect();
    const top  = window.scrollY + r.top - 46;
    const left = Math.min(window.scrollX + r.left + r.width / 2 - 110, window.innerWidth - 250);
    btn.style.display = "flex";
    btn.style.top  = `${Math.max(8, top)}px`;
    btn.style.left = `${Math.max(8, left)}px`;
  }
  function hideBtn() { btn.style.display = "none"; }

  function openSidebar() {
    sidebar.classList.add("open"); sidebarOpen = true;
    host.style.cssText = "position:fixed;z-index:2147483647;top:0;right:0;width:400px;height:100vh;pointer-events:auto;";
    // Default to creator view if not already open in capture mode
    if (!selectedText) showCreatorView();
  }
  function closeSidebar() {
    sidebar.classList.remove("open"); sidebarOpen = false; generatedCards = [];
    setTimeout(() => {
      host.style.cssText = "position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;pointer-events:none;";
    }, 300);
  }

  function setActiveTab(name) {
    shadow.querySelectorAll(".ll-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  }
  function showCreatorView() {
    setActiveTab("create");
    renderCreatorView();
    const panel = shadow.getElementById("ll-ask-panel");
    if (panel) panel.style.display = "none";
  }
  function showCaptureView() {
    setActiveTab("capture");
    if (selectedText) {
      renderCapture(selectedText);
      const panel = shadow.getElementById("ll-ask-panel");
      if (panel) panel.style.display = "block";
    } else {
      shadow.getElementById("ll-body").innerHTML = `
        <div class="ll-empty">
          <strong style="color:rgba(255,255,255,0.6);display:block;margin-bottom:10px;font-size:15px;">Highlight text first</strong>
          Select a passage on any page and click the Lifeline button that appears, then switch to AI Capture here.
        </div>`;
    }
  }

  function showLiveView() {
    setActiveTab("live");
    // Clear badge
    const liveTabEl = shadow.getElementById("ll-live-tab");
    if (liveTabEl) liveTabEl.textContent = "📺 Live";
    const panel = shadow.getElementById("ll-ask-panel");
    if (panel) panel.style.display = "none";
    renderLiveView();
  }

  function renderLiveView() {
    const body = shadow.getElementById("ll-body");
    if (!body) return;
    body.innerHTML = "";

    if (!liveCardGroups.length) {
      body.innerHTML = `
        <div class="ll-live-empty">
          <strong>📺</strong>
          Open a YouTube video and play it — AI flashcards will appear here automatically as topics come up.
          <div style="margin-top:16px;font-size:11px;opacity:0.6;">Cards are generated every ~45 seconds of new content.<br>You can add any card to your deck or let it scroll by.</div>
        </div>`;
      return;
    }

    // Active groups (not dismissed)
    const active = liveCardGroups.filter(g => !g.dismissed);
    const past   = liveCardGroups.filter(g => g.dismissed);

    if (active.length) {
      active.forEach(group => body.appendChild(buildLiveGroup(group)));
    } else {
      const msg = document.createElement("div");
      msg.style.cssText = "text-align:center;font-size:12px;color:rgba(255,255,255,0.25);padding:16px 0;";
      msg.textContent = "All caught up — new cards will appear as the video plays.";
      body.appendChild(msg);
    }

    if (past.length) {
      const ph = document.createElement("div");
      ph.className = "ll-past-header";
      ph.textContent = `Past Topics (${past.length})`;
      body.appendChild(ph);
      past.forEach(group => {
        const el = buildLiveGroup(group);
        el.classList.add("past");
        el.querySelector(".ll-live-badge")?.classList.add("past");
        body.appendChild(el);
      });
    }
  }

  function buildLiveGroup(group) {
    const wrap = document.createElement("div");
    wrap.className = "ll-live-group" + (group.dismissed ? " past" : "");
    wrap.dataset.gid = String(group.id);

    // Badge
    const badge = document.createElement("div");
    badge.className = "ll-live-badge" + (group.dismissed ? " past" : "");
    if (!group.dismissed) {
      const dot = document.createElement("span"); dot.className = "ll-live-pulse";
      badge.appendChild(dot);
    }
    badge.appendChild(document.createTextNode(group.topic));
    wrap.appendChild(badge);

    if (group.videoTitle) {
      const vt = document.createElement("div");
      vt.style.cssText = "font-size:10px;color:rgba(255,255,255,0.28);margin-bottom:8px;";
      vt.textContent = group.videoTitle;
      wrap.appendChild(vt);
    }

    // Cards
    group.cards.forEach((card, ci) => {
      const cardEl = document.createElement("div");
      cardEl.className = "ll-live-card-item";

      const typeEl = document.createElement("div");
      typeEl.className = "ll-live-card-type";
      typeEl.textContent = { basic:"Q&A", cloze:"Cloze", vignette:"Clinical Case", mnemonic:"Mnemonic", workup:"Workup" }[card.card_type] || card.card_type;

      const frontEl = document.createElement("div");
      frontEl.className = "ll-live-card-front";
      const frontText = card.card_type === "cloze"
        ? (card.cloze_text || card.front || "").replace(/\{\{c\d+::(.*?)\}\}/g, "[___]")
        : (card.front || "");
      frontEl.textContent = frontText.slice(0, 160) + (frontText.length > 160 ? "…" : "");

      const actRow = document.createElement("div");
      actRow.className = "ll-live-actions";

      if (!group.dismissed) {
        const addBtn = document.createElement("button");
        addBtn.className = card._saved ? "ll-live-add saved" : "ll-live-add";
        addBtn.textContent = card._saved ? "✓ Added to Deck" : "+ Add to Deck";
        addBtn.addEventListener("click", () => {
          if (card._saved) return;
          card._saved = true;
          // Add to sidebarCards
          sidebarCards.push({
            id: Date.now(),
            type: card.card_type || "basic",
            front: card.front || "",
            back: card.back || "",
            tags: card.tags || [],
            deck: card.deck || "Lifeline Recall::Live Capture",
          });
          try { localStorage.setItem("ll_sidebar_cards", JSON.stringify(sidebarCards)); } catch {}
          addBtn.textContent = "✓ Added to Deck";
          addBtn.className = "ll-live-add saved";
        });
        actRow.appendChild(addBtn);

        if (ci === 0) {
          // Dismiss whole group only on first card's row
          const dismissBtn = document.createElement("button");
          dismissBtn.className = "ll-live-dismiss";
          dismissBtn.textContent = "Dismiss";
          dismissBtn.addEventListener("click", () => {
            group.dismissed = true;
            renderLiveView();
          });
          actRow.appendChild(dismissBtn);
        }
      }

      cardEl.appendChild(typeEl);
      cardEl.appendChild(frontEl);
      if (!group.dismissed) cardEl.appendChild(actRow);
      wrap.appendChild(cardEl);
    });

    return wrap;
  }

  function openSidebarWithText(text) {
    selectedText = text;
    openSidebar();
    showCaptureView();
  }

  // ── Embedded Card Creator ─────────────────────────────────────────────────────
  function renderCreatorView() {
    const body = shadow.getElementById("ll-body");
    if (!body) return;

    const isCloze = creatorCardType === "cloze";

    body.innerHTML = "";

    // ── Card type ──
    const typeWrap = document.createElement("div");
    typeWrap.innerHTML = `<span class="ll-field-lbl">Card Type</span>`;
    const typeRow = document.createElement("div");
    typeRow.className = "ll-type-row";
    ["basic","basic-reverse","cloze"].forEach(t => {
      const b = document.createElement("button");
      b.className = "ll-type-btn" + (creatorCardType === t ? " active" : "");
      b.textContent = t === "basic" ? "Basic" : t === "basic-reverse" ? "Basic + Reverse" : "Cloze";
      b.addEventListener("click", () => { creatorCardType = t; renderCreatorView(); });
      typeRow.appendChild(b);
    });
    typeWrap.appendChild(typeRow);
    body.appendChild(typeWrap);

    // ── Deck ──
    const deckWrap = document.createElement("div");
    deckWrap.innerHTML = `<span class="ll-field-lbl">Deck</span>`;
    const deckRow = document.createElement("div");
    deckRow.className = "ll-deck-row";
    const deckInput = document.createElement("input");
    deckInput.type = "text"; deckInput.className = "ll-deck-input"; deckInput.id = "ll-deck";
    deckInput.placeholder = "e.g. Step1::Cardiology::Heart Failure";
    deckInput.value = shadow.getElementById("ll-deck")?.value || "";
    const deckSel = document.createElement("select");
    deckSel.className = "ll-deck-select";
    deckSel.innerHTML = `<option value="">Presets</option>
      <optgroup label="Step 1">
        <option value="Step1::Cardiology">Cardiology</option><option value="Step1::Renal">Renal</option>
        <option value="Step1::Pulmonology">Pulmonology</option><option value="Step1::Neurology">Neurology</option>
        <option value="Step1::GI">GI</option><option value="Step1::Endocrine">Endocrine</option>
        <option value="Step1::Hematology">Hematology</option><option value="Step1::Pharmacology">Pharmacology</option>
        <option value="Step1::Microbiology">Microbiology</option><option value="Step1::Pathology">Pathology</option>
      </optgroup>
      <optgroup label="Step 2 CK">
        <option value="Step2::Internal Medicine">Internal Medicine</option><option value="Step2::Surgery">Surgery</option>
        <option value="Step2::Pediatrics">Pediatrics</option><option value="Step2::OB-GYN">OB/GYN</option>
        <option value="Step2::Psychiatry">Psychiatry</option><option value="Step2::Emergency">Emergency</option>
      </optgroup>`;
    deckSel.addEventListener("change", () => { if (deckSel.value) { deckInput.value = deckSel.value; deckSel.value = ""; } });
    deckRow.appendChild(deckInput); deckRow.appendChild(deckSel);
    deckWrap.appendChild(deckRow); body.appendChild(deckWrap);

    // ── Front editor ──
    body.appendChild(buildEditorField(
      isCloze ? "Cloze Text" : "Front (Question)",
      "ll-front-ed",
      isCloze ? "Type your sentence, select a word, click [c1] to blank it…" : "Type your question here…",
      true
    ));

    // ── Back editor (hidden for cloze) ──
    const backField = buildEditorField("Back (Answer)", "ll-back-ed", "Type the answer, explanation, or extra info…", false);
    if (isCloze) backField.style.display = "none";
    body.appendChild(backField);

    // ── Tags ──
    const tagsWrap = document.createElement("div");
    tagsWrap.innerHTML = `<span class="ll-field-lbl">Tags</span>`;
    const tagsBox = document.createElement("div");
    tagsBox.className = "ll-tags-box"; tagsBox.id = "ll-tags-box";
    const tagIn = document.createElement("input");
    tagIn.type = "text"; tagIn.className = "ll-tag-in"; tagIn.placeholder = "Type tag, then Enter or comma…";
    tagsBox.addEventListener("click", () => tagIn.focus());
    tagIn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCreatorTag(tagIn.value.trim().replace(/,/g,"")); tagIn.value = ""; renderTagPills(tagsBox, tagIn); }
      else if (e.key === "Backspace" && !tagIn.value && creatorTags.length) { creatorTags.pop(); renderTagPills(tagsBox, tagIn); }
    });
    renderTagPills(tagsBox, tagIn);
    tagsWrap.appendChild(tagsBox); body.appendChild(tagsWrap);

    // ── Add Card button ──
    const addBtn = document.createElement("button");
    addBtn.className = "ll-gen"; addBtn.textContent = "+ Add Card";
    addBtn.addEventListener("click", () => addCreatorCard());
    body.appendChild(addBtn);

    // ── Created cards list ──
    renderCreatedCardsList(body);
  }

  function buildEditorField(label, edId, placeholder, showCloze) {
    const wrap = document.createElement("div");
    const lbl = document.createElement("span");
    lbl.className = "ll-field-lbl"; lbl.textContent = label;

    // Toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "ll-toolbar";
    const fmtBtns = [
      ["B","bold"],["I","italic"],["U","underline"],["S","strikeThrough"],
    ];
    fmtBtns.forEach(([txt, cmd]) => {
      const b = document.createElement("button");
      b.className = "ll-tb-btn"; b.textContent = txt;
      b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); execFmt(cmd, edId); });
      toolbar.appendChild(b);
    });
    const div1 = document.createElement("span"); div1.className = "ll-tb-div";
    toolbar.appendChild(div1);
    const codeBtn = document.createElement("button");
    codeBtn.className = "ll-tb-btn"; codeBtn.textContent = "</>";
    codeBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); wrapCode(edId); });
    toolbar.appendChild(codeBtn);
    const olBtn = document.createElement("button");
    olBtn.className = "ll-tb-btn"; olBtn.textContent = "1.";
    olBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); execFmt("insertOrderedList", edId); });
    toolbar.appendChild(olBtn);
    const ulBtn = document.createElement("button");
    ulBtn.className = "ll-tb-btn"; ulBtn.textContent = "•";
    ulBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); execFmt("insertUnorderedList", edId); });
    toolbar.appendChild(ulBtn);

    if (showCloze && creatorCardType === "cloze") {
      const div2 = document.createElement("span"); div2.className = "ll-tb-div";
      toolbar.appendChild(div2);
      [1,2,3].forEach(n => {
        const cb = document.createElement("button");
        cb.className = `ll-tb-c${n}`; cb.textContent = `[c${n}]`;
        cb.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); wrapCloze(n, edId); });
        toolbar.appendChild(cb);
      });
    }

    // Editor
    const editor = document.createElement("div");
    editor.className = "ll-rich-editor"; editor.contentEditable = "true";
    editor.id = edId; editor.dataset.ph = placeholder;
    editor.addEventListener("focus", () => { lastFocusedField = edId; });

    wrap.appendChild(lbl); wrap.appendChild(toolbar); wrap.appendChild(editor);
    return wrap;
  }

  function execFmt(cmd, edId) {
    const ed = shadow.getElementById(edId);
    if (ed) { ed.focus(); document.execCommand(cmd, false, null); }
  }
  function wrapCode(edId) {
    const ed = shadow.getElementById(edId);
    if (!ed) return; ed.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    document.execCommand("insertHTML", false, `<code>${sel.toString()}</code>`);
  }
  function wrapCloze(n, edId) {
    const ed = shadow.getElementById(edId);
    if (!ed) return; ed.focus();
    const sel = window.getSelection();
    const selected = sel ? sel.toString() : "";
    if (!selected) return;
    document.execCommand("insertHTML", false, `<span class="cloze-hl c${n}">{{c${n}::${selected}}}</span>`);
  }

  function addCreatorTag(t) { if (t && !creatorTags.includes(t)) creatorTags.push(t); }
  function renderTagPills(box, input) {
    box.innerHTML = "";
    creatorTags.forEach((t, i) => {
      const pill = document.createElement("div"); pill.className = "ll-tag-pill";
      const span = document.createElement("span"); span.textContent = t;
      const del = document.createElement("button"); del.textContent = "×";
      del.addEventListener("click", () => { creatorTags.splice(i,1); renderTagPills(box, input); });
      pill.appendChild(span); pill.appendChild(del); box.appendChild(pill);
    });
    box.appendChild(input);
  }

  function addCreatorCard() {
    const frontEl = shadow.getElementById("ll-front-ed");
    const backEl  = shadow.getElementById("ll-back-ed");
    const deckEl  = shadow.getElementById("ll-deck");
    const tagIn   = shadow.querySelector(".ll-tag-in");
    if (tagIn && tagIn.value.trim()) { addCreatorTag(tagIn.value.trim()); tagIn.value = ""; }

    const front = frontEl ? (frontEl.innerText || "").trim() : "";
    const back  = backEl  ? (backEl.innerText  || "").trim() : "";
    if (!front) { if (frontEl) { frontEl.style.outline = "2px solid #f87171"; frontEl.focus(); } return; }

    sidebarCards.push({
      id: Date.now(),
      type: creatorCardType,
      front: frontEl.innerHTML || front,
      back:  backEl ? (backEl.innerHTML || "") : "",
      tags:  [...creatorTags],
      deck:  deckEl?.value.trim() || "Lifeline Recall",
    });
    try { localStorage.setItem("ll_sidebar_cards", JSON.stringify(sidebarCards)); } catch {}

    // Clear editors
    if (frontEl) frontEl.innerHTML = "";
    if (backEl)  backEl.innerHTML  = "";
    creatorTags = [];
    renderCreatorView();
  }

  function renderCreatedCardsList(body) {
    if (!sidebarCards.length) {
      const empty = document.createElement("div");
      empty.style.cssText = "text-align:center;font-size:12px;color:rgba(255,255,255,0.25);padding:12px 0;";
      empty.textContent = "No cards yet — add your first one above";
      body.appendChild(empty);
      return;
    }
    const header = document.createElement("div");
    header.style.cssText = "display:flex;align-items:center;justify-content:space-between;";
    const lbl = document.createElement("span");
    lbl.className = "ll-field-lbl"; lbl.style.marginBottom = "0";
    lbl.textContent = `${sidebarCards.length} card${sidebarCards.length !== 1 ? "s" : ""} created`;
    const exportBtn = document.createElement("button");
    exportBtn.className = "ll-export-created";
    exportBtn.style.cssText = "width:auto;padding:5px 12px;font-size:11px;";
    exportBtn.textContent = "📦 Export Anki";
    exportBtn.addEventListener("click", exportCreatorCards);
    header.appendChild(lbl); header.appendChild(exportBtn);
    body.appendChild(header);

    [...sidebarCards].reverse().forEach(card => {
      const div = document.createElement("div");
      div.className = "ll-created-card";
      const typeEl = document.createElement("div"); typeEl.className = "ll-created-card-type";
      typeEl.textContent = { basic:"Basic Q&A","basic-reverse":"Basic + Reverse", cloze:"Cloze" }[card.type] || "Card";
      const frontEl2 = document.createElement("div"); frontEl2.className = "ll-created-card-front";
      frontEl2.textContent = (card.front || "").replace(/<[^>]+>/g,"").slice(0,100);
      const del = document.createElement("button"); del.className = "ll-created-card-del"; del.textContent = "✕";
      del.addEventListener("click", () => {
        sidebarCards = sidebarCards.filter(c => c.id !== card.id);
        try { localStorage.setItem("ll_sidebar_cards", JSON.stringify(sidebarCards)); } catch {}
        renderCreatorView();
      });
      div.appendChild(typeEl); div.appendChild(frontEl2); div.appendChild(del);
      body.appendChild(div);
    });
  }

  function exportCreatorCards() {
    if (!sidebarCards.length) return;
    const header2 = "#separator:tab\n#html:true\n#tags column:3\n#deck column:4\n#notetype column:5\n\n";
    const rows = sidebarCards.map(c => {
      const front = (c.front||"").replace(/\t|\n/g," ");
      const back  = (c.back||"").replace(/\t|\n/g," ");
      const tags  = (c.tags||[]).join(" ");
      const deck  = c.deck || "Lifeline Recall";
      const ntype = c.type === "cloze" ? "Cloze" : c.type === "basic-reverse" ? "Basic (and reversed card)" : "Basic";
      return `${front}\t${back}\t${tags}\t${deck}\t${ntype}`;
    }).join("\n");
    const blob = new Blob([header2+rows],{type:"text/plain;charset=utf-8"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download=`lifeline-cards-${new Date().toISOString().slice(0,10)}.txt`;
    a.style.display="none"; document.body.appendChild(a); a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},1000);
  }

  // ── Capture UI ────────────────────────────────────────────────────────────────
  function renderCapture(text) {
    const body = shadow.getElementById("ll-body");
    body.innerHTML = "";

    // Source info card
    const sourceCard = document.createElement("div");
    sourceCard.className = "ll-card teal-border";
    const srcLabel = getSourceLabel(currentSourceType);
    sourceCard.innerHTML = `
      <span class="ll-sec-lbl ll-sec-teal">Source</span>
      <div class="ll-source-title">${esc(srcLabel.title)}</div>
      <div class="ll-source-sub">${esc(srcLabel.sub)}</div>
    `;
    body.appendChild(sourceCard);

    // Captured text + generate
    const captureCard = document.createElement("div");
    captureCard.className = "ll-card";
    captureCard.innerHTML = `
      <span class="ll-sec-lbl ll-sec-white">Captured text — edit if needed</span>
      <textarea class="ll-textarea" id="ll-text-in" rows="4"></textarea>
      <div style="height:10px;"></div>
      <button class="ll-gen" id="ll-gen-btn">⚡ Generate Flashcards</button>
    `;
    body.appendChild(captureCard);
    captureCard.querySelector("#ll-text-in").value = text || "";
    captureCard.querySelector("#ll-gen-btn").addEventListener("click", handleGenerate);

    // Cards area
    const area = document.createElement("div");
    area.id = "ll-cards-area";
    body.appendChild(area);
  }

  // ── Generate ──────────────────────────────────────────────────────────────────
  async function handleGenerate() {
    const textEl = shadow.getElementById("ll-text-in");
    const genBtn = shadow.getElementById("ll-gen-btn");
    const area   = shadow.getElementById("ll-cards-area");
    const text   = textEl ? textEl.value.trim() : "";
    if (!text || isGenerating) return;

    isGenerating = true;
    genBtn.disabled = true;
    genBtn.innerHTML = `<span class="ll-spin"></span> Building cards…`;
    area.innerHTML = "";

    try {
      const s = await getStorage();
      const result = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "GENERATE_CARDS_IN_BACKGROUND",
            payload: { text, sourceType: currentSourceType,
              apiUrl: s.apiUrl || "", authToken: s.authToken || "", userId: s.userId || "" } },
          (res) => {
            // chrome.runtime.lastError means the service worker wasn't reachable
            if (chrome.runtime.lastError) {
              reject(new Error("no_ai_key")); return;
            }
            // res undefined = service worker woke up but didn't respond properly
            if (!res) {
              reject(new Error("no_ai_key")); return;
            }
            if (res.ok) resolve(res.data);
            else reject(new Error(res.error || "no_ai_key"));
          }
        );
      });
      generatedCards = (result.cards || []);
      renderAllCards(area);
    } catch (err) {
      // Any error that isn't a specific API failure → show the key setup card
      const isApiError = err.message && (
        err.message.includes("401") ||
        err.message.includes("429") ||
        err.message.includes("API error")
      );

      if (isApiError) {
        const msg401 = `
          <strong style="color:#f87171;">Key rejected (401)</strong><br><br>
          This usually means one of these:<br>
          1. The key was copied incorrectly — re-paste it in the popup<br>
          2. Your OpenAI account has no credits — add $5 at
             <a href="https://platform.openai.com/settings/organization/billing" target="_blank" style="color:#78c840;">platform.openai.com/billing</a><br>
          3. The key has been revoked — generate a new one at
             <a href="https://platform.openai.com/api-keys" target="_blank" style="color:#78c840;">platform.openai.com/api-keys</a>`;
        const msg429 = `<strong style="color:#fbbf24;">Rate limit (429)</strong><br><br>You've hit your usage quota. Wait a moment or check your limits at <a href="https://platform.openai.com/usage" target="_blank" style="color:#78c840;">platform.openai.com/usage</a>`;
        area.innerHTML = `
          <div class="ll-setup-card">
            <h3>⚠ OpenAI Error</h3>
            <p style="text-align:left;line-height:1.7;">${err.message.includes("401") ? msg401 : err.message.includes("429") ? msg429 : err.message}</p>
          </div>`;
      } else {
        // No key set (most common case) — show setup instructions
        area.innerHTML = `
          <div class="ll-setup-card">
            <h3>🔑 Add your ChatGPT API key to generate cards</h3>
            <p>Lifeline uses GPT-4o to create high-yield USMLE Step 1 & 2 flashcards from your highlighted text.</p>
            <p style="margin-top:10px;">
              <strong style="color:#78c840;">How to set up:</strong><br>
              1. Click the <strong>L icon</strong> in your Chrome toolbar<br>
              2. Paste your OpenAI key in the field shown<br>
              3. Click <strong>Save OpenAI Key</strong><br>
              4. Come back and click Generate again
            </p>
            <p style="margin-top:10px;font-size:11px;color:rgba(255,255,255,0.4);">
              Get a free key at <a href="https://platform.openai.com/api-keys" target="_blank" style="color:#78c840;">platform.openai.com/api-keys</a>
            </p>
          </div>`;
      }
    } finally {
      isGenerating = false;
      genBtn.disabled = false;
      genBtn.textContent = "⚡ Regenerate";
    }
  }

  // ── Helper: source label ─────────────────────────────────────────────────────
  function getSourceLabel(sourceType) {
    if (sourceType === "video")    return { title: "Video Lecture", sub: "YouTube / recorded lecture" };
    if (sourceType === "qbank")    return { title: "Question Bank", sub: "UWorld / AMBOSS / BoardVitals" };
    if (sourceType === "textbook") return { title: "Textbook / Reference", sub: "UpToDate / PubMed" };
    return { title: "Web Article", sub: location.hostname };
  }

  // ── Helper: board relevance label ────────────────────────────────────────────
  function getBoardRelevance(card) {
    const br = (card.board_relevance || "").toLowerCase();
    if (br === "step1") return { stars: "★★★★★", label: "Step 1 High-Yield" };
    if (br === "step2") return { stars: "★★★★☆", label: "Step 2 High-Yield" };
    if (br === "both")  return { stars: "★★★★★", label: "Step 1 & 2 High-Yield" };
    return { stars: "★★★☆☆", label: "Board Relevant" };
  }

  // ── Helper: challenge submit ──────────────────────────────────────────────────
  function handleChallenge(wrap, card) {
    const input = wrap.querySelector(".ll-challenge-input");
    const resp  = wrap.querySelector(".ll-challenge-response");
    const btn   = wrap.querySelector(".ll-challenge-submit");
    if (!input || !resp || !btn) return;
    const answer = (input.value || "").trim();
    if (!answer) return;

    btn.disabled = true; btn.textContent = "…";
    chrome.runtime.sendMessage(
      { type: "ASK_AI_QUESTION", payload: {
          question: `The correct answer is: "${getBack(card)}". The student answered: "${answer}". In 1-2 sentences, say if they are correct and what they missed.`,
          context: card.front || ""
        }
      },
      (res) => {
        btn.disabled = false; btn.textContent = "Submit";
        resp.style.display = "block";
        resp.textContent = (res && res.ok) ? res.answer : "Check your answer against the card below.";
      }
    );
  }

  // ── Render cards ──────────────────────────────────────────────────────────────
  function renderAllCards(container) {
    if (!container) return;
    if (!generatedCards.length) {
      container.innerHTML = `<div class="ll-empty">No cards generated. Try selecting a longer passage.</div>`;
      return;
    }

    container.innerHTML = "";

    // Board relevance card (use first card's data)
    const firstCard = generatedCards[0];
    const rel = getBoardRelevance(firstCard);
    const relCard = document.createElement("div");
    relCard.className = "ll-card amber-border";
    const relEl = document.createElement("div");
    relEl.innerHTML = `
      <span class="ll-sec-lbl ll-sec-amber">Board Relevance</span>
      <div class="ll-relevance-title">
        <span class="ll-stars">${rel.stars}</span>${esc(rel.label)}
      </div>
      <div class="ll-relevance-desc">
        ${esc(firstCard.system || "General")} — ${esc(firstCard.topic || "Medical Concept")}
      </div>
    `;
    relCard.appendChild(relEl);
    container.appendChild(relCard);

    // Preview of first card
    const previewCard = document.createElement("div");
    previewCard.className = "ll-card teal-border";
    const pFront = getFront(firstCard);
    const pBack  = getBack(firstCard);
    const pEl = document.createElement("div");
    pEl.innerHTML = `<span class="ll-sec-lbl ll-sec-teal">Card Preview</span>`;
    const pq = document.createElement("div");
    pq.className = "ll-preview-q";
    pq.textContent = pFront;
    const pa = document.createElement("div");
    pa.className = "ll-preview-a";
    pa.style.display = "none";
    pa.textContent = pBack;
    const pr = document.createElement("button");
    pr.className = "ll-preview-reveal";
    pr.textContent = "Reveal answer";
    pr.addEventListener("click", () => {
      if (pa.style.display === "none") { pa.style.display = "block"; pr.textContent = "Hide answer"; }
      else { pa.style.display = "none"; pr.textContent = "Reveal answer"; }
    });
    pEl.appendChild(pq);
    pEl.appendChild(pa);
    pEl.appendChild(pr);
    previewCard.appendChild(pEl);
    container.appendChild(previewCard);

    // Challenge card (ask student a question)
    const challengeCard = document.createElement("div");
    challengeCard.className = "ll-card";
    const cEl = document.createElement("div");
    cEl.innerHTML = `
      <div class="ll-challenge-attending">Attending Challenge</div>
      <div class="ll-challenge-q"></div>
      <div class="ll-challenge-row">
        <input class="ll-challenge-input" type="text" placeholder="Your answer…" />
        <button class="ll-challenge-submit">Submit</button>
      </div>
      <div class="ll-challenge-response"></div>
    `;
    cEl.querySelector(".ll-challenge-q").textContent = getFront(firstCard);
    cEl.querySelector(".ll-challenge-submit").addEventListener("click", () => handleChallenge(cEl, firstCard));
    cEl.querySelector(".ll-challenge-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleChallenge(cEl, firstCard);
    });
    challengeCard.appendChild(cEl);
    container.appendChild(challengeCard);

    // All cards toggle
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "ll-all-cards-toggle";
    toggleBtn.innerHTML = `<span>All ${generatedCards.length} Cards</span><span>▼</span>`;
    const allCardsWrap = document.createElement("div");
    allCardsWrap.style.display = "none";
    allCardsWrap.style.display = "flex";
    allCardsWrap.style.flexDirection = "column";
    allCardsWrap.style.gap = "8px";

    generatedCards.forEach((card, i) => {
      const wrap = document.createElement("div");
      wrap.className = "ll-mini-card";
      wrap.dataset.idx = String(i);
      renderOneCard(wrap, card, i);
      allCardsWrap.appendChild(wrap);
    });

    let allVisible = true;
    toggleBtn.addEventListener("click", () => {
      allVisible = !allVisible;
      allCardsWrap.style.display = allVisible ? "flex" : "none";
      toggleBtn.querySelector("span:last-child").textContent = allVisible ? "▲" : "▼";
    });

    container.appendChild(toggleBtn);
    container.appendChild(allCardsWrap);

    // Action buttons
    const row = document.createElement("div");
    row.className = "ll-btn-row";
    row.style.marginTop = "4px";

    const ankiBtn = document.createElement("button");
    ankiBtn.className = "ll-btn-muted";
    ankiBtn.textContent = "Export for Anki";
    ankiBtn.addEventListener("click", exportToAnki);

    const saveAllBtn = document.createElement("button");
    saveAllBtn.className = "ll-btn-green";
    saveAllBtn.textContent = "Save to Lifeline";
    saveAllBtn.addEventListener("click", handleSaveAll);

    row.appendChild(ankiBtn);
    row.appendChild(saveAllBtn);
    container.appendChild(row);
  }

  // ── renderOneCard (mini-card style) ─────────────────────────────────────────
  function renderOneCard(wrap, card, i) {
    const typeLabel = {
      basic:"Q&A", cloze:"Fill-in-Blank", vignette:"Clinical Case",
      workup:"Workup", mnemonic:"Mnemonic", flowchart:"Algorithm", comparison:"Compare"
    }[card.card_type] || card.card_type;

    const front = getFront(card);
    const back  = getBack(card);

    wrap.innerHTML = `
      <div class="ll-mini-type"></div>
      <div class="ll-mini-q"></div>
      <div class="ll-mini-a"></div>
      <div class="ll-mini-btns">
        <button class="ll-mini-btn flip">Show answer</button>
        <button class="ll-mini-btn edit">Edit</button>
        <button class="ll-mini-btn save">Save</button>
      </div>
    `;

    wrap.querySelector(".ll-mini-type").textContent = typeLabel;
    wrap.querySelector(".ll-mini-q").textContent = front;
    wrap.querySelector(".ll-mini-a").textContent = back;

    const flipBtn = wrap.querySelector(".ll-mini-btn.flip");
    const ansEl   = wrap.querySelector(".ll-mini-a");
    flipBtn.addEventListener("click", () => {
      const vis = ansEl.classList.toggle("vis");
      flipBtn.textContent = vis ? "Hide answer" : "Show answer";
    });

    wrap.querySelector(".ll-mini-btn.edit").addEventListener("click", (e) => {
      e.stopPropagation();
      openInlineEdit(wrap, card, i);
    });

    wrap.querySelector(".ll-mini-btn.save").addEventListener("click", (e) => {
      e.stopPropagation();
      saveSingle(i, wrap.querySelector(".ll-mini-btn.save"));
    });
  }

  function getFront(card) {
    if (card.card_type === "cloze") return (card.cloze_text || card.front || "").replace(/\{\{c\d+::(.*?)\}\}/g, "[___]");
    if (card.card_type === "vignette") return (card.stem || card.front || "") + (card.question ? "\n\n" + card.question : "");
    return card.front || "";
  }

  function getBack(card) {
    if (card.card_type === "cloze") {
      return (card.cloze_text || "").replace(/\{\{c\d+::(.*?)\}\}/g, (_, m) => `→ ${m}`);
    }
    if (card.card_type === "vignette") return (card.answer_points || [card.back]).filter(Boolean).join("\n");
    if (card.card_type === "workup") return (card.steps || []).map((s,n) => `${n+1}. ${s.action}`).join("\n");
    if (card.card_type === "mnemonic") return (card.items || []).map(it => `${it.letter} — ${it.term}`).join("\n");
    if (card.card_type === "flowchart") {
      const fc = card.flowchart || {};
      return [fc.start, ...(fc.steps||[]).map(s=>s.text||""), fc.end].filter(Boolean).join(" → ");
    }
    return card.back || "";
  }

  // ── Inline editing ────────────────────────────────────────────────────────────
  function openInlineEdit(wrap, card, i) {
    const isCloze = card.card_type === "cloze";
    const frontVal = (isCloze ? (card.cloze_text || card.front) : card.front) || "";

    wrap.innerHTML = `
      <div class="ll-edit-field">
        <span class="ll-edit-lbl">${isCloze ? "Cloze" : "Question"}</span>
        <textarea class="ll-edit-ta" id="ef" rows="3"></textarea>
      </div>
      ${!isCloze ? `<div class="ll-edit-field"><span class="ll-edit-lbl">Answer</span><textarea class="ll-edit-ta muted" id="eb" rows="3"></textarea></div>` : ""}
      <div class="ll-edit-field">
        <span class="ll-edit-lbl">Tags</span>
        <input class="ll-edit-in" id="et" type="text" placeholder="step1, cardiology" />
      </div>
      <div class="ll-edit-gap"></div>
      <div class="ll-mini-btns">
        <button class="ll-mini-btn save-edit">Save</button>
        <button class="ll-mini-btn cancel">Cancel</button>
      </div>
    `;

    wrap.querySelector("#ef").value = frontVal;
    if (!isCloze && wrap.querySelector("#eb")) wrap.querySelector("#eb").value = card.back || "";
    wrap.querySelector("#et").value = (card.tags || []).join(", ");
    setTimeout(() => { const f = wrap.querySelector("#ef"); if (f) f.focus(); }, 30);

    wrap.querySelector(".ll-mini-btn.cancel").addEventListener("click", (e) => {
      e.stopPropagation();
      renderOneCard(wrap, generatedCards[i], i);
    });

    wrap.querySelector(".ll-mini-btn.save-edit").addEventListener("click", (e) => {
      e.stopPropagation();
      const fe = wrap.querySelector("#ef");
      const be = wrap.querySelector("#eb");
      const te = wrap.querySelector("#et");
      const newFront = (fe ? fe.value : "").trim();
      if (!newFront) { if (fe) { fe.style.borderColor = "#f87171"; fe.focus(); } return; }
      const newBack = isCloze ? (card.back || "") : (be ? be.value.trim() : "");
      const newTags = te ? te.value.split(",").map(t=>t.trim()).filter(Boolean) : [];
      generatedCards[i] = { ...card, front: newFront, back: newBack,
        cloze_text: isCloze ? newFront : card.cloze_text, tags: newTags };
      renderOneCard(wrap, generatedCards[i], i);
    });
  }

  // ── Save / export ─────────────────────────────────────────────────────────────
  async function handleSaveAll() {
    const s = await getStorage();
    if (!s.userId) { alert("Connect your Lifeline account in the extension popup to save cards."); return; }
    let saved = 0;
    for (const card of generatedCards) {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: "SAVE_CARD_IN_BACKGROUND", payload: { card, apiUrl: s.apiUrl, authToken: s.authToken, userId: s.userId } },
          (res) => { if (res?.ok) saved++; resolve(); }
        );
      });
    }
    chrome.runtime.sendMessage({ type: "CARDS_SAVED", payload: { count: saved } });
    renderSuccess(saved);
  }

  async function saveSingle(idx, buttonEl) {
    const s = await getStorage();
    if (!s.userId) { buttonEl.textContent = "Login first"; return; }
    buttonEl.textContent = "…"; buttonEl.disabled = true;
    chrome.runtime.sendMessage(
      { type: "SAVE_CARD_IN_BACKGROUND", payload: { card: generatedCards[idx], apiUrl: s.apiUrl, authToken: s.authToken, userId: s.userId } },
      (res) => {
        buttonEl.textContent = res?.ok ? "✓ Saved" : "Error";
        buttonEl.className = "ll-card-btn saved";
        if (res?.ok) chrome.runtime.sendMessage({ type: "CARDS_SAVED", payload: { count: 1 } });
      }
    );
  }

  function exportToAnki() {
    if (!generatedCards.length) return;
    const header = "#separator:tab\n#html:false\n#tags column:3\n";
    const rows = generatedCards.map(card => {
      let front = getFront(card).replace(/\t|\n/g, " ");
      let back  = getBack(card).replace(/\t|\n/g, " ");
      if (card.explanation) back += " | 💡 " + card.explanation.replace(/\t|\n/g, " ");
      const tags = (card.tags || []).join(" ");
      return `${front}\t${back}\t${tags}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `lifeline-${new Date().toISOString().slice(0,10)}.txt`;
    a.style.display = "none"; document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  }

  function renderSuccess(count) {
    shadow.getElementById("ll-body").innerHTML = `
      <div class="ll-success">
        <div class="ll-success-icon">✅</div>
        <div class="ll-success-title">${count} card${count!==1?"s":""} saved!</div>
        <div class="ll-success-sub">Added to your Lifeline queue with spaced repetition.</div>
        <button class="ll-open-btn" id="ll-go-lf">Open Lifeline →</button>
        <button class="ll-new-btn" id="ll-new-cap">↩ Capture more</button>
      </div>
    `;
    shadow.getElementById("ll-go-lf").addEventListener("click", () => chrome.runtime.sendMessage({ type: "OPEN_LIFELINE" }));
    shadow.getElementById("ll-new-cap").addEventListener("click", () => {
      generatedCards = [];
      shadow.getElementById("ll-body").innerHTML = `<div class="ll-empty"><span class="ll-empty-icon">📖</span><strong style="color:rgba(255,255,255,0.6);display:block;margin-bottom:8px;">Highlight any text to get started</strong>Select a passage and click the Lifeline button.</div>`;
    });
  }

  function loadBadge() {
    chrome.storage.local.get(["totalCardsSaved"], ({ totalCardsSaved = 0 }) => {
      const b = shadow.getElementById("ll-badge");
      if (b && totalCardsSaved > 0) b.textContent = `${totalCardsSaved} saved`;
    });
  }

  function getStorage() {
    return new Promise(r => chrome.storage.local.get({ apiUrl: "http://localhost:3000", userId: null, authToken: null }, r));
  }

  function esc(str) {
    return (str || "").toString()
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function detectPageSourceType() {
    const h = location.hostname.toLowerCase();
    if (h.includes("youtube.com")) return "video";
    if (h.includes("uworld.com") || h.includes("amboss.com") || h.includes("boardvitals.com")) return "qbank";
    if (h.includes("uptodate.com") || h.includes("ncbi.nlm.nih.gov")) return "textbook";
    return "other";
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CARD GENERATOR (unchanged business logic)
  // ════════════════════════════════════════════════════════════════════════════

  function buildCards(text, sourceType) {
    const system = detectSystem(text);
    const topic  = detectTopic(text, system);
    const facts  = extractFacts(text);
    const deck   = `Step 1::${system}::${topic}`;
    const tags   = [(system||"General").toLowerCase(), (topic||"Concept").toLowerCase().replace(/\s+/g,"-"), sourceType].filter(Boolean);
    const cards  = [];
    if (facts[0]) {
      cards.push({ card_type:"basic", front:pickQ(topic,facts[0]), back:facts[0],
        explanation:`High-yield ${system}. Know the mechanism and clinical context.`,
        tags, deck, topic, system, difficulty:3, board_relevance:"step1", source_type:sourceType, source_text:text.slice(0,200) });
    }
    const cs = facts[1] || facts[0];
    if (cs) {
      const ct = makeCloze(cs);
      if (ct !== cs) cards.push({ card_type:"cloze", front:ct, back:"", cloze_text:ct,
        explanation:"Fill-in-the-blank — key fact for retention.",
        tags:[...tags,"cloze"], deck, topic, system, difficulty:2, board_relevance:"step1", source_type:sourceType, source_text:text.slice(0,200) });
    }
    const mn = buildMnemonic(text,topic,system,deck,tags,sourceType);
    if (mn) cards.push(mn);
    cards.push(buildVignette(topic,system,facts,deck,tags,sourceType));
    cards.push(buildWorkup(topic,system,facts,deck,tags,sourceType));
    cards.push(buildFlowchart(topic,system,deck,tags,sourceType));
    return { cards: cards.filter(Boolean), topic, system };
  }

  function pickQ(topic, fact) {
    if (/strongest|most common|most frequent/i.test(fact)) return `What is the most common risk factor for ${topic}?`;
    if (/mechanism|pathophys|leads to|results in|due to/i.test(fact)) return `What is the mechanism of ${topic}?`;
    if (/treat|manag|drug|medication|first.?line/i.test(fact)) return `What is the first-line treatment for ${topic}?`;
    if (/diagnos|confirm|test|workup|gold standard/i.test(fact)) return `How is ${topic} diagnosed?`;
    if (/complication|sequela|risk of/i.test(fact)) return `What are the major complications of ${topic}?`;
    return `What is the key clinical significance of ${topic}?`;
  }

  const MED_TERMS = ["hypertension","dissection","aortic","cocaine","stenosis","infarction","ischemia","embolism","thrombosis","fibrillation","edema","hemorrhage","anemia","sepsis","pneumonia","cirrhosis","nephrotic","proteinuria","hematuria","creatinine","albumin","troponin","aldosterone","cortisol","insulin","warfarin","heparin"];
  const STOP = new Set(["the","a","an","is","are","was","were","of","in","on","at","to","for","by","with","and","or","but","that","this","it","be","been","have","has","had","very","also","such","some","any","all","from","than","then","when","where","which","who","how","what","especially","sometimes","noted","particularly"]);

  function makeCloze(s) {
    const nm = s.match(/>\d+%|\d+%|≥\d+%|\d+\s*mmHg|\d+\s*mg\/dL/);
    if (nm) return s.replace(nm[0], `{{c1::${nm[0]}}}`);
    const words = s.split(" ");
    for (let i=0;i<words.length;i++) {
      const clean = words[i].replace(/[^a-zA-Z-]/g,"").toLowerCase();
      if (clean.length>5 && MED_TERMS.some(t=>clean.includes(t)||t.includes(clean))) {
        const b=[...words]; b[i]=`{{c1::${words[i]}}}`; return b.join(" ");
      }
    }
    const cands = words.filter(w=>w.replace(/[^a-zA-Z]/g,"").length>6&&!STOP.has(w.toLowerCase()));
    if (cands.length) { const t=cands[Math.floor(cands.length*0.4)]; return s.replace(t,`{{c1::${t}}}`); }
    return s;
  }

  const MNEMONIC_DB = {
    "aortic dissection":{ acronym:"TEACH", items:[{letter:"T",term:"Trauma / Deceleration"},{letter:"E",term:"Ehlers-Danlos / Marfan"},{letter:"A",term:"Atherosclerosis"},{letter:"C",term:"Cocaine / Stimulants"},{letter:"H",term:"Hypertension (>70%)"}], context:"Risk factors for aortic dissection." },
    "heart failure":{ acronym:"FAILURE", items:[{letter:"F",term:"Fatigue"},{letter:"A",term:"Activity limitation"},{letter:"I",term:"Increased dyspnea"},{letter:"L",term:"Leg edema"},{letter:"U",term:"Unintentional weight gain"},{letter:"R",term:"Rales bilaterally"},{letter:"E",term:"Elevated JVP / S3"}], context:"Signs and symptoms of heart failure." },
    "nephrotic syndrome":{ acronym:"HELP", items:[{letter:"H",term:"Hypoalbuminemia"},{letter:"E",term:"Edema"},{letter:"L",term:"Lipiduria + Hyperlipidemia"},{letter:"P",term:"Proteinuria >3.5 g/day"}], context:"Four hallmarks of nephrotic syndrome." },
    "pulmonary embolism":{ acronym:"CHEST", items:[{letter:"C",term:"Chest pain"},{letter:"H",term:"Hemoptysis"},{letter:"E",term:"Elevated heart rate"},{letter:"S",term:"Sudden dyspnea"},{letter:"T",term:"Tachypnea + hypoxia"}], context:"Classic PE symptoms." },
    "stroke":{ acronym:"FAST", items:[{letter:"F",term:"Face drooping"},{letter:"A",term:"Arm weakness"},{letter:"S",term:"Speech difficulty"},{letter:"T",term:"Time to call 911"}], context:"Stroke recognition mnemonic." },
  };

  function buildMnemonic(text,topic,system,deck,tags,sourceType) {
    const tl=(topic||"").toLowerCase();
    let mn=Object.entries(MNEMONIC_DB).find(([k])=>tl.includes(k))?.[1];
    if (!mn) {
      const caps=[...new Set((text.match(/\b[A-Z][a-z]{3,}\b/g)||[]).filter(w=>!["This","The","In","For","And","But","With","From","That","When","What","Where","Also","Both"].includes(w)))].slice(0,5);
      if (caps.length>=3) { const a=caps.map(w=>w[0]).join(""); if (a.length>=3&&a.length<=7) mn={acronym:a,items:caps.map(w=>({letter:w[0],term:w})),context:`Mnemonic for ${topic}.`}; }
    }
    if (!mn) return null;
    return { card_type:"mnemonic", front:`Mnemonic for ${topic} — ${mn.acronym}`, back:mn.items.map(i=>`${i.letter} — ${i.term}`).join("\n"), acronym:mn.acronym, items:mn.items, context:mn.context, explanation:`Remember: ${mn.acronym}`, tags:[...tags,"mnemonic"], deck, topic, system, difficulty:1, board_relevance:"both", source_type:sourceType, source_text:"" };
  }

  const VIGNETTE_STEMS = {
    Cardiology:"A 62yo man with hypertension presents with sudden-onset tearing chest pain radiating to the back. BP 192/110 right arm, 154/88 left arm. CXR shows widened mediastinum.",
    Renal:"A 7yo boy presents with periorbital edema and frothy urine 10 days after a URI. Serum albumin 1.6 g/dL. Urine protein 4+.",
    Pulmonology:"A 68yo smoker presents with progressive dyspnea, barrel chest, and decreased breath sounds. FEV1/FVC 0.55.",
    Neurology:"A 72yo man presents with sudden-onset right arm weakness and expressive aphasia. Onset 2 hours ago.",
    Gastroenterology:"A 52yo with alcoholic cirrhosis presents with hematemesis. Endoscopy shows large esophageal varices.",
    Endocrine:"A 28yo woman presents with fatigue, weight gain, constipation, and cold intolerance × 3 months. TSH 42.",
    General:"A patient presents with symptoms consistent with this condition.",
  };
  const VIGNETTE_ANSWERS = {
    Cardiology:["Diagnosis: Aortic dissection","IV labetalol → SBP <120, HR <60","CT angiography (gold standard)","Type A: emergency surgery; Type B: medical management"],
    Renal:["Diagnosis: Minimal Change Disease","Prednisone 2mg/kg/day × 4-6 weeks","85% respond to steroids","Watch for hypercoagulability complications"],
    General:["Apply key teaching points for this diagnosis","Know: mechanism, workup, first-line treatment"],
  };

  function buildVignette(topic,system,facts,deck,tags,sourceType) {
    const stem=VIGNETTE_STEMS[system]||VIGNETTE_STEMS.General;
    const points=VIGNETTE_ANSWERS[system]||facts.slice(0,3);
    return { card_type:"vignette", front:stem, stem, question:"What is the diagnosis and management?", back:points.join("\n"), answer_points:points, explanation:`Board-style vignette for ${topic}.`, tags:[...tags,"vignette"], deck, topic, system, difficulty:4, board_relevance:"both", source_type:sourceType, source_text:"" };
  }

  const WORKUP_DB = {
    "aortic dissection":{ question:"Workup for suspected Aortic Dissection?", steps:[{action:"2 large-bore IVs, monitoring, type & crossmatch"},{action:"IV labetalol → HR <60, then SBP <120"},{action:"EKG: rule out concurrent STEMI"},{action:"CXR: widened mediastinum?"},{action:"CT Angiography (gold standard if stable)"},{action:"Type A: emergency surgery; Type B: medical management"}] },
    "heart failure":{ question:"Workup for suspected Heart Failure?", steps:[{action:"BNP or NT-proBNP (>400 supports HF)"},{action:"CXR: cardiomegaly, Kerley B lines"},{action:"EKG: Afib, LVH, prior MI?"},{action:"Echocardiogram: EF, wall motion, valves"},{action:"BMP + troponin + TSH"}] },
    "nephrotic syndrome":{ question:"Workup for Nephrotic Syndrome?", steps:[{action:"Urine protein:creatinine ratio (>3.5 g/day)"},{action:"Serum albumin + lipid panel"},{action:"Urine microscopy: oval fat bodies"},{action:"ANA, complement, anti-PLA2R, hepatitis serologies"},{action:"Renal biopsy (adults); assume MCD in children <8yo"}] },
  };

  function buildWorkup(topic,system,facts,deck,tags,sourceType) {
    const tl=(topic||"").toLowerCase();
    let wk=Object.entries(WORKUP_DB).find(([k])=>tl.includes(k))?.[1];
    if (!wk) wk={ question:`Workup for ${topic}?`, steps:[{action:"History & physical exam"},{action:"Basic labs: CBC, BMP, LFTs"},{action:"EKG and/or CXR if indicated"},{action:"Targeted imaging"},{action:"Confirmatory test / biopsy if needed"}] };
    return { card_type:"workup", front:wk.question, back:wk.steps.map((s,i)=>`${i+1}. ${s.action}`).join("\n"), steps:wk.steps, explanation:"Know the rationale for each step.", tags:[...tags,"workup"], deck, topic, system, difficulty:3, board_relevance:"both", source_type:sourceType, source_text:"" };
  }

  const FLOWCHART_DB = {
    "aortic dissection":{ start:"Suspected Aortic Dissection", steps:[{type:"action",text:"IV labetalol → HR <60, SBP <120"},{type:"decision",text:"Hemodynamically stable?",yes:"CT Angiography",no:"TEE + Emergency OR"},{type:"decision",text:"Type A?",yes:"Emergency surgery",no:"Medical management"}], end:"ICU monitoring" },
    "heart failure":{ start:"Suspected Heart Failure", steps:[{type:"action",text:"BNP + Echo + CXR + EKG"},{type:"decision",text:"EF <40%?",yes:"ACEi + Beta-blocker + Diuretic",no:"HFpEF: diuresis + treat comorbidities"}], end:"Monitor BNP, annual echo" },
  };

  function buildFlowchart(topic,system,deck,tags,sourceType) {
    const tl=(topic||"").toLowerCase();
    let fc=Object.entries(FLOWCHART_DB).find(([k])=>tl.includes(k))?.[1];
    if (!fc) fc={ start:`Suspected ${topic}`, steps:[{type:"action",text:"History, exam, initial labs"},{type:"decision",text:"Hemodynamically unstable?",yes:"Stabilize + emergent workup",no:"Systematic workup"},{type:"decision",text:"Diagnosis confirmed?",yes:"Specific treatment",no:"Broaden differential"}], end:"Follow up and titrate therapy" };
    return { card_type:"flowchart", front:`${topic} — Algorithm`, back:JSON.stringify(fc), flowchart:fc, explanation:"Know each branch point.", tags:[...tags,"algorithm"], deck, topic, system, difficulty:4, board_relevance:"both", source_type:sourceType, source_text:"" };
  }

  const SYSTEM_MAP = {
    Cardiology:["heart","cardiac","myocardial","atrial","aortic","dissection","coronary","troponin"],
    Renal:["kidney","renal","glomerular","nephrotic","nephritic","creatinine","proteinuria","hematuria"],
    Pulmonology:["lung","pulmonary","respiratory","asthma","copd","pneumonia","pleural","dyspnea"],
    Neurology:["brain","neural","stroke","cerebral","seizure","dementia","cranial"],
    Gastroenterology:["liver","hepatic","bowel","gastric","pancreatic","biliary","cirrhosis","hepatitis"],
    Endocrine:["thyroid","diabetes","insulin","cortisol","adrenal","glucose","aldosterone"],
    Hematology:["blood","anemia","hemoglobin","platelet","leukemia","coagulation","thrombosis"],
    Pharmacology:["drug","dose","receptor","inhibitor","mechanism of action","contraindication"],
    "Infectious Disease":["infection","bacteria","virus","sepsis","antimicrobial","antibiotic","fever"],
  };

  function detectSystem(text) {
    const lower=text.toLowerCase(); let best="General",bestScore=0;
    for (const [sys,kw] of Object.entries(SYSTEM_MAP)) {
      const score=kw.filter(k=>lower.includes(k.toLowerCase())).length;
      if (score>bestScore) { bestScore=score; best=sys; }
    }
    return best;
  }

  function detectTopic(text,system) {
    const sm=text.match(/[A-Z][a-z]+(?: [A-Z][a-z]+)* (?:Disease|Syndrome|Disorder|Failure|Dissection|Infarction|Nephropathy|Stenosis|Embolism|Cardiomyopathy)/);
    if (sm) return sm[0];
    const cm=text.match(/(?:acute |chronic )?[A-Z][a-z]+(?: [A-Z][a-z]+)*(?= (?:is|are|was|presents|causes|occurs|results))/);
    if (cm&&cm[0].length>4) return cm[0];
    const first=text.split(/[.,]/)[0].trim();
    if (first.length<70) { const n=first.match(/[A-Z][a-z]+(?: [a-z]+){0,3}/); if (n) return n[0]; }
    return (system&&system!=="General")?`${system} Pathology`:"Medical Concept";
  }

  function extractFacts(text) {
    return text.replace(/\n+/g," ").split(/(?<=[.!?])\s+/)
      .map(s=>s.trim()).filter(s=>s.length>25&&s.length<400).slice(0,8);
  }

})();
