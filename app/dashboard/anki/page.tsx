"use client";

export default function AnkiPage() {
  return (
    <div className="fixed inset-0 bg-[#050505]">
      <iframe
        src="/cards.html"
        className="w-full h-full border-none"
        title="Lifeline Anki Card Creator"
      />
    </div>
  );
}
