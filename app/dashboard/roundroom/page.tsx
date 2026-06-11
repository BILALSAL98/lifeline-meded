"use client";

export default function RoundRoomPage() {
  return (
    <div className="fixed inset-0 bg-[#090d1a]">
      <iframe
        src="/roundroom.html"
        className="w-full h-full border-none"
        title="Lifeline Round Room"
        allow="microphone; camera"
      />
    </div>
  );
}
