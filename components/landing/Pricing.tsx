"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "Lifeline Free",
    tagline: "Start your journey",
    monthlyPrice: 0,
    annualPrice: 0,
    description:
      "Everything you need to see if Lifeline changes how you study. No credit card required.",
    cta: "Get started — free",
    ctaHref: "/signup",
    featured: false,
    features: [
      "Access to 500 practice questions",
      "AI Tutor (10 sessions/month)",
      "2 organ system content modules",
      "Daily Lifeline Drill (10 questions)",
      "Basic flashcard generation",
      "Knowledge Graph (view only)",
      "Community access (Lifeline Nexus)",
    ],
    notIncluded: [
      "Full question bank (50,000+)",
      "Unlimited AI Tutor sessions",
      "Lifeline Rounds™",
      "AI Video Generation",
      "Study Copilot",
    ],
  },
  {
    id: "pro",
    name: "Lifeline Pro",
    tagline: "Built for board prep",
    monthlyPrice: 49,
    annualPrice: 39,
    description:
      "The full Lifeline experience. Every ecosystem, every feature — everything a student needs from MS1 through Step 2.",
    cta: "Start 7-day free trial",
    ctaHref: "/signup?plan=pro",
    featured: true,
    badge: "Most Popular",
    features: [
      "Full question bank (50,000+ questions)",
      "Unlimited AI Tutor sessions",
      "All 12 organ system content modules",
      "Lifeline Rounds™ (all difficulty levels)",
      "AI Video Generation",
      "Study Copilot with predictive alerts",
      "Full Knowledge Graph with mastery tracking",
      "Unlimited flashcards + spaced repetition",
      "COMLEX prep module (OMM + osteopathic)",
      "Clinical module (7 clerkship tracks)",
      "SOAP Note AI grader",
      "Step 1 & Step 2 dedicated pathways",
      "Priority support",
    ],
    notIncluded: [],
  },
  {
    id: "institutional",
    name: "Institutional",
    tagline: "For programs & schools",
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: "Custom",
    description:
      "Built for medical schools, PA programs, and residency programs. Includes faculty tools, custom content, and program analytics.",
    cta: "Contact sales",
    ctaHref: "/contact",
    featured: false,
    features: [
      "Everything in Lifeline Pro",
      "Faculty dashboard + content authoring",
      "Custom curriculum modules",
      "Cohort-level analytics",
      "LMS integration (Canvas, Blackboard)",
      "Dedicated account manager",
      "SSO / institution login",
      "Custom branding options",
      "API access",
      "SLA guarantee",
    ],
    notIncluded: [],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-28 bg-navy overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="glow-orb absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-10"
          style={{ background: "radial-gradient(ellipse, #00C896, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="badge-pill inline-flex mb-6">Pricing</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            Simple pricing.{" "}
            <span className="gradient-text">Serious results.</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/50 mb-8">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-2xl bg-surface glass-card border border-white/[0.08]">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                !annual
                  ? "bg-white text-navy shadow-md"
                  : "text-white/50 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                annual
                  ? "bg-white text-navy shadow-md"
                  : "text-white/50 hover:text-white"
              )}
            >
              Annual
              <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-3xl p-8 transition-all duration-300",
                plan.featured
                  ? "bg-gradient-to-b from-accent-green/15 to-surface-card border border-accent-green/25 shadow-[0_0_60px_rgba(0,200,150,0.12)] lg:-mt-4"
                  : "glass-card border border-white/[0.06]"
              )}
            >
              {/* Featured badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-green text-navy text-xs font-black shadow-glow">
                    <Zap className="w-3 h-3" fill="currentColor" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">
                  {plan.tagline}
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{plan.name}</h3>
                <div className="flex items-end gap-2 mb-4">
                  {plan.priceLabel ? (
                    <span className="text-4xl font-black text-white">{plan.priceLabel}</span>
                  ) : (
                    <>
                      <span className="text-5xl font-black text-white">
                        ${annual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-white/40 text-sm mb-2">/month</span>
                    </>
                  )}
                </div>
                {annual && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-white/30">
                    Billed annually · ${plan.annualPrice! * 12}/year
                    <span className="text-accent-green ml-2">
                      (save ${(plan.monthlyPrice! - plan.annualPrice!) * 12}/year)
                    </span>
                  </p>
                )}
                <p className="text-sm text-white/50 mt-4 leading-relaxed">{plan.description}</p>
              </div>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={cn(
                  "block w-full text-center py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 mb-8 active:scale-95",
                  plan.featured
                    ? "bg-accent-green hover:bg-accent-green-light text-navy shadow-glow hover:shadow-glow-lg"
                    : "glass-card border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20"
                )}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0",
                        plan.featured ? "text-accent-green" : "text-white/40"
                      )}
                    />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-sm text-white/30">
            All plans include a 7-day free trial. No credit card required to start.
            Student verification available for additional discounts.
          </p>
        </div>
      </div>
    </section>
  );
}
