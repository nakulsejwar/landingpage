"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "./components/AuthModal";
import Header from "./components/Header";
import { parseApiResponse } from "../lib/api";
import { isLoggedIn } from "./utils/auth";

const VISUAL_PRESETS = [
  {
    key: "cinematic",
    label: "Cinematic",
    description: "Hero-led composition, bold depth, premium dramatic energy.",
  },
  {
    key: "editorial",
    label: "Editorial",
    description: "Sharper typography, cleaner grids, polished product storytelling.",
  },
  {
    key: "futuristic",
    label: "Futuristic",
    description: "Glass surfaces, glow systems, interface-style visuals and motion.",
  },
];

const IMAGE_MODES = [
  { key: "mixed", label: "AI + Stock" },
  { key: "generated", label: "AI Visuals" },
  { key: "stock", label: "Royalty-Free" },
];

const MOTION_LEVELS = [
  { key: "high", label: "High Motion" },
  { key: "medium", label: "Balanced Motion" },
  { key: "low", label: "Light Motion" },
];

export default function Home() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [visualIntensity, setVisualIntensity] = useState("cinematic");
  const [animationLevel, setAnimationLevel] = useState("high");
  const [imageMode, setImageMode] = useState("mixed");
  const [depthMode, setDepthMode] = useState("3d");

  async function generate() {
    if (!prompt.trim()) {
      alert("Add a prompt first");
      return;
    }

    if (!isLoggedIn()) {
      setShowAuth(true);
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}generate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          visual_intensity: visualIntensity,
          animation_level: animationLevel,
          image_mode: imageMode,
          depth_mode: depthMode,
        }),
      });

      const data = await parseApiResponse<{ page_id: string }>(res);
      router.push(`/edit/${data.page_id}`);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error generating page");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="home-shell min-h-screen overflow-hidden text-white">
      <Header openLogin={() => setShowAuth(true)} />

      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-aurora hero-aurora-one" />
          <div className="hero-aurora hero-aurora-two" />
          <div className="hero-grid" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-8 lg:pt-16">
          <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100/80 backdrop-blur">
                SaaS Landing Page Studio
              </div>

              <h1 className="mt-6 max-w-5xl font-display text-5xl leading-[0.93] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Generate landing pages that feel{" "}
                <span className="bg-[linear-gradient(120deg,#7dd3fc_5%,#c084fc_45%,#f9a8d4_90%)] bg-clip-text text-transparent">
                  designed, directed, and launch-ready
                </span>
                .
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200/78">
                Go from one prompt to a structured landing page builder with live editing, responsive preview, image curation, and custom-domain readiness.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <FeaturePill title="Prompt to builder" body="Generate the page, then keep refining it with visual controls instead of brittle code output." />
                <FeaturePill title="Responsive workflow" body="Edit against desktop and mobile preview surfaces from the same workspace." />
                <FeaturePill title="Publishing path" body="Prepare brand settings, image direction, and custom-domain setup in one product flow." />
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <MetricCard value="1 prompt" label="to editable page" />
                <MetricCard value="3 modes" label="cinematic, editorial, futuristic" />
                <MetricCard value="1 workspace" label="generate, edit, publish" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="generator-panel rounded-[32px] border border-white/14 bg-white/8 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-6">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/78 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Prompt lab</p>
                      <h2 className="mt-2 font-display text-2xl text-white">Describe the landing page once</h2>
                    </div>
                    <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                      Output: editor-ready
                    </div>
                  </div>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a premium landing page for a fintech analytics platform with an animated product hero, trust-building testimonials, a strong CTA path, and editorial product imagery."
                    className="mt-5 min-h-44 w-full rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/50 focus:bg-white/[0.06]"
                  />

                  <div className="mt-5 space-y-4">
                    <OptionRow label="Visual style" options={VISUAL_PRESETS} value={visualIntensity} onChange={setVisualIntensity} />
                    <OptionRow label="Motion" options={MOTION_LEVELS} value={animationLevel} onChange={setAnimationLevel} />
                    <OptionRow label="Images" options={IMAGE_MODES} value={imageMode} onChange={setImageMode} />

                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-400">Depth mode</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ChoiceCard
                          title="3D-rich"
                          body="Perspective layers, floating scenes, stronger cinematic depth."
                          active={depthMode === "3d"}
                          onClick={() => setDepthMode("3d")}
                        />
                        <ChoiceCard
                          title="Layered"
                          body="Softer dimension with premium stacks and more restrained depth."
                          active={depthMode === "layered"}
                          onClick={() => setDepthMode("layered")}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={generate}
                    disabled={loading}
                    className="mt-6 w-full rounded-[22px] border border-cyan-300/20 bg-[linear-gradient(135deg,#22d3ee_0%,#7c3aed_50%,#f43f5e_100%)] px-6 py-4 font-semibold text-white transition hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(76,201,240,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Generating experience..." : "Generate landing page"}
                  </button>

                  <p className="mt-3 text-center text-sm text-slate-400">
                    Creates sections, theme direction, visuals, and an editable builder workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            <ShowcaseCard
              eyebrow="Workflow"
              title="Generate"
              body="Start from a plain-language prompt and tune design direction before creation."
            />
            <ShowcaseCard
              eyebrow="Workflow"
              title="Edit"
              body="Refine sections, reorder blocks, preview responsive layouts, and curate visuals."
            />
            <ShowcaseCard
              eyebrow="Workflow"
              title="Publish"
              body="Prepare custom-domain settings and ship a cleaner, more premium landing experience."
            />
          </div>
        </div>
      </section>

      {showAuth ? <AuthModal onClose={() => setShowAuth(false)} /> : null}
    </main>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{label}</div>
    </div>
  );
}

function FeaturePill({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function ShowcaseCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6">
      <div className="text-xs uppercase tracking-[0.26em] text-cyan-200">{eyebrow}</div>
      <div className="mt-3 text-2xl font-semibold text-white">{title}</div>
      <div className="mt-3 text-sm leading-7 text-slate-300">{body}</div>
    </div>
  );
}

function ChoiceCard({
  title,
  body,
  active,
  onClick,
}: {
  title: string;
  body: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? "border-cyan-300/50 bg-cyan-300/12 text-white"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
      }`}
    >
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm text-slate-400">{body}</div>
    </button>
  );
}

function OptionRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string; description?: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              value === option.key
                ? "border-cyan-300/50 bg-cyan-300/12 text-white"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
            }`}
          >
            <div className="font-medium">{option.label}</div>
            {option.description ? <div className="mt-1 text-sm text-slate-400">{option.description}</div> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
