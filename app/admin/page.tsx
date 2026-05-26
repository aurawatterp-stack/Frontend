"use client";

import { useEffect, useState } from "react";

import LoginScreen from "../components/auth/LoginScreen";
import RegisterScreen from "../components/auth/RegisterScreen";
import IMSDashboard from "../components/ims/IMSDashboard";
import { apiMe, clearAuthToken, getAuthToken, type AuthUser } from "../lib/api";

export default function AurawattIMS() {
  const [screen, setScreen] = useState<"login" | "register" | "dashboard">("login");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [booting, setBooting] = useState(() => Boolean(getAuthToken()));

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
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

  useEffect(() => {
    if (screen !== "dashboard") return;
    let cancelled = false;

    const refresh = () => {
      apiMe()
        .then((u) => {
          if (cancelled) return;
          setCurrentUser(u);
        })
        .catch(() => {
          // ignore: token may have expired; existing UI will handle on next action
        });
    };

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [screen]);

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
