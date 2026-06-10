import Link from "next/link";
import { Zap, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Learn", href: "#" },
    { label: "AI Tutor", href: "#" },
    { label: "Practice Questions", href: "#" },
    { label: "Retention Engine", href: "#" },
    { label: "Clinical Module", href: "#" },
    { label: "Lifeline Nexus", href: "#" },
  ],
  "Signature Features": [
    { label: "Lifeline Rounds™", href: "#" },
    { label: "Knowledge Graph", href: "#" },
    { label: "AI Video Generation", href: "#" },
    { label: "Study Copilot", href: "#" },
    { label: "Lifeline Procedures™", href: "#" },
  ],
  "Exam Prep": [
    { label: "USMLE Step 1", href: "#" },
    { label: "USMLE Step 2 CK", href: "#" },
    { label: "COMLEX Level 1", href: "#" },
    { label: "COMLEX Level 2", href: "#" },
    { label: "Shelf Exams", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "For Institutions", href: "#" },
    { label: "Press Kit", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

const socials = [
  { Icon: Twitter, label: "Twitter", href: "#" },
  { Icon: Linkedin, label: "LinkedIn", href: "#" },
  { Icon: Instagram, label: "Instagram", href: "#" },
  { Icon: Youtube, label: "YouTube", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative bg-navy border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center">
                <Zap className="w-4 h-4 text-navy" fill="currentColor" />
              </div>
              <span className="font-bold text-white text-lg">
                Lifeline <span className="text-accent-green">MEDed</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
              The AI-powered operating system for medical education. Built for students
              who want to understand medicine — not just memorize it.
            </p>
            <p className="text-sm font-semibold text-white/60 italic mb-6">
              &ldquo;Your Lifeline Through Medical School&rdquo;
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl glass-card border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Lifeline Medical Education, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "HIPAA"].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-xs text-white/25 hover:text-white/50 transition-colors duration-150"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
