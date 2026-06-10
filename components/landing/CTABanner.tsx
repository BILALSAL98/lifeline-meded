import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="relative py-32 overflow-hidden bg-surface-subtle">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div
          className="glow-orb absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,200,150,0.3), transparent 70%)",
          }}
        />
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,200,150,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,200,150,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="badge-pill inline-flex mb-8">
          <Sparkles className="w-3 h-3" />
          Early Access Open
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.02] mb-8">
          Your medical education
          <br />
          <span className="gradient-text">starts here.</span>
        </h2>

        <p className="text-lg sm:text-xl text-white/55 leading-relaxed max-w-2xl mx-auto mb-12">
          Join thousands of medical students who stopped studying harder and
          started studying smarter. The platform that changes how you learn,
          retain, and think clinically — starting day one.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold bg-accent-green hover:bg-accent-green-light text-navy transition-all duration-300 shadow-glow hover:shadow-glow-lg active:scale-95"
          >
            Get Early Access — Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-lg font-semibold text-white glass-card border border-white/10 hover:bg-white/[0.08] transition-all duration-300"
          >
            Schedule a demo
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/25">
          No credit card required · 7-day free trial · Cancel anytime
        </p>

        {/* Social proof mini strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: "12,000+", label: "Active students" },
            { value: "4.9/5", label: "Average rating" },
            { value: "94%", label: "Step 1 pass rate" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black gradient-text-warm">{value}</div>
              <div className="text-xs text-white/30 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
