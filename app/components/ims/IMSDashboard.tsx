"use client";

import { useEffect, useState } from "react";
import LogoutScreen from "../auth/LogoutScreen";
import AurawattLogo from "../brand/AurawattLogo";
import { NAV } from "./nav";
import { IconLogout, IconMenu } from "../icons/Icons";
import NotificationsBell from "./NotificationsBell";
import {
  ComplaintsConsumerPage,
  ComplaintsSupplierPage,
  CustomersPage,
  DashboardPage,
  DistributorsPage,
  ManufacturedPage,
  ProductsPage,
  RawMaterialsPage,
  SalesPage,
  SerialsPage,
  UsersPage,
} from "./pages";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
} | null;

function displayNameForUser(user: User) {
  if (!user) return "";
  if (user.role === "Admin") {
    return (process.env.NEXT_PUBLIC_ADMIN_DISPLAY_NAME || "").trim() || "Admin";
  }
  return user.name || "";
}

export default function IMSDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [page, setPage] = useState("dashboard");
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setIsDesktop(mql.matches);
      setSidebarOpen(mql.matches);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isDesktop) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = sidebarOpen ? "hidden" : prev;
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [isDesktop, sidebarOpen]);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage user={user} />;
      case "users": return <UsersPage currentUser={user} />;
      case "customers": return <CustomersPage />;
      case "serials": return <SerialsPage />;
      case "products": return <ProductsPage />;
      case "rawmaterials": return <RawMaterialsPage />;
      case "manufactured": return <ManufacturedPage />;
      case "sales": return <SalesPage />;
      case "complaints-consumer": return <ComplaintsConsumerPage />;
      case "complaints-supplier": return <ComplaintsSupplierPage />;
      case "distributors": return <DistributorsPage />;
      default: return <DashboardPage user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {showLogoutModal && (
        <LogoutScreen
          user={user}
          onConfirmLogout={() => { setShowLogoutModal(false); onLogout(); }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          isDesktop
            ? `${sidebarOpen ? "w-60" : "w-0 overflow-hidden"} flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-200 flex flex-col shadow-sm`
            : `fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 bg-white border-r border-gray-200 flex flex-col shadow-xl ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
        }
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <AurawattLogo size={32} />
          </div>
          <div>
            <div className="text-gray-900 font-black text-sm tracking-widest">AURAWATT</div>
            <div className="text-gray-400 text-[10px] tracking-wider">Your Power Partner</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map((item, idx) => {
            if (item.group === "header") {
              return (
                <div key={idx} className="px-3 pt-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {item.label}
                </div>
              );
            }
            const id = item.id;
            if (!id) return null;
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setPage(id);
                  if (!isDesktop) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition mb-0.5 text-left ${
                  active
                    ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 px-4 py-3">
          {/* User info in sidebar */}
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-lg bg-gray-50 border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xs">
              {displayNameForUser(user)?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{displayNameForUser(user)}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          >
            <IconLogout size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center px-3 sm:px-5 border-b border-gray-200 bg-white flex-shrink-0 gap-2 sm:gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-700 transition text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <IconMenu size={18} />
          </button>
          <div className="flex-1" />
          <NotificationsBell />
          <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow">
              {displayNameForUser(user)?.[0]}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm text-gray-700 font-medium leading-none">{displayNameForUser(user)}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{user?.role}</div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="ml-1 text-gray-400 hover:text-red-500 transition text-xs"
              title="Logout"
            >
              <IconLogout size={16} />
            </button>
          </div>
        </header>

        <div className="px-3 sm:px-6 py-2 border-b border-gray-100 text-xs text-gray-400 flex items-center gap-1.5 bg-white">
          <span className="hover:text-gray-600 cursor-pointer transition" onClick={() => setPage("dashboard")}>Home</span>
          <span>/</span>
          <span className="text-gray-600 capitalize">{page.replace("-", " ").replace(/\\b\\w/g, (c) => c.toUpperCase())}</span>
        </div>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50">
          {renderPage()}
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f9fafb; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </div>
  );
}
