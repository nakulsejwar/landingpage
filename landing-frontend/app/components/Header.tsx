"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header({
  openLogin,
}: {
  openLogin?: () => void;
}) {
  const router = useRouter();
  const { logged, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(124,58,237,0.2),rgba(244,63,94,0.18))] font-display text-lg font-semibold text-white">
            L
          </div>
          <div>
            <div className="font-display text-lg tracking-tight text-white">
              LumaForge
            </div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Landing page generator
            </div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="hidden rounded-full border border-white/12 bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/12 md:inline-flex"
          >
            New Project
          </button>
          {!logged ? (
            <button
              onClick={openLogin}
              className="rounded-full border border-white/12 bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
            >
              Login
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/admin")}
                className="rounded-full border border-white/12 bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="rounded-full border border-rose-400/20 bg-rose-500/14 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/22"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
