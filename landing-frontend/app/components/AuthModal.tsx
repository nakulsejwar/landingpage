"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseApiResponse } from "../../lib/api";

type AuthModalProps = {
  onClose: () => void;
};

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  async function submit() {
    setSubmitting(true);
    setError("");

    try {
      if (mode === "register") {
        const registerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        await parseApiResponse<{ message: string }>(registerRes);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await parseApiResponse<{ access: string }>(res);
      login(data.access);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,rgba(8,15,32,0.96),rgba(17,24,39,0.98))] shadow-[0_40px_120px_rgba(2,6,23,0.65)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.14),transparent_24%)]" />
        <div className="relative grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
              Workspace access
            </div>
            <h2 className="mt-6 font-display text-4xl leading-tight text-white">
              {mode === "login" ? "Return to your landing page workspace." : "Create your account and start building."}
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
              Sign in to generate pages, edit sections, manage visuals, and connect your brand system in one place.
            </p>

            <div className="mt-10 grid gap-4">
              <AuthFeature
                title="Generation + editing"
                body="Go from prompt to editable landing page without losing structure."
              />
              <AuthFeature
                title="Image-aware workflow"
                body="Search stock, upload visuals, and tune sections from one control surface."
              />
              <AuthFeature
                title="Publishing readiness"
                body="Manage page settings, preview mobile layouts, and prepare custom domains."
              />
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  {mode === "login" ? "Login" : "Register"}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {mode === "login" ? "Access your dashboard" : "Set up your workspace"}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
              <ModeButton label="Login" active={mode === "login"} onClick={() => setMode("login")} />
              <ModeButton label="Create account" active={mode === "register"} onClick={() => setMode("register")} />
            </div>

            <div className="mt-6 space-y-4">
              {mode === "register" ? (
                <Field
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@company.com"
                  type="email"
                />
              ) : null}

              <Field
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="nakul"
              />

              <Field
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                type="password"
              />
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              onClick={submit}
              disabled={submitting}
              className="mt-6 w-full rounded-[22px] bg-[linear-gradient(135deg,#22d3ee_0%,#7c3aed_50%,#f43f5e_100%)] px-6 py-4 font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
            >
              {submitting
                ? "Working..."
                : mode === "login"
                  ? "Enter Workspace"
                  : "Create Account"}
            </button>

            <p className="mt-4 text-sm text-slate-400">
              {mode === "login" ? "Need an account?" : "Already set up?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-cyan-200 transition hover:text-white"
              >
                {mode === "login" ? "Create one here" : "Switch to login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
      />
    </label>
  );
}

function ModeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? "bg-white text-slate-950" : "text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function AuthFeature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{body}</div>
    </div>
  );
}
