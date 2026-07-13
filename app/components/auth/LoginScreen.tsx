"use client";

import { useEffect, useState } from "react";
import AurawattLogo from "../brand/AurawattLogo";
import { apiLogin, type AuthUser } from "../../lib/api";
import { IconAlertTriangle, IconBolt, IconCheckCircle, IconEye, IconEyeOff, IconLock, IconMail, IconPhone } from "../icons/Icons";

const REMEMBERED_EMAIL_KEY = "aurawatt:rememberedEmail";

const FEATURES = [
  "A secure, scalable, and user-centric tool to facilitate automation of products with ease.",
  "User registration is mandatory. Only whitelisted users may create an account.",
  "Distributors may contact the Aurawatt team to get onboarded.",
];

export default function LoginScreen({
  onLogin,
  onGoRegister,
}: {
  onLogin: (user: AuthUser) => void;
  onGoRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Only the e-mail is remembered (in localStorage) for convenience — the session token itself
  // stays sessionStorage-only (tab-scoped) so "Remember Me" can't silently persist a login across
  // browser restarts on a shared machine.
  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await apiLogin(email, password);
      if (rememberMe) window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      else window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      onLogin(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-slate-50 lg:flex-row">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(155deg,#0b1c4d_0%,#1747c7_55%,#0ea5b7_100%)] lg:flex lg:w-[46%] lg:flex-col xl:w-[42%]">
        {/* decorative layers */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-900/40 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-1/3 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col overflow-y-auto px-12 py-12 xl:px-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <AurawattLogo size={28} />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-[0.28em] text-white">AURAWATT</div>
              <div className="text-[11px] font-semibold tracking-[0.3em] text-cyan-200/80">YOUR POWER PARTNER</div>
            </div>
          </div>

          <div className="mt-14 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-widest text-cyan-100 ring-1 ring-white/15">
              <IconBolt size={12} /> INVENTORY MANAGEMENT SYSTEM
            </span>
            <h1 className="mt-5 max-w-sm text-[30px] font-extrabold leading-[1.15] text-white xl:text-[34px]">
              One console for Aurawatt&apos;s entire product operation.
            </h1>

            <ul className="mt-9 space-y-4">
              {FEATURES.map((text) => (
                <li key={text} className="flex items-start gap-3 text-[13.5px] leading-relaxed text-blue-50/90">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <IconCheckCircle size={12} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <div className="mt-10 hidden overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl shadow-black/20 sm:block">
              <img
                src="/hero.png"
                alt="Aurawatt hybrid inverter installed at a customer site"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-200/70">Help / Queries Contact Us</div>
            <div className="mt-2.5 flex flex-col gap-1.5">
              <a href="tel:+919311920642" className="inline-flex items-center gap-2 text-[13px] text-blue-50/90 transition hover:text-white">
                <IconPhone size={13} /> +91 9311920642
              </a>
              <a href="mailto:info@avavbusiness.com" className="inline-flex items-center gap-2 text-[13px] text-blue-50/90 transition hover:text-white">
                <IconMail size={13} /> info@avavbusiness.com
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile-only compact brand header */}
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1c4d_0%,#1747c7_55%,#0ea5b7_100%)] px-6 py-7 lg:hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <AurawattLogo size={26} />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-[0.22em] text-white">AURAWATT</div>
            <div className="text-[10px] font-semibold tracking-[0.25em] text-cyan-200/80">YOUR POWER PARTNER</div>
          </div>
        </div>
        <span className="relative z-10 mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-widest text-cyan-100 ring-1 ring-white/15">
          <IconBolt size={12} /> INVENTORY MANAGEMENT SYSTEM
        </span>
      </div>

      {/* Form panel */}
      <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />

        <div className="relative z-10 w-full min-w-0 max-w-[400px]">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.35)] sm:p-9"
          >
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <AurawattLogo size={38} />
              </div>
              <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900">Welcome back</h2>
              <p className="mt-1 text-[13px] text-slate-500">Sign in to the Aurawatt IMS console</p>
            </div>

            {error && (
              <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-700">
                <IconAlertTriangle size={16} className="mt-0.5 flex-none" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconMail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="registered@email.com"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconLock size={16} />
                </span>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  {showPw ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
            </div>

            <label className="mb-6 mt-1 flex cursor-pointer items-center gap-2 text-[13px] text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600/30"
              />
              Remember me on this device
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[linear-gradient(180deg,#1d2a6b_0%,#0c1440_100%)] py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0c1440]/30 transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in to ERP"}
            </button>

            <div className="mt-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> New to Aurawatt <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={onGoRegister}
              className="mt-4 w-full rounded-xl border border-slate-300 py-2.5 text-[13px] font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Register as an authorized user
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-500">
            <IconLock size={12} /> Whitelisted access only · Secured login
          </div>

          {/* Mobile-only contact footer, since the brand aside is hidden below lg */}
          <div className="mt-6 flex flex-col items-center gap-1.5 text-[12px] text-slate-500 lg:hidden">
            <a href="tel:+919311920642" className="inline-flex items-center gap-1.5 hover:text-slate-700">
              <IconPhone size={12} /> +91 9311920642
            </a>
            <a href="mailto:info@avavbusiness.com" className="inline-flex items-center gap-1.5 hover:text-slate-700">
              <IconMail size={12} /> info@avavbusiness.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
