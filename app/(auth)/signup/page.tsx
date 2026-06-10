"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const programOptions = [
  "MD — Allopathic (MD)",
  "DO — Osteopathic (DO)",
  "Physician Assistant (PA)",
  "Nursing (NP/RN)",
  "International Medical Graduate (IMG)",
  "Resident / Fellow",
  "Other",
];

const yearOptions = ["Pre-med", "MS1", "MS2", "MS3", "MS4", "Resident", "Fellow", "Attending"];

const goalOptions = [
  { id: "step1", label: "USMLE Step 1", icon: "🎯" },
  { id: "step2", label: "USMLE Step 2 CK", icon: "📋" },
  { id: "comlex1", label: "COMLEX Level 1", icon: "🩺" },
  { id: "comlex2", label: "COMLEX Level 2", icon: "📝" },
  { id: "shelf", label: "Shelf Exams", icon: "📚" },
  { id: "clinical", label: "Clinical Skills", icon: "🏥" },
  { id: "retention", label: "Long-term Retention", icon: "🧠" },
  { id: "boards", label: "Boards & Beyond", icon: "⭐" },
];

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    program: "",
    year: "",
    school: "",
    goals: [] as string[],
  });

  const update = (key: keyof typeof form, value: string | string[]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleGoal = (id: string) => {
    const goals = form.goals.includes(id)
      ? form.goals.filter((g) => g !== id)
      : [...form.goals, id];
    update("goals", goals);
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    window.location.href = "/onboarding";
  };

  const stepLabels = ["Account", "Your Program", "Your Goals"];
  const progress = ((step - 1) / 2) * 100;

  return (
    <div className="w-full max-w-md">
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {stepLabels.map((label, i) => (
            <div key={label} className={cn(
              "flex items-center gap-2 text-xs font-medium",
              i + 1 < step ? "text-[#4ade80]" : i + 1 === step ? "text-white" : "text-white/25"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                i + 1 < step ? "bg-[#4ade80] text-[#06080f]" :
                i + 1 === step ? "bg-white/10 border border-white/30 text-white" :
                "bg-white/[0.05] text-white/25"
              )}>
                {i + 1 < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </div>
              <span className="hidden sm:block">{label}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-white/[0.07] rounded-full">
          <div className="h-full bg-gradient-to-r from-[#4ade80] to-[#2dd4bf] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step 1 — Account */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-white mb-1">Create your account</h1>
            <p className="text-white/40">Your Lifeline starts here.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="auth-label">First name</label>
              <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
                placeholder="Alex" className="auth-input mt-1.5" />
            </div>
            <div>
              <label className="auth-label">Last name</label>
              <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
                placeholder="Morgan" className="auth-input mt-1.5" />
            </div>
          </div>

          <div>
            <label className="auth-label">Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
              placeholder="you@medschool.edu" className="auth-input mt-1.5" />
          </div>

          <div>
            <label className="auth-label">Password</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
              placeholder="8+ characters" className="auth-input mt-1.5" />
          </div>

          <button onClick={handleNext}
            disabled={!form.firstName || !form.email || !form.password}
            className="auth-btn-primary w-full">
            Continue <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-sm text-white/35">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4ade80] hover:text-white font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      )}

      {/* Step 2 — Program */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-1">Tell us about your program</h2>
            <p className="text-white/40 text-sm">We&apos;ll personalize your experience accordingly.</p>
          </div>

          <div>
            <label className="auth-label mb-2">Program type</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {programOptions.map((p) => (
                <button key={p} onClick={() => update("program", p)}
                  className={cn(
                    "text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150",
                    form.program === p
                      ? "border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]"
                      : "border-white/[0.07] bg-white/[0.03] text-white/60 hover:text-white hover:border-white/15"
                  )}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="auth-label">Year / Level</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {yearOptions.map((y) => (
                <button key={y} onClick={() => update("year", y)}
                  className={cn(
                    "px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150",
                    form.year === y
                      ? "border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]"
                      : "border-white/[0.07] bg-white/[0.03] text-white/55 hover:text-white hover:border-white/15"
                  )}>
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="auth-label">School (optional)</label>
            <input value={form.school} onChange={(e) => update("school", e.target.value)}
              placeholder="University of Michigan Medical School" className="auth-input mt-1.5" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="auth-btn-secondary flex-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleNext} disabled={!form.program || !form.year}
              className="auth-btn-primary flex-1">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Goals */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-1">What are your goals?</h2>
            <p className="text-white/40 text-sm">Select all that apply.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {goalOptions.map(({ id, label, icon }) => (
              <button key={id} onClick={() => toggleGoal(id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-150",
                  form.goals.includes(id)
                    ? "border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]"
                    : "border-white/[0.07] bg-white/[0.03] text-white/55 hover:text-white hover:border-white/15"
                )}>
                <span className="text-lg">{icon}</span>
                <span className="leading-tight">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="auth-btn-secondary flex-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleSubmit} disabled={loading || form.goals.length === 0}
              className="auth-btn-primary flex-1">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>

          <p className="text-center text-xs text-white/25">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-white/45 hover:text-white transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-white/45 hover:text-white transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      )}

      <style>{`
        .auth-label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.3); }
        .auth-input {
          display: block; width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 16px; font-size: 0.875rem; color: rgba(255,255,255,0.85); outline: none;
          transition: border-color 0.2s;
        }
        .auth-input:focus { border-color: rgba(74,222,128,0.4); }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 24px; border-radius: 14px; font-size: 0.875rem; font-weight: 700;
          background: #22c55e; color: #06080f; border: none; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 0 20px rgba(34,197,94,0.2);
        }
        .auth-btn-primary:hover { background: #4ade80; box-shadow: 0 0 30px rgba(34,197,94,0.35); }
        .auth-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .auth-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn-secondary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 24px; border-radius: 14px; font-size: 0.875rem; font-weight: 600;
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: all 0.2s;
        }
        .auth-btn-secondary:hover { background: rgba(255,255,255,0.08); color: white; }
      `}</style>
    </div>
  );
}
