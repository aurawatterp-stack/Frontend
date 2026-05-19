"use client";

import { useEffect, useState } from "react";
import AurawattLogo from "../brand/AurawattLogo";
import { apiLogin, type AuthUser } from "../../lib/api";
import { IconAlertTriangle, IconBolt, IconEye, IconEyeOff, IconKey, IconLock, IconMail, IconPhone, IconTruck } from "../icons/Icons";

export default function LoginScreen({
  onLogin,
  onGoRegister,
}: {
  onLogin: (user: AuthUser) => void;
  onGoRegister: () => void;
}) {
  const [email, setEmail] = useState("admin@aurawatt.in");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please enter both email and password."); return; }
    setLoading(true);
    try {
      const user = await apiLogin(email, password);
      onLogin(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("admin@aurawatt.in");
    setPassword("Admin@123");
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0f1629" }}>
      {/* Left Panel */}
      {!isMobile && (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px",
        background: "linear-gradient(135deg, #0e1f3d 0%, #1a3a6b 50%, #0d3b5e 100%)",
        position: "relative", overflow: "hidden"
      }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.05 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 200 + i * 80, height: 200 + i * 80,
              borderRadius: "50%", border: "1px solid #60a5fa",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
            }} />
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
            <AurawattLogo size={52} />
            <div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 22, letterSpacing: 6, lineHeight: 1 }}>AURAWATT</div>
              <div style={{ color: "#60a5fa", fontSize: 11, letterSpacing: 3, marginTop: 2 }}>Your Power Partner</div>
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(96,165,250,0.2)",
            borderRadius: 16, padding: "24px 28px", marginBottom: 40, backdropFilter: "blur(8px)"
          }}>
            <div style={{ color: "#f59e0b", fontFamily: "monospace", fontSize: 15, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
              Inventory Management System
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.7 }}>
              A secure, scalable, and user-centric tool to facilitate automation of products with ease.
            </div>
          </div>
          {[
            { icon: <IconLock size={16} />, text: "User registration is mandatory. Only whitelisted users may create an account." },
            { icon: <IconTruck size={16} />, text: "Distributors may contact the Aurawatt team to get onboarded." },
            { icon: <IconBolt size={16} />, text: "Manage inventory, sales, and complaints from one place." },
          ].map((t, i) => (
            <div key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5, marginBottom: 12, lineHeight: 1.6, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 2, opacity: 0.9 }}>{t.icon}</span>
              <span>{t.text}</span>
            </div>
          ))}
          <div style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Help / Queries Contact Us</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <IconPhone size={14} /> +91 9311920642
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <IconMail size={14} /> info@avavbusiness.com
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Right Panel */}
      <div style={{
        width: isMobile ? "100%" : 480,
        display: "flex",
        flex: isMobile ? 1 : undefined,
        minHeight: isMobile ? "100vh" : undefined,
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? 20 : 40,
        background: "#f8fafc",
        position: "relative"
      }}>
        {/* Background image blur effect overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(135deg, rgba(248,250,252,0.97) 0%, rgba(240,249,255,0.97) 100%)",
          zIndex: 0,
        }} />
        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(226,232,240,0.9)", boxShadow: "0 10px 30px rgba(15,23,42,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AurawattLogo size={46} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", letterSpacing: 0.6 }}>IMS Login</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
              Sign in to continue to <b style={{ color: "#334155" }}>Aurawatt IMS</b>
            </div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(226,232,240,0.9)",
            borderRadius: 18,
            padding: isMobile ? "18px 16px" : "20px 18px",
            boxShadow: "0 18px 55px rgba(15,23,42,0.08)",
            backdropFilter: "blur(10px)",
          }}>
            {/* Admin hint */}
            <div style={{
              background: "linear-gradient(135deg, #fef3c7, #fde68a)", border: "1px solid rgba(245,158,11,0.55)",
              borderRadius: 14, padding: "10px 12px", marginBottom: 16, fontSize: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 800, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
                  <IconKey size={16} /> Admin Demo
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  style={{
                    border: "1px solid rgba(245,158,11,0.7)",
                    background: "rgba(255,255,255,0.6)",
                    color: "#92400e",
                    borderRadius: 10,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Use Demo
                </button>
              </div>
              <div style={{ color: "#78350f", marginTop: 6, display: "grid", gap: 2 }}>
                <div>Email: <b>admin@aurawatt.in</b></div>
                <div>Password: <b>Admin@123</b></div>
              </div>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626",
                borderRadius: 14, padding: "10px 12px", fontSize: 13, marginBottom: 14
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <IconAlertTriangle size={16} /> {error}
                </span>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: 0.5 }}>
                e-Mail Address
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <IconMail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="name@company.com"
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 40px",
                    borderRadius: 14,
                    boxSizing: "border-box",
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    fontSize: 14,
                    color: "#0f172a",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14, position: "relative" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: 0.5 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <IconLock size={16} />
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "11px 44px 11px 40px",
                    borderRadius: 14,
                    boxSizing: "border-box",
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    fontSize: 14,
                    color: "#0f172a",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "rgba(148,163,184,0.12)",
                    border: "1px solid rgba(148,163,184,0.25)",
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 18 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: "#2563eb", width: 15, height: 15 }}
                />
                <span style={{ fontSize: 13, color: "#64748b" }}>Remember me</span>
              </label>
              <a
                href="mailto:info@avavbusiness.com"
                style={{ fontSize: 13, color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
              >
                Need help?
              </a>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "#93c5fd" : "linear-gradient(135deg, #1d4ed8, #1e40af)",
                color: "#fff",
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: 0.8,
                boxShadow: "0 10px 30px rgba(29,78,216,0.25)",
                transition: "transform 0.05s, filter 0.15s",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(1px)"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)"; }}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#64748b" }}>
              Authorized user?{" "}
              <button
                type="button"
                onClick={onGoRegister}
                style={{
                  background: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(37,99,235,0.35)",
                  color: "#2563eb",
                  borderRadius: 999,
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Register Now
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "#94a3b8" }}>
            © {new Date().getFullYear()} Aurawatt
          </div>
        </div>
      </div>
    </div>
  );
}
