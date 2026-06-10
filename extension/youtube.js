/**
 * Lifeline Recall — YouTube Content Script v2.0
 * • Transcript panel with auto-scroll, selectable text, and per-selection capture
 * • Live caption watcher → auto AI flashcards every ~45 s of new content
 * • Bridges live cards to content.js sidebar via custom events
 */

(function () {
  "use strict";

  if (window.__lifelineYouTubeLoaded) return;
  window.__lifelineYouTubeLoaded = true;

  // ── State ─────────────────────────────────────────────────────────────────────
  let captureBarInjected  = false;
  let transcriptPanelEl   = null;
  let transcriptVisible   = false;
  let autoScrollTranscript = true;
  let liveWatcherInterval = null;
  let captionBuffer       = [];
  let lastGenTime         = 0;
  let lastCaptionText     = "";
  let isGeneratingLive    = false;

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() {
    observeNavigation();
    tryInjectBar();
  }

  function observeNavigation() {
    const nav = document.querySelector("head title");
    if (!nav) return;
    new MutationObserver(() => {
      captureBarInjected  = false;
      transcriptPanelEl   = null;
      transcriptVisible   = false;
      if (liveWatcherInterval) { clearInterval(liveWatcherInterval); liveWatcherInterval = null; }
      captionBuffer = []; lastGenTime = 0; lastCaptionText = "";
      setTimeout(tryInjectBar, 1500);
    }).observe(nav, { childList: true });
  }

  function tryInjectBar() {
    if (captureBarInjected || !location.pathname.startsWith("/watch")) return;
    const iv = setInterval(() => {
      const below = document.querySelector("#below") || document.querySelector("#secondary");
      if (below) {
        clearInterval(iv);
        injectCaptureBar(below);
        setTimeout(() => startLiveCaptionWatcher(), 3000);
      }
    }, 800);
    setTimeout(() => clearInterval(iv), 10000);
  }

  // ── Capture bar ───────────────────────────────────────────────────────────────
  function injectCaptureBar(targetEl) {
    if (captureBarInjected || document.getElementById("ll-yt-bar")) return;
    captureBarInjected = true;

    const bar = document.createElement("div");
    bar.id = "ll-yt-bar";
    bar.style.cssText = "margin:0 0 8px 0;padding:12px 16px;background:#060810;border:1px solid rgba(74,222,128,0.25);border-radius:14px;font-family:-apple-system,'Inter',sans-serif;";

    bar.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:180px;">
          <div style="width:26px;height:26px;background:linear-gradient(135deg,#78c840,#2dd4bf);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#06080f;flex-shrink:0;">L</div>
          <div>
            <div style="font-size:12px;font-weight:800;color:white;line-height:1.2;">Lifeline Recall</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.4);">AI flashcards from video transcript</div>
          </div>
        </div>
        <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center;">
          <button id="ll-yt-current" style="${bs("#1e293b","rgba(255,255,255,0.6)")}">⏱ Current</button>
          <button id="ll-yt-recent"  style="${bs("#1e293b","rgba(255,255,255,0.6)")}">⏪ Last 60 s</button>
          <button id="ll-yt-full"    style="${bs("#0f2d1f","#78c840")}">📋 Full Transcript</button>
          <button id="ll-yt-toggle-panel" style="${bs("#1a1040","#a78bfa")}">📄 Transcript Panel</button>
        </div>
      </div>
      <div id="ll-yt-status" style="display:none;margin-top:10px;font-size:11px;color:rgba(74,222,128,0.8);padding:6px 10px;background:rgba(74,222,128,0.08);border-radius:8px;border:1px solid rgba(74,222,128,0.2);"></div>
    `;
    targetEl.insertBefore(bar, targetEl.firstChild);

    // Transcript panel (hidden by default)
    transcriptPanelEl = buildTranscriptPanel();
    bar.insertAdjacentElement("afterend", transcriptPanelEl);

    bar.querySelector("#ll-yt-current").addEventListener("click", () => captureSegment("current"));
    bar.querySelector("#ll-yt-recent").addEventListener("click",  () => captureSegment("recent"));
    bar.querySelector("#ll-yt-full").addEventListener("click",    () => captureSegment("full"));
    bar.querySelector("#ll-yt-toggle-panel").addEventListener("click", toggleTranscriptPanel);
  }

  function bs(bg, color) {
    return `padding:7px 13px;border-radius:9px;border:1px solid rgba(255,255,255,0.1);background:${bg};color:${color};font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;`;
  }

  // ── Transcript Panel ──────────────────────────────────────────────────────────
  function buildTranscriptPanel() {
    const panel = document.createElement("div");
    panel.id = "ll-transcript-panel";
    panel.style.cssText = "display:none;margin:0 0 12px 0;background:#0a0f1e;border:1px solid rgba(120,200,64,0.2);border-radius:14px;overflow:hidden;font-family:-apple-system,'Inter',sans-serif;";

    panel.innerHTML = `
      <div style="padding:12px 16px;background:#0d1b2a;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <div style="font-size:13px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;">
          📄 Video Transcript
          <span id="ll-tp-wc" style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.35);padding:2px 8px;background:rgba(255,255,255,0.06);border-radius:10px;"></span>
        </div>
        <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap;">
          <label style="display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,0.45);cursor:pointer;user-select:none;">
            <input type="checkbox" id="ll-tp-autoscroll" checked style="accent-color:#78c840;width:13px;height:13px;"> Auto-scroll
          </label>
          <button id="ll-tp-ts-toggle" style="${bs("#1e293b","rgba(255,255,255,0.5)")}">⏱ Timestamps</button>
          <button id="ll-tp-copy"      style="${bs("#1e293b","rgba(255,255,255,0.5)")}">📋 Copy All</button>
          <button id="ll-tp-send"      style="${bs("#0f2d1f","#78c840")}">⚡ Send to AI</button>
        </div>
      </div>

      <!-- Transcript text body -->
      <div id="ll-tp-body" style="max-height:340px;overflow-y:auto;padding:14px 16px;font-size:13.5px;color:rgba(255,255,255,0.78);line-height:2;user-select:text;position:relative;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.08) transparent;">
        <div id="ll-tp-loading" style="text-align:center;padding:32px;color:rgba(255,255,255,0.28);">Loading transcript…</div>
      </div>

      <!-- Hint bar -->
      <div style="padding:8px 16px;border-top:1px solid rgba(255,255,255,0.04);font-size:10px;color:rgba(255,255,255,0.25);">
        Highlight any text → click <strong style="color:#78c840;">✦ Capture Selection</strong> to generate flashcards from that passage
      </div>
    `;

    // Floating selection button (appended to body so it can be position:fixed)
    const selBtn = document.createElement("div");
    selBtn.id = "ll-tp-sel-btn";
    selBtn.style.cssText = "display:none;position:fixed;z-index:2147483646;padding:7px 16px;background:#78c840;color:#0d1b2a;font-size:12px;font-weight:800;border-radius:20px;cursor:pointer;box-shadow:0 4px 24px rgba(0,0,0,0.55);font-family:-apple-system,sans-serif;white-space:nowrap;pointer-events:all;user-select:none;transition:opacity 0.15s;";
    selBtn.textContent = "✦ Capture Selection";
    document.body.appendChild(selBtn);

    // Wire controls
    panel.querySelector("#ll-tp-autoscroll").addEventListener("change", (e) => {
      autoScrollTranscript = e.target.checked;
    });

    let showTs = false;
    panel.querySelector("#ll-tp-ts-toggle").addEventListener("click", () => {
      showTs = !showTs;
      panel.querySelectorAll(".ll-ts").forEach(el => { el.style.display = showTs ? "inline" : "none"; });
      panel.querySelector("#ll-tp-ts-toggle").textContent = showTs ? "⏱ Hide Times" : "⏱ Timestamps";
    });

    panel.querySelector("#ll-tp-copy").addEventListener("click", () => {
      const body = panel.querySelector("#ll-tp-body");
      const text = body ? body.innerText.replace(/\d+:\d+\s*/g, "").replace(/\s+/g, " ").trim() : "";
      navigator.clipboard.writeText(text).then(() => {
        const btn = panel.querySelector("#ll-tp-copy");
        const orig = btn.textContent;
        btn.textContent = "✓ Copied!";
        setTimeout(() => { btn.textContent = orig; }, 2000);
      });
    });

    panel.querySelector("#ll-tp-send").addEventListener("click", () => captureSegment("full"));

    // Selection → floating button logic
    const tpBody = panel.querySelector("#ll-tp-body");
    tpBody.addEventListener("mouseup", () => {
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel ? sel.toString().trim() : "";
        if (text.length >= 20 && sel.rangeCount && tpBody.contains(sel.anchorNode)) {
          const r = sel.getRangeAt(0).getBoundingClientRect();
          selBtn.style.left = `${window.scrollX + r.left + r.width / 2 - 80}px`;
          selBtn.style.top  = `${window.scrollY + r.top - 44}px`;
          selBtn.style.display = "block";
          selBtn._text = text;
        } else {
          selBtn.style.display = "none";
        }
      }, 10);
    });

    document.addEventListener("mousedown", (e) => {
      if (e.target !== selBtn) selBtn.style.display = "none";
    });

    selBtn.addEventListener("click", () => {
      const text = selBtn._text;
      selBtn.style.display = "none";
      if (!text) return;
      const title = document.title.replace(" - YouTube", "").trim();
      const payload = { text: `[YouTube: ${title}]\n\n${text}`, sourceType: "video" };
      chrome.runtime.sendMessage({ type: "OPEN_SIDEBAR_WITH_TEXT", payload });
      window.dispatchEvent(new CustomEvent("__lifeline_open_sidebar__", { detail: payload }));
    });

    return panel;
  }

  async function toggleTranscriptPanel() {
    transcriptVisible = !transcriptVisible;
    if (transcriptPanelEl) transcriptPanelEl.style.display = transcriptVisible ? "block" : "none";
    const btn = document.getElementById("ll-yt-toggle-panel");
    if (btn) btn.textContent = transcriptVisible ? "✕ Hide Transcript" : "📄 Transcript Panel";
    if (transcriptVisible) await loadTranscriptIntoPanel();
  }

  async function loadTranscriptIntoPanel() {
    if (!transcriptPanelEl) return;
    const body = transcriptPanelEl.querySelector("#ll-tp-body");
    if (!body) return;

    // Try existing segments first
    let segs = getTranscriptSegments();
    if (!segs.length) {
      await openTranscriptPanel();
      await sleep(1400);
      segs = getTranscriptSegments();
    }

    if (!segs.length) {
      body.innerHTML = `<div style="text-align:center;padding:32px;color:rgba(255,255,255,0.3);">
        Transcript not available for this video.<br>
        <span style="font-size:11px;display:block;margin-top:6px;opacity:0.7;">Enable captions in the video player or use YouTube's "Show transcript" button.</span>
      </div>`;
      return;
    }

    renderSegmentsToPanel(segs, body);
    startPanelAutoScroll(body);
  }

  function getTranscriptSegments() {
    return Array.from(document.querySelectorAll(
      "ytd-transcript-segment-renderer, [class*='transcript-segment']"
    ));
  }

  function renderSegmentsToPanel(segs, body) {
    body.innerHTML = "";
    const wc = transcriptPanelEl.querySelector("#ll-tp-wc");
    let words = 0;

    segs.forEach((seg, i) => {
      const timeEl = seg.querySelector("[class*='timestamp'], .segment-timestamp");
      const textEl = seg.querySelector("[class*='text'], .segment-text, yt-formatted-string");
      const timeStr = timeEl ? timeEl.textContent.trim() : "";
      const text    = textEl ? cleanText(textEl.textContent) : cleanText(seg.textContent);
      if (!text) return;
      words += text.split(/\s+/).length;

      const span = document.createElement("span");
      span.dataset.idx  = String(i);
      span.dataset.tsec = timeStr ? String(parseTimestamp(timeStr)) : "0";
      span.style.cssText = "display:inline;";

      if (timeStr) {
        const ts = document.createElement("span");
        ts.className = "ll-ts";
        ts.style.cssText = "display:none;color:rgba(120,200,64,0.6);font-size:10px;font-weight:700;cursor:pointer;margin-right:4px;";
        ts.textContent = timeStr;
        ts.title = "Click to seek";
        ts.addEventListener("click", () => {
          const v = document.querySelector("video");
          if (v) v.currentTime = parseTimestamp(timeStr);
        });
        span.appendChild(ts);
        span.appendChild(document.createTextNode(" "));
      }
      span.appendChild(document.createTextNode(text + " "));
      body.appendChild(span);
    });

    if (wc) wc.textContent = `${words.toLocaleString()} words`;
  }

  function startPanelAutoScroll(body) {
    setInterval(() => {
      if (!autoScrollTranscript || !transcriptVisible) return;
      const video = document.querySelector("video");
      if (!video) return;
      const ct = video.currentTime;

      let best = null;
      for (const sp of body.querySelectorAll("span[data-tsec]")) {
        if (parseFloat(sp.dataset.tsec) <= ct) best = sp;
        else break;
      }
      if (!best) return;

      // Highlight active line
      body.querySelectorAll("span[data-idx]").forEach(s => {
        s.style.background = ""; s.style.borderRadius = "";
      });
      best.style.background = "rgba(120,200,64,0.13)";
      best.style.borderRadius = "3px";

      // Auto-scroll to it
      const br = body.getBoundingClientRect();
      const er = best.getBoundingClientRect();
      if (er.top < br.top + 20 || er.top > br.bottom - 40) {
        best.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 2000);
  }

  // ── Live Caption Watcher ──────────────────────────────────────────────────────
  function startLiveCaptionWatcher() {
    if (liveWatcherInterval) clearInterval(liveWatcherInterval);

    liveWatcherInterval = setInterval(() => {
      const video = document.querySelector("video");
      if (!video || video.paused || video.ended) return;

      const caption = readVisibleSubtitles();
      if (caption && caption !== lastCaptionText && caption.length > 10) {
        lastCaptionText = caption;
        // Avoid exact duplicates at end of buffer
        if (captionBuffer[captionBuffer.length - 1] !== caption) {
          captionBuffer.push(caption);
        }
      }

      const now = Date.now();
      // Fire when: ≥10 new captions AND ≥45 s since last generation AND not already generating
      if (captionBuffer.length >= 10 && (now - lastGenTime) > 45000 && !isGeneratingLive) {
        const batch = captionBuffer.splice(0);
        lastGenTime = now;
        generateLiveCards(batch.join(" "));
      }
    }, 3000);
  }

  function generateLiveCards(text) {
    if (isGeneratingLive) return;
    isGeneratingLive = true;
    const title = document.title.replace(" - YouTube", "").trim();

    chrome.runtime.sendMessage(
      { type: "GENERATE_CARDS_IN_BACKGROUND",
        payload: { text: `[YouTube: ${title}]\n\n${text}`, sourceType: "video" } },
      (res) => {
        isGeneratingLive = false;
        if (chrome.runtime.lastError || !res?.ok || !res.data?.cards?.length) return;
        const cards = res.data.cards.slice(0, 3);
        const topic = res.data.topic || "Medical Topic";
        const detail = { liveCards: cards, topic, videoTitle: title };
        // Bridge to content.js
        window.dispatchEvent(new CustomEvent("__lifeline_open_sidebar__", { detail }));
        document.dispatchEvent(new CustomEvent("__lifeline_from_youtube__", { detail }));
      }
    );
  }

  // ── Existing capture logic ────────────────────────────────────────────────────
  async function captureSegment(mode) {
    const status = document.getElementById("ll-yt-status");
    setStatus("Capturing transcript…", status);
    try {
      const text = await getTranscriptText(mode);
      if (!text || text.length < 20) {
        setStatus("⚠ Transcript not available. Open the Transcript Panel first.", status, true);
        return;
      }
      const title = document.title.replace(" - YouTube", "").trim();
      const payload = { text: `[YouTube: ${title}]\n\n${text}`, sourceType: "video" };
      chrome.runtime.sendMessage({ type: "OPEN_SIDEBAR_WITH_TEXT", payload });
      window.dispatchEvent(new CustomEvent("__lifeline_open_sidebar__", { detail: payload }));
      setStatus(`✓ ${text.split(" ").length} words captured — sidebar opening…`, status);
      setTimeout(() => { if (status) status.style.display = "none"; }, 4000);
    } catch (err) {
      setStatus("⚠ " + err.message, status, true);
    }
  }

  function setStatus(msg, el, isErr = false) {
    if (!el) return;
    el.style.display   = "block";
    el.style.color     = isErr ? "rgba(248,113,113,0.85)" : "rgba(74,222,128,0.85)";
    el.style.borderColor = isErr ? "rgba(248,113,113,0.2)"  : "rgba(74,222,128,0.2)";
    el.style.background  = isErr ? "rgba(248,113,113,0.07)" : "rgba(74,222,128,0.07)";
    el.textContent = msg;
  }

  // ── Transcript fetching ───────────────────────────────────────────────────────
  async function getTranscriptText(mode) {
    let text = readTranscriptPanel(mode);
    if (text) return text;

    const opened = await openTranscriptPanel();
    if (opened) {
      await sleep(1200);
      text = readTranscriptPanel(mode);
      if (text) return text;
    }
    text = readCaptionTrack(mode);
    if (text) return text;
    return readVisibleSubtitles();
  }

  function readTranscriptPanel(mode) {
    const segs = getTranscriptSegments();
    if (!segs.length) return null;

    const video = document.querySelector("video");
    const ct    = video ? video.currentTime : 0;

    if (mode === "current") {
      let best = segs[0];
      for (const seg of segs) {
        const te = seg.querySelector("[class*='timestamp'], .segment-timestamp");
        if (te && parseTimestamp(te.textContent.trim()) <= ct) best = seg;
      }
      return best ? cleanText(best.querySelector("[class*='text'], .segment-text")?.textContent || "") : null;
    }
    if (mode === "recent") {
      const recent = segs.filter(seg => {
        const te = seg.querySelector("[class*='timestamp'], .segment-timestamp");
        if (!te) return false;
        const t = parseTimestamp(te.textContent.trim());
        return t >= ct - 60 && t <= ct;
      });
      return (recent.length ? recent : segs.slice(-8)).map(extractSegText).join(" ");
    }
    return segs.map(extractSegText).join(" ");
  }

  function extractSegText(seg) {
    const el = seg.querySelector("[class*='text'], .segment-text, yt-formatted-string");
    return cleanText(el ? el.textContent : seg.textContent);
  }

  async function openTranscriptPanel() {
    const moreBtn = document.querySelector("tp-yt-paper-button#expand, #expand");
    if (moreBtn) { moreBtn.click(); await sleep(300); }

    const btns = Array.from(document.querySelectorAll("button, yt-button-renderer"));
    const tBtn = btns.find(b => b.textContent.toLowerCase().includes("transcript"));
    if (tBtn) { tBtn.click(); return true; }

    const moreAct = document.querySelector("#button-shape button[aria-label*='More'], ytd-menu-renderer button");
    if (moreAct) {
      moreAct.click(); await sleep(400);
      const items = Array.from(document.querySelectorAll("ytd-menu-service-item-renderer, tp-yt-paper-item"));
      const it = items.find(i => i.textContent.toLowerCase().includes("transcript"));
      if (it) { it.click(); return true; }
    }
    return false;
  }

  function readCaptionTrack(mode) {
    const video = document.querySelector("video");
    if (!video?.textTracks?.length) return null;
    const track = Array.from(video.textTracks).find(t => t.kind === "subtitles" || t.kind === "captions");
    if (!track) return null;
    const cues = Array.from(track.cues || []);
    if (!cues.length) return null;
    const ct = video.currentTime;
    if (mode === "current") {
      const cue = cues.find(c => c.startTime <= ct && c.endTime >= ct);
      return cue ? cleanText(cue.text) : null;
    }
    if (mode === "recent") {
      return cues.filter(c => c.startTime >= ct - 60 && c.startTime <= ct).map(c => cleanText(c.text)).join(" ");
    }
    return cues.map(c => cleanText(c.text)).join(" ");
  }

  function readVisibleSubtitles() {
    const el = document.querySelector(".ytp-caption-segment, .caption-visual-line, .captions-text");
    return el ? cleanText(el.textContent) : null;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────
  function parseTimestamp(str) {
    const parts = (str || "0").split(":").map(Number).reverse();
    return (parts[2] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[0] || 0);
  }
  function cleanText(str) {
    return (str || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ── Bridge ────────────────────────────────────────────────────────────────────
  window.addEventListener("__lifeline_open_sidebar__", (e) => {
    document.dispatchEvent(new CustomEvent("__lifeline_from_youtube__", { detail: e?.detail }));
  });

  // ── Start ─────────────────────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 500);
  }

})();
