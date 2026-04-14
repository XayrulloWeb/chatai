import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/qollanma", label: "Qo'llanma" },
  { to: "/prompt-yozish", label: "Prompt yozish" },
  { to: "/chatbot", label: "Chatbot" },
  { to: "/sorovnoma", label: "So'rovnoma" },
];

function getLinkClass(isActive) {
  return `rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-brand-500 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isBootstrapping, logout } = useAuth();
  const visibleNavItems = isAuthenticated ? navItems : [];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-700">
            AI
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">AI Qo'llanma</p>
            <p className="text-xs text-slate-500">Ta'limiy MVP platforma</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => getLinkClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isBootstrapping ? (
            <span className="text-sm font-semibold text-slate-500">Tekshirilmoqda...</span>
          ) : isAuthenticated ? (
            <>
              <span className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                {user?.name || user?.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => getLinkClass(isActive)}>
                Kirish
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => getLinkClass(isActive)}>
                Ro&apos;yxatdan o&apos;tish
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Menyu"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => getLinkClass(isActive)}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {isBootstrapping ? (
              <span className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500">Tekshirilmoqda...</span>
            ) : isAuthenticated ? (
              <>
                <span className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                  {user?.name || user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => getLinkClass(isActive)}
                  onClick={() => setIsOpen(false)}
                >
                  Kirish
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => getLinkClass(isActive)}
                  onClick={() => setIsOpen(false)}
                >
                  Ro&apos;yxatdan o&apos;tish
                </NavLink>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
