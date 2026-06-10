"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, XCircle } from "lucide-react";
import {
  type FlashCard,
  type CardType,
  type DifficultyLevel,
  type BoardRelevance,
  type WeaknessReason,
  CARD_TYPE_LABELS,
  WEAKNESS_REASON_LABELS,
} from "@/lib/recall-types";
import { cn } from "@/lib/utils";

interface CardEditorProps {
  card: FlashCard | null;
  onSave: (card: FlashCard) => void;
  onClose: () => void;
}

const BOARD_OPTIONS: { value: BoardRelevance; label: string }[] = [
  { value: "step1", label: "Step 1" },
  { value: "step2", label: "Step 2" },
  { value: "both", label: "Step 1 & 2" },
  { value: "clinical", label: "Clinical" },
  { value: "comlex", label: "COMLEX" },
];

const DECK_PRESETS = [
  "Step 1::Renal::Nephrotic Syndrome",
  "Step 1::Cardiology::Heart Failure",
  "Step 1::Pulmonology::COPD & Asthma",
  "Step 1::Neurology::Stroke",
  "Step 1::Hematology::Anemia",
  "Step 2::OBGYN::Ectopic Pregnancy",
  "Step 2::Internal Medicine::Sepsis",
  "Clinical Rotations::Internal Medicine",
  "COMLEX::OMM::Sacral Diagnosis",
  "Weakness Deck::Review",
];

export default function CardEditor({ card, onSave, onClose }: CardEditorProps) {
  const [edited, setEdited] = useState<FlashCard | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [showDeckPresets, setShowDeckPresets] = useState(false);

  useEffect(() => {
    if (card) setEdited({ ...card });
  }, [card]);

  if (!edited) return null;

  const update = <K extends keyof FlashCard>(key: K, value: FlashCard[K]) => {
    setEdited((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !edited.tags.includes(tag)) {
      update("tags", [...edited.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    update("tags", edited.tags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
                      bg-[#0d1117] rounded-3xl border border-white/[0.08]
                      shadow-[0_40px_120px_rgba(0,0,0,0.8)]">

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4
                        bg-[#0d1117] border-b border-white/[0.06] z-10 rounded-t-3xl">
          <h2 className="text-lg font-bold text-white">Edit Card</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(edited)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22c55e]
                         hover:bg-[#4ade80] text-[#06080f] text-sm font-bold
                         transition-all duration-200 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Card
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-white/40 hover:text-white hover:bg-white/[0.06]
                         transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Card type */}
          <div>
            <label className="field-label">Card Type</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(Object.keys(CARD_TYPE_LABELS) as CardType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => update("type", type)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150",
                    edited.type === type
                      ? "bg-[#4ade80]/15 border-[#4ade80]/40 text-[#4ade80]"
                      : "bg-white/[0.03] border-white/[0.07] text-white/45 hover:text-white/70"
                  )}
                >
                  {CARD_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Front */}
          <div>
            <label className="field-label">
              {edited.type === "cloze" ? "Cloze Text" : "Question / Front"}
            </label>
            {edited.type === "cloze" ? (
              <>
                <textarea
                  value={edited.clozeText ?? ""}
                  onChange={(e) => update("clozeText", e.target.value)}
                  rows={3}
                  placeholder="Use {{c1::answer}} markers. e.g. Nephrotic syndrome causes edema due to {{c1::hypoalbuminemia}}."
                  className="field-textarea mt-2 font-mono text-sm"
                />
                <p className="text-[10px] text-white/25 mt-1.5">
                  Syntax: {"{{c1::answer}}"} — use c1, c2, c3 for multiple blanks
                </p>
              </>
            ) : (
              <textarea
                value={edited.front}
                onChange={(e) => update("front", e.target.value)}
                rows={3}
                placeholder="Question or prompt..."
                className="field-textarea mt-2"
              />
            )}
          </div>

          {/* Back (only for non-cloze) */}
          {edited.type !== "cloze" && (
            <div>
              <label className="field-label">Answer / Back</label>
              <textarea
                value={edited.back}
                onChange={(e) => update("back", e.target.value)}
                rows={4}
                placeholder="Complete answer..."
                className="field-textarea mt-2"
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="field-label">Explanation / Clinical Pearl</label>
            <textarea
              value={edited.explanation}
              onChange={(e) => update("explanation", e.target.value)}
              rows={2}
              placeholder="Why this card matters, mnemonics, clinical context..."
              className="field-textarea mt-2"
            />
          </div>

          {/* Deck */}
          <div>
            <label className="field-label">Deck</label>
            <div className="relative mt-2">
              <input
                type="text"
                value={edited.deck}
                onChange={(e) => update("deck", e.target.value)}
                onFocus={() => setShowDeckPresets(true)}
                onBlur={() => setTimeout(() => setShowDeckPresets(false), 200)}
                placeholder="e.g. Step 1::Renal::Nephrotic Syndrome"
                className="field-input font-mono text-sm"
              />
              {showDeckPresets && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#111827]
                                border border-white/[0.08] rounded-xl overflow-hidden
                                shadow-xl z-20">
                  {DECK_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onMouseDown={() => update("deck", preset)}
                      className="w-full text-left px-4 py-2.5 text-sm font-mono
                                 text-white/60 hover:bg-white/[0.06] hover:text-white
                                 transition-colors border-b border-white/[0.04] last:border-0"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="field-label">Tags</label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {edited.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg
                             bg-[#4ade80]/10 border border-[#4ade80]/20
                             text-xs text-[#4ade80] font-medium"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <XCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Add tag..."
                className="field-input flex-1 text-sm"
              />
              <button
                onClick={addTag}
                className="px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.07]
                           text-white/50 hover:text-white hover:bg-white/[0.09]
                           transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Difficulty + Board Relevance */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="field-label">Difficulty</label>
              <div className="flex gap-2 mt-2">
                {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => update("difficulty", d)}
                    className={cn(
                      "w-9 h-9 rounded-xl text-sm font-bold border transition-all duration-150",
                      edited.difficulty === d
                        ? "bg-[#4ade80]/20 border-[#4ade80]/50 text-[#4ade80]"
                        : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/70"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Board Relevance</label>
              <select
                value={edited.boardRelevance}
                onChange={(e) => update("boardRelevance", e.target.value as BoardRelevance)}
                className="field-input mt-2 text-sm"
              >
                {BOARD_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weakness reason */}
          <div>
            <label className="field-label">Weakness Reason</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {(Object.entries(WEAKNESS_REASON_LABELS) as [WeaknessReason, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => update("weaknessReason", edited.weaknessReason === key ? undefined : key)}
                  className={cn(
                    "text-left text-sm px-3 py-2 rounded-xl border transition-all duration-150",
                    edited.weaknessReason === key
                      ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                      : "border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/15"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .field-label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.3); }
        .field-textarea {
          display: block; width: 100%; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 16px; color: rgba(255,255,255,0.8);
          resize: none; outline: none; transition: border-color 0.2s;
          line-height: 1.6;
        }
        .field-textarea:focus { border-color: rgba(74,222,128,0.4); }
        .field-input {
          display: block; width: 100%; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 10px 16px; color: rgba(255,255,255,0.8);
          outline: none; transition: border-color 0.2s;
        }
        .field-input:focus { border-color: rgba(74,222,128,0.4); }
        select.field-input { appearance: none; }
      `}</style>
    </div>
  );
}
