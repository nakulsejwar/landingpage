/* eslint-disable @next/next/no-img-element */
import React from "react";

type FallbackSectionProps = {
  name: string;
  strategy?: Record<string, unknown>;
  assets?: Record<string, unknown>;
};

function pickImage(assets?: Record<string, unknown>) {
  const generated = Array.isArray(assets?.generated) ? assets?.generated : [];
  const stock = Array.isArray(assets?.stock) ? assets?.stock : [];
  const item = generated[0] || stock[0];
  if (!item || typeof item !== "object") return null;

  return {
    url: typeof item.url === "string" ? item.url : "",
    alt: typeof item.alt === "string" ? item.alt : "Section visual",
  };
}

export function FallbackSection({
  name,
  strategy = {},
  assets = {},
}: FallbackSectionProps) {
  const image = pickImage(assets);
  const title =
    (typeof strategy.goal === "string" && strategy.goal) ||
    `${name[0]?.toUpperCase() || ""}${name.slice(1)} section`;
  const tone =
    (typeof strategy.tone === "string" && strategy.tone) ||
    "Premium landing page content";
  const notes =
    (typeof strategy.animation_notes === "string" && strategy.animation_notes) ||
    (typeof strategy.three_d_notes === "string" && strategy.three_d_notes) ||
    "Generated with fallback rendering";

  return (
    <section
      id={name}
      className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,#07111f_0%,#0f172a_100%)] text-white"
    >
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[-80px] top-[-60px] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-50px] h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">
            {name}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            {tone}
          </p>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 backdrop-blur">
            {notes}
          </div>
        </div>

        <div className="flex items-center">
          {image?.url ? (
            <img
              src={image.url}
              alt={image.alt}
              className="h-full max-h-[360px] w-full rounded-[28px] border border-white/10 object-cover shadow-2xl"
            />
          ) : (
            <div className="flex h-[320px] w-full items-center justify-center rounded-[28px] border border-white/10 bg-white/5 text-sm text-slate-300">
              Visual placeholder
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
