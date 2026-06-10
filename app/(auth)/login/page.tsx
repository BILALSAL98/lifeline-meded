"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    window.location.href = "/dashboard";
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
        <p className="text-white/45">Sign in to continue your Lifeline journey.</p>
      </div>

      {/* Social logins */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Continue with Google", icon: "G" },
          { label: "Continue with Apple", icon: "🍎" },
        ].map(({ label, icon }) => (
          <button key={label}
            className="flex items-center justify-center gap-2.5 py-3 rounded-xl
                       bg-white/[0.04] border border-white/[0.08] text-sm text-white/70
                       hover:bg-white/[0.08] hover:text-white transition-all duration-200 active:scale-95">
            <span className="text-base font-bold">{icon}</span>
            <span className="hidden sm:block">{label.split(" with ")[1]}</span>
            <span className="sm:hidden">{icon === "G" ? "Google" : "Apple"}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-white/[0.07]" />
        <span className="text-xs text-white/25">or sign in with email</span>
        <div className="flex-1 h-px bg-white/[0.07]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@medschool.edu"
            required
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                       px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none
                       focus:border-[#4ade80]/40 focus:ring-1 focus:ring-[#4ade80]/15
                       transition-all duration-200"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-white/30">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-[#4ade80] hover:text-white transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                         px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 outline-none
                         focus:border-[#4ade80]/40 focus:ring-1 focus:ring-[#4ade80]/15
                         transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl
                     bg-[#22c55e] hover:bg-[#4ade80] disabled:opacity-50 text-[#06080f]
                     font-bold text-sm transition-all duration-200 active:scale-[0.98]
                     shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Sign in <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-white/35 mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#4ade80] hover:text-white font-semibold transition-colors">
          Sign up free →
        </Link>
      </p>
    </div>
  );
}
