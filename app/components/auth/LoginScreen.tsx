"use client";

import { useState } from "react";
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

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0f1629" }}>
      {/* Left Panel */}
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

      {/* Right Panel */}
      <div style={{
        width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
        background: "#f8fafc", position: "relative"
      }}>
        {/* Background image blur effect overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(135deg, rgba(248,250,252,0.97) 0%, rgba(240,249,255,0.97) 100%)",
          zIndex: 0,
        }} />
        <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <AurawattLogo size={64} />
            <div style={{ marginTop: 16, fontSize: 24, fontWeight: 800, color: "#1e3a5f", letterSpacing: 1 }}>IMS Login</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>Sign in to your account to continue</div>
          </div>

          {/* Admin hint */}
          <div style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a)", border: "1px solid #f59e0b",
            borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12
          }}>
            <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
              <IconKey size={16} /> Admin Demo Credentials
            </div>
            <div style={{ color: "#78350f" }}>Email: <b>admin@aurawatt.in</b></div>
            <div style={{ color: "#78350f" }}>Password: <b>Admin@123</b></div>
          </div>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626",
              borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16
            }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <IconAlertTriangle size={16} /> {error}
              </span>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6, letterSpacing: 0.5 }}>
              e-Mail Address
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#1e293b",
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div style={{ marginBottom: 16, position: "relative" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6, letterSpacing: 0.5 }}>
              Password
            </label>
            <input
              type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Enter your password"
              style={{
                width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10, boxSizing: "border-box",
                border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, color: "#1e293b",
                outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
            <button onClick={() => setShowPw(!showPw)} style={{
              position: "absolute", right: 12, bottom: 11, background: "none", border: "none",
              cursor: "pointer", color: "#94a3b8", fontSize: 15
            }}>
              {showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)}
              style={{ accentColor: "#3b82f6", width: 15, height: 15 }} />
            <label htmlFor="remember" style={{ fontSize: 13, color: "#64748b", cursor: "pointer" }}>Remember Me</label>
          </div>

          <button
            onClick={handleLogin} disabled={loading}
            style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#93c5fd" : "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: 1,
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)", transition: "all 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748b" }}>
            Authorized user?{" "}
            <button onClick={onGoRegister} style={{
              background: "none", border: "1px solid #3b82f6", color: "#3b82f6",
              borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600
            }}>
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
