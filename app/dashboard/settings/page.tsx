"use client";

import { useState, useEffect } from "react";
import { User, Bell, Shield, CreditCard, Brain, Palette, ChevronRight, Check, LogOut, Save } from "lucide-react";
import { readStore, updateProfile, writeStore, type UserProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

const sections = [
  { id: "profile",       label: "Profile",       icon: User       },
  { id: "notifications", label: "Notifications", icon: Bell       },
  { id: "ai",            label: "AI Preferences",icon: Brain      },
  { id: "appearance",    label: "Appearance",    icon: Palette    },
  { id: "billing",       label: "Billing & Plan",icon: CreditCard },
  { id: "security",      label: "Security",      icon: Shield     },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function SettingsPage() {
  const [active, setActive]     = useState<SectionId>("profile");
  const [saved, setSaved]       = useState(false);
  const [profile, setProfile]   = useState<UserProfile>({
    name: "", email: "", program: "MD", year: "MS2", school: "", examDate: "", aiLevel: "Step 1", aiMode: "socratic", theme: "dark",
  });
  const [notifs, setNotifs]     = useState({ drill: true, copilot: true, streak: true, email: true });

  // Load persisted values on mount
  useEffect(() => {
    const store = readStore();
    setProfile(store.profile);
    setNotifs(store.notifications);
  }, []);

  function handleSave() {
    updateProfile(profile);
    const store = readStore();
    store.notifications = notifs;
    writeStore(store);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function upd<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* Nav */}
      <div className="w-56 flex-shrink-0 bg-[#090c13] border-r border-white/[0.05] p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-2 mb-3">Settings</p>
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all",
              active === id ? "bg-white/[0.07] text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
            )}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <button
            onClick={() => { if (typeof window !== "undefined") { localStorage.clear(); window.location.href = "/login"; } }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-400/10 transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-xl mx-auto space-y-6">

          {/* ── Profile ── */}
          {active === "profile" && (
            <>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Profile</h2>
                <p className="text-sm text-white/40">Your personal information and study details.</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4ade80] to-[#2dd4bf] flex items-center justify-center text-[#06080f] text-2xl font-black">
                  {profile.name?.[0]?.toUpperCase() || "B"}
                </div>
                <p className="text-sm text-white/40">Profile photo coming soon.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" value={profile.name} onChange={(v) => upd("name", v)} placeholder="Your name" />
                <Field label="Email" type="email" value={profile.email} onChange={(v) => upd("email", v)} placeholder="you@school.edu" />
              </div>
              <Select label="Program" value={profile.program} onChange={(v) => upd("program", v)}
                options={["MD", "DO", "PA", "NP", "IMG", "Resident", "Fellow"]} />
              <Select label="Year / Level" value={profile.year} onChange={(v) => upd("year", v)}
                options={["Pre-med", "MS1", "MS2", "MS3", "MS4", "Resident", "Fellow", "Attending"]} />
              <Field label="School" value={profile.school} onChange={(v) => upd("school", v)} placeholder="University of Michigan Medical School" />
              <Field label="Target Exam Date" type="date" value={profile.examDate} onChange={(v) => upd("examDate", v)} />
            </>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Notifications</h2>
                <p className="text-sm text-white/40">Control what Lifeline tells you and when.</p>
              </div>
              {([
                { key: "drill",   label: "Daily Drill reminder",  desc: "Remind me when my daily drill is ready" },
                { key: "copilot", label: "Study Copilot alerts",  desc: "Notify me before I'm predicted to forget a concept" },
                { key: "streak",  label: "Streak notifications",  desc: "Celebrate streaks and warn before I lose one" },
                { key: "email",   label: "Weekly email digest",   desc: "Progress summary to my inbox each Sunday" },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between bg-[#0d1117] border border-white/[0.07] rounded-xl px-5 py-4">
                  <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-xs text-white/40 mt-0.5">{desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
                    className={cn("w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0",
                      notifs[key] ? "bg-[#22c55e]" : "bg-white/[0.1]"
                    )}>
                    <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200",
                      notifs[key] ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* ── AI Preferences ── */}
          {active === "ai" && (
            <>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">AI Preferences</h2>
                <p className="text-sm text-white/40">Tune how the AI Tutor teaches you.</p>
              </div>
              <div>
                <label className="field-label">Default Teaching Level</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["MS1", "MS2", "Step 1", "Step 2", "Clinical", "Resident"].map((l) => (
                    <button key={l} onClick={() => upd("aiLevel", l)}
                      className={cn("px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                        profile.aiLevel === l
                          ? "bg-[#4ade80]/15 border-[#4ade80]/40 text-[#4ade80]"
                          : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white hover:border-white/20"
                      )}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Default AI Mode</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    { id: "socratic", label: "Socratic", desc: "AI teaches by asking questions" },
                    { id: "case",     label: "Clinical Case", desc: "Work through cases together" },
                    { id: "pimp",     label: "Pimp Mode", desc: "Direct oral questioning" },
                    { id: "explain",  label: "Explain Mode", desc: "Deep topic explanations" },
                  ].map(({ id, label, desc }) => (
                    <button key={id} onClick={() => upd("aiMode", id)}
                      className={cn("text-left px-4 py-3 rounded-xl border transition-all",
                        profile.aiMode === id
                          ? "bg-[#4ade80]/10 border-[#4ade80]/35 text-[#4ade80]"
                          : "bg-white/[0.03] border-white/[0.07] text-white/50 hover:border-white/15 hover:text-white/70"
                      )}>
                      <div className="text-sm font-semibold mb-0.5">{label}</div>
                      <div className="text-xs opacity-60">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Appearance ── */}
          {active === "appearance" && (
            <>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Appearance</h2>
                <p className="text-sm text-white/40">Customize how Lifeline looks.</p>
              </div>
              <div>
                <label className="field-label">Theme</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { id: "dark",   label: "Dark",       preview: "#060810" },
                    { id: "darker", label: "Pure Black",  preview: "#000000" },
                    { id: "navy",   label: "Navy",        preview: "#021533" },
                  ].map(({ id, label, preview }) => (
                    <button key={id} onClick={() => upd("theme", id)}
                      className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                        profile.theme === id ? "border-[#4ade80]/40 ring-1 ring-[#4ade80]/20" : "border-white/[0.07] hover:border-white/15"
                      )}>
                      <div className="w-10 h-6 rounded-md border border-white/20" style={{ backgroundColor: preview }} />
                      <span className="text-xs text-white/60">{label}</span>
                      {profile.theme === id && <Check className="w-3 h-3 text-[#4ade80]" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Billing ── */}
          {active === "billing" && (
            <>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Billing & Plan</h2>
                <p className="text-sm text-white/40">Manage your subscription.</p>
              </div>
              <div className="bg-gradient-to-br from-[#4ade80]/15 to-[#2dd4bf]/5 border border-[#4ade80]/25 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-[#4ade80] mb-1">Current Plan</div>
                    <div className="text-2xl font-black text-white">Early Access — Free</div>
                    <div className="text-white/50 text-sm mt-1">All features unlocked during beta</div>
                  </div>
                  <div className="bg-[#4ade80] text-[#06080f] text-xs font-black px-3 py-1.5 rounded-full">Active</div>
                </div>
              </div>
            </>
          )}

          {/* ── Security ── */}
          {active === "security" && (
            <>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Security</h2>
                <p className="text-sm text-white/40">Keep your account safe.</p>
              </div>
              {[
                { label: "Change password", desc: "Update your password" },
                { label: "Two-factor authentication", desc: "Add an extra layer of security" },
                { label: "Active sessions", desc: "View and revoke active sessions" },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between bg-[#0d1117] border border-white/[0.07] rounded-xl px-5 py-4 cursor-pointer hover:border-white/[0.14] transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-xs text-white/35 mt-0.5">{desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
              ))}
              <div className="flex items-center justify-between bg-[#0d1117] border border-rose-400/15 rounded-xl px-5 py-4 cursor-pointer hover:border-rose-400/30 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-rose-400">Delete account</div>
                  <div className="text-xs text-white/35 mt-0.5">Permanently delete your account and all data</div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400/50" />
              </div>
            </>
          )}

          {/* Save button */}
          {active !== "billing" && active !== "security" && (
            <div className="pt-4 border-t border-white/[0.06]">
              <button onClick={handleSave}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95",
                  saved
                    ? "bg-[#4ade80]/20 border border-[#4ade80]/30 text-[#4ade80]"
                    : "bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                )}>
                {saved ? <><Check className="w-4 h-4" /> Saved to device</> : <><Save className="w-4 h-4" /> Save changes</>}
              </button>
              {saved && <p className="text-xs text-white/30 mt-2">Saved to your browser. No account required.</p>}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .field-label { display:block; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:rgba(255,255,255,.3); margin-bottom:6px; }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                   px-4 py-2.5 text-sm text-white/80 outline-none
                   focus:border-[#4ade80]/40 transition-colors placeholder:text-white/20" />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
                   px-4 py-2.5 text-sm text-white/80 outline-none
                   focus:border-[#4ade80]/40 transition-colors appearance-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
