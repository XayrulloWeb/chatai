import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/mavzu", label: "Mavzu" },
  { to: "/kitoblar", label: "Kitoblar" },
  { to: "/qollanma", label: "Qo'llanma" },
  { to: "/prompt-yozish", label: "Prompt yozish" },
  { to: "/chatbot", label: "Chatbot" },
  { to: "/sorovnoma", label: "So'rovnoma" },
];

function getLinkClass(isActive) {
  return `rounded-full px-4 py-2 text-sm font-extrabold tracking-tight ${
    isActive
      ? "bg-gradient-to-r from-brand-500 via-[#4f7cff] to-[#00b489] text-white shadow-[0_14px_32px_-18px_rgba(53,93,255,0.9)]"
      : "text-slate-700 hover:bg-white/80 hover:text-slate-950"
  }`;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isBootstrapping, logout } = useAuth();
  const visibleNavItems = isAuthenticated ? navItems : [];

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto w-full max-w-6xl rounded-[30px] border border-white/85 bg-white/72 shadow-[0_20px_55px_-34px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-[#00b489] text-sm font-extrabold text-white shadow-[0_14px_30px_-16px_rgba(53,93,255,0.88)]">
              AI
            </span>
            <div className="leading-tight">
              <p className="text-base font-extrabold tracking-tight text-slate-900">AI Qo&apos;llanma</p>
              <p className="text-xs font-semibold text-slate-500">Interactive learning platform</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 rounded-[20px] border border-white/80 bg-white/70 p-1.5 md:flex">
            {visibleNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => getLinkClass(isActive)}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isBootstrapping ? (
              <span className="chip">Tekshirilmoqda...</span>
            ) : isAuthenticated ? (
              <>
                <span className="chip max-w-[220px] truncate">
                  {user?.name || user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-white/90 bg-white/75 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white"
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
            className="rounded-xl border border-white/85 bg-white/75 p-2 text-slate-700 hover:bg-white md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Menyu"
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="mx-auto mt-2 w-full max-w-6xl rounded-[24px] border border-white/85 bg-white/78 p-2.5 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.6)] backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-2 rounded-2xl border border-white/90 bg-white/72 p-2">
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
                <span className="chip mx-1">
                  {user?.name || user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="rounded-full border border-white/85 bg-white px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
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
