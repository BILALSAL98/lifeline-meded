import Link from "next/link";
import { LifelineLogo } from "@/components/ui/LifelineLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060810] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link href="/">
          <LifelineLogo width={150} height={48} />
        </Link>
        <p className="text-sm text-white/30">
          Need help?{" "}
          <a href="mailto:support@lifeline-meded.com" className="text-[#4ade80] hover:text-white transition-colors">
            Contact us
          </a>
        </p>
      </div>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-10 blur-3xl rounded-full"
          style={{ background: "radial-gradient(ellipse, #00C896, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-8 blur-3xl rounded-full"
          style={{ background: "radial-gradient(ellipse, #3B82F6, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        {children}
      </main>

      <footer className="text-center py-6 text-xs text-white/20">
        © {new Date().getFullYear()} Lifeline Medical Education ·{" "}
        <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
        {" · "}
        <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
      </footer>
    </div>
  );
}
