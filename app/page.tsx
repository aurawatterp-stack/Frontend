"use client";
import { useEffect, useState } from "react";

import LoginScreen from "./components/auth/LoginScreen";
import RegisterScreen from "./components/auth/RegisterScreen";
import IMSDashboard from "./components/ims/IMSDashboard";
import { apiMe, clearAuthToken, getAuthToken, type AuthUser } from "./lib/api";

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function AurawattIMS() {
  const [screen, setScreen] = useState<"login" | "register" | "dashboard">("login");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setBooting(false);
      return;
    }

    apiMe()
      .then((user) => {
        setCurrentUser(user);
        setScreen("dashboard");
      })
      .catch(() => {
        clearAuthToken();
        setCurrentUser(null);
        setScreen("login");
      })
      .finally(() => setBooting(false));
  }, []);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setScreen("login");
  };

  if (booting) return null;

  if (screen === "login") {
    return <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  }
  if (screen === "register") {
    return <RegisterScreen onGoLogin={() => setScreen("login")} />;
  }
  return <IMSDashboard user={currentUser} onLogout={handleLogout} />;
}
