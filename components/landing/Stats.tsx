const stats = [
  { value: "50,000+", label: "Questions in Bank", suffix: "" },
  { value: "94", label: "Step 1 Pass Rate", suffix: "%" },
  { value: "12", label: "Body Systems Covered", suffix: "" },
  { value: "8×", label: "Better Retention vs. Traditional", suffix: "" },
];

const schoolLogos = [
  "Harvard Medical School",
  "Johns Hopkins",
  "Mayo Clinic",
  "Stanford Medicine",
  "UCSF",
  "Columbia P&S",
  "Yale School of Medicine",
  "Penn Medicine",
];

export default function Stats() {
  return (
    <section className="relative py-20 bg-navy overflow-hidden">
      {/* Divider */}
      <div className="section-divider mb-16" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* School trust strip */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-white/30 uppercase tracking-widest mb-8">
            Trusted by students at top medical schools
          </p>
          {/* Scrolling marquee */}
          <div className="relative overflow-hidden">
            <div
              className="flex gap-10 items-center"
              style={{ animation: "marquee 25s linear infinite" }}
            >
              {[...schoolLogos, ...schoolLogos].map((school, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 text-sm font-semibold text-white/20 hover:text-white/40 transition-colors whitespace-nowrap tracking-wide"
                >
                  {school}
                </div>
              ))}
            </div>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-navy to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-navy to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ value, label, suffix }) => (
            <div
              key={label}
              className="relative text-center p-8 rounded-3xl glass-card border border-white/[0.06] group hover:border-accent-green/20 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,200,150,0.06), transparent 70%)" }} />
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl font-black mb-2">
                  <span className="gradient-text-warm">{value}</span>
                  <span className="text-accent-green">{suffix}</span>
                </div>
                <div className="text-sm text-white/50 font-medium leading-snug">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
