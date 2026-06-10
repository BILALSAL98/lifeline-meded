"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LifelineLogo } from "@/components/ui/LifelineLogo";

const navLinks = [
  {
    label: "Platform",
    href: "#platform",
    children: [
      { label: "Learn", description: "System-based content library", href: "#learn" },
      { label: "AI Tutor", description: "Socratic AI teaching assistant", href: "#ai-tutor" },
      { label: "Practice", description: "UWorld-style question bank", href: "#practice" },
      { label: "Retention", description: "Spaced repetition engine", href: "#retention" },
      { label: "Clinical", description: "Clerkship support tools", href: "#clinical" },
      { label: "Lifeline Nexus", description: "Medical student community", href: "#community" },
    ],
  },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-navy/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity duration-200">
            <LifelineLogo width={160} height={52} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        activeDropdown === link.label && "rotate-180"
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {link.children && activeDropdown === link.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72">
                    <div className="glass-card rounded-2xl p-2 shadow-2xl border border-white/[0.08]">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="flex flex-col gap-0.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors duration-150 group"
                        >
                          <span className="text-sm font-semibold text-white group-hover:text-accent-green transition-colors">
                            {child.label}
                          </span>
                          <span className="text-xs text-white/50">{child.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent-green hover:bg-accent-green-light text-navy transition-all duration-200 shadow-glow hover:shadow-glow-lg active:scale-95"
            >
              Get Early Access
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden transition-all duration-300 overflow-hidden",
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-navy/95 backdrop-blur-xl border-b border-white/[0.06] px-4 pb-6 pt-2 space-y-1">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 rounded-lg text-white/50 hover:text-accent-green text-sm transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              className="px-4 py-3 rounded-xl text-sm font-medium text-center text-white/70 border border-white/10 hover:border-white/20 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-3 rounded-xl text-sm font-semibold text-center bg-accent-green hover:bg-accent-green-light text-navy transition-all duration-200"
            >
              Get Early Access
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
