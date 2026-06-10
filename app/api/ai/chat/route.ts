/**
 * Lifeline AI Tutor — Next.js API Route
 * Streams responses from Claude (Anthropic) if API key is set.
 * Falls back to a smart local medical knowledge engine if not.
 */

import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Dr. Lifeline, an expert medical education AI tutor for medical students.
Your teaching style:
- NEVER give the answer directly — guide the student to discover it through Socratic questioning
- Ask ONE question at a time, wait for the answer, then respond
- When a student is wrong, don't say "wrong" — ask a question that reveals the gap
- When a student is right, briefly affirm, then push one level deeper
- Focus on MECHANISMS, not memorization
- Keep responses concise (3-5 sentences max) — this is active learning, not lecturing
- Occasionally use clinical scenarios to ground abstract concepts
- Adjust difficulty to the stated level: ${""/* filled at runtime */}

Format: Plain text only. No markdown. No bullet points in responses — conversational sentences only.`;

export async function POST(req: NextRequest) {
  const { messages, level, mode } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ── Claude API (streaming) ────────────────────────────────────────────────
  if (apiKey) {
    try {
      const systemWithLevel = SYSTEM_PROMPT.replace("${}", level || "Step 1");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: systemWithLevel,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text || "";
        return NextResponse.json({ content: text, source: "claude" });
      }
    } catch (err) {
      console.error("[AI Route] Claude error:", err);
    }
  }

  // ── Smart local fallback ─────────────────────────────────────────────────
  const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content || "";
  const conversationLength = messages.length;
  const response = localMedicalAI(lastUserMessage, conversationLength, level, mode);

  return NextResponse.json({ content: response, source: "local" });
}

// ─── Local medical AI engine ──────────────────────────────────────────────────

function localMedicalAI(input: string, turn: number, level: string, mode: string): string {
  const lower = input.toLowerCase();

  // ── Pimp mode: more direct questioning ───────────────────────────────────
  if (mode === "pimp") {
    return getPimpResponse(lower, turn);
  }

  // ── Detect what the student is talking about ──────────────────────────────
  const topic = detectTopic(lower);
  const answerQuality = evaluateAnswer(lower);

  // ── Generate Socratic response ────────────────────────────────────────────
  if (answerQuality === "correct") {
    return getCorrectFollowUp(topic, turn);
  } else if (answerQuality === "partial") {
    return getPartialResponse(topic, lower);
  } else if (answerQuality === "wrong") {
    return getWrongGuide(topic, lower);
  }

  // Default: ask a probing question
  return getOpeningQuestion(topic, turn, level);
}

function detectTopic(text: string): string {
  if (text.includes("heart failure") || text.includes("chf") || text.includes("ejection fraction")) return "heart_failure";
  if (text.includes("aortic") || text.includes("dissection")) return "aortic_dissection";
  if (text.includes("nephrotic") || text.includes("proteinuria") || text.includes("albumin")) return "nephrotic";
  if (text.includes("nephritic") || text.includes("hematuria") || text.includes("rbc cast")) return "nephritic";
  if (text.includes("pneumonia") || text.includes("consolidation") || text.includes("lobar")) return "pneumonia";
  if (text.includes("copd") || text.includes("emphysema") || text.includes("chronic bronchitis")) return "copd";
  if (text.includes("mi") || text.includes("myocardial") || text.includes("troponin") || text.includes("stemi")) return "mi";
  if (text.includes("stroke") || text.includes("tpa") || text.includes("ischemic") || text.includes("hemorrhagic")) return "stroke";
  if (text.includes("diabetes") || text.includes("insulin") || text.includes("hyperglycemia")) return "diabetes";
  if (text.includes("thyroid") || text.includes("hypothyroid") || text.includes("hyperthyroid")) return "thyroid";
  if (text.includes("anemia") || text.includes("hemoglobin") || text.includes("ferritin")) return "anemia";
  if (text.includes("sepsis") || text.includes("bacteremia") || text.includes("sirs")) return "sepsis";
  if (text.includes("pulmonary embolism") || text.includes("pe") || text.includes("dvt")) return "pe";
  if (text.includes("acid") || text.includes("base") || text.includes("ph ") || text.includes("bicarbonate")) return "acid_base";
  if (text.includes("raas") || text.includes("aldosterone") || text.includes("renin")) return "raas";
  return "general";
}

function evaluateAnswer(text: string): "correct" | "partial" | "wrong" | "unknown" {
  const positiveSignals = ["because", "mechanism", "due to", "leads to", "results in", "causes", "pathway", "receptor", "inhibit", "activate", "increase", "decrease", "compensate"];
  const veryShort = text.split(" ").length < 4;

  if (veryShort) return "wrong";
  const depth = positiveSignals.filter((s) => text.includes(s)).length;
  if (depth >= 2) return "correct";
  if (depth === 1) return "partial";
  return "unknown";
}

function getCorrectFollowUp(topic: string, turn: number): string {
  const FOLLOW_UPS: Record<string, string[]> = {
    heart_failure: [
      "Good — now explain why giving fluids to a heart failure patient can make things significantly worse. What does the Frank-Starling curve look like in a failing heart?",
      "Exactly right. So if the ejection fraction is preserved — HFpEF — why do those patients still have symptoms despite a normal EF? What's the underlying problem?",
      "Correct. Now, which medication has the strongest evidence for reducing mortality in HFrEF, and why does it take weeks to see the full benefit?",
    ],
    nephrotic: [
      "Good. Now — why does nephrotic syndrome cause hyperlipidemia? There are two mechanisms. Can you walk me through both?",
      "Exactly right. So if this patient develops a DVT, which specific proteins lost in the urine explain the hypercoagulable state?",
      "Correct. A child with nephrotic syndrome responds to steroids. Six months later it relapses. What's the most likely diagnosis and next management step?",
    ],
    aortic_dissection: [
      "Good. Now — BP is 190/110 in the right arm and 150/90 in the left arm. Why the difference, and what does it tell you about the dissection?",
      "Exactly. Type A involves the ascending aorta. Why is this a surgical emergency while Type B can sometimes be managed medically?",
      "Correct. What is your immediate pharmacologic target, and why do you use a beta-blocker before a vasodilator — not simultaneously?",
    ],
    general: [
      "Good thinking. Now push one level deeper — what is the underlying cellular or molecular mechanism?",
      "Exactly right. Now apply that concept clinically: how would you recognize this in a patient on rounds?",
      "Correct. What's the most high-yield complication of this condition that boards love to test?",
    ],
  };

  const options = FOLLOW_UPS[topic] || FOLLOW_UPS.general;
  return options[Math.min(turn % options.length, options.length - 1)];
}

function getPartialResponse(topic: string, input: string): string {
  const PARTIAL: Record<string, string> = {
    heart_failure: "You're on the right track. You mentioned the symptoms — now explain the mechanism. Why does a failing left ventricle cause pulmonary congestion specifically?",
    nephrotic: "Good start. You identified the protein loss — now connect the dots. How does losing albumin specifically lead to edema? Walk me through the Starling forces.",
    aortic_dissection: "You're thinking in the right direction. Now be more specific — what is the immediate priority in the first 30 minutes, before imaging?",
    nephritic: "Partially right. You mentioned hematuria — now explain what causes it at the glomerular level. What's happening to the GBM?",
    general: "You're on the right track. Can you be more specific about the mechanism? What's happening at the cellular or molecular level?",
  };
  return PARTIAL[topic] || PARTIAL.general;
}

function getWrongGuide(topic: string, input: string): string {
  const GUIDES: Record<string, string> = {
    heart_failure: "Let's back up. The heart is a pump. If it can't pump effectively, where does blood back up first? Think about the pulmonary vasculature.",
    nephrotic: "Not quite. Think about what's being lost in the urine — it's not just water. What protein maintains oncotic pressure in the bloodstream?",
    aortic_dissection: "Let's reframe. A dissection means the intima has torn. Blood is now traveling in a false lumen. What two things does that false lumen compress or obstruct?",
    acid_base: "Let's start with the basics. Look at the pH first — is it acidotic or alkalotic? Then check the CO2 and bicarbonate. Which one is moving in the expected direction?",
    general: "Let's approach this differently. What is the primary organ or system involved here? Start there and work outward.",
  };
  return GUIDES[topic] || GUIDES.general;
}

function getOpeningQuestion(topic: string, turn: number, level: string): string {
  const OPENERS: Record<string, string[]> = {
    heart_failure: [
      "You're on rounds. An 68-year-old with known heart failure comes in with worsening shortness of breath and 3+ pitting edema to the knees. Before I see this patient, what's your leading hypothesis for why he decompensated?",
      "Tell me — what is the single most important determinant of prognosis in heart failure with reduced ejection fraction?",
    ],
    nephrotic: [
      "A 6-year-old presents with periorbital edema and frothy urine. Spot urine protein to creatinine is 4.8. Walk me through your differential — what are the top causes of nephrotic syndrome in this age group?",
      "Before I tell you the biopsy result — based on the clinical scenario alone, what is the most likely diagnosis in a child with nephrotic syndrome after a URI?",
    ],
    aortic_dissection: [
      "Patient comes in with tearing chest pain radiating to the back. Blood pressure is asymmetric between arms. What's running through your head right now?",
      "You suspect aortic dissection. The patient is hemodynamically stable. Walk me through your next 10 minutes.",
    ],
    general: [
      "What organ system is most central to what you're studying right now? Tell me one concept you're struggling with — let's work through it together.",
      "Give me a case. Any disease you're studying — I'll play the attending and we'll work through it.",
      "What's the most confusing mechanism you've encountered this week? Describe it in your own words and I'll tell you where the reasoning breaks down.",
    ],
  };

  const options = OPENERS[topic] || OPENERS.general;
  return options[turn % options.length];
}

function getPimpResponse(input: string, turn: number): string {
  const PIMP: string[] = [
    "What's the most common cause of this presentation? Give me a one-word answer.",
    "Mechanism. Explain it in three sentences. Go.",
    "What's the first test you order and why?",
    "Gold standard test for this diagnosis?",
    "First-line treatment — drug class, not brand name.",
    "Most feared complication. What is it and why does it happen?",
    "How do you distinguish this from the most commonly confused diagnosis?",
    "A patient on this treatment develops a specific side effect. What is it and what's the mechanism?",
  ];
  return PIMP[turn % PIMP.length];
}
