"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { parseApiResponse } from "../../lib/api";

type PageRecord = {
  id: string;
  title: string;
  created_at?: string;
  custom_domain?: string;
  domain_status?: string;
};

export default function Admin() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}my-pages/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => parseApiResponse<PageRecord[] | { pages: PageRecord[] }>(res))
      .then((data) => {
        if (Array.isArray(data)) {
          setPages(data);
          return;
        }
        setPages(Array.isArray(data.pages) ? data.pages : []);
      })
      .catch((error) => {
        console.error(error);
        setPages([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => ({
      total: pages.length,
      withDomain: pages.filter((page) => page.custom_domain).length,
      hostedPaths: pages.filter((page) => !page.custom_domain).length,
    }),
    [pages]
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#060816,#091127_55%,#040611_100%)] text-white">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,16,34,0.94),rgba(15,23,42,0.92))] p-8 shadow-[0_30px_100px_rgba(2,6,23,0.45)]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-200">Dashboard</div>
              <h1 className="mt-3 font-display text-4xl leading-tight text-white">
                Manage your landing pages like a real product workspace.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Review active pages, jump back into editing, track domain setup, and keep your launch queue organized.
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="rounded-full bg-[linear-gradient(135deg,#22d3ee,#7c3aed,#f43f5e)] px-5 py-3 text-sm font-semibold text-white"
            >
              Create New Page
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Total pages" value={String(stats.total)} tone="cyan" />
            <StatCard label="Domains added" value={String(stats.withDomain)} tone="pink" />
            <StatCard label="Hosted paths" value={String(stats.hostedPaths)} tone="emerald" />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Your pages</h2>
              <p className="mt-1 text-sm text-slate-400">
                Open the editor, preview the live page, or continue domain setup.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-slate-400">
              Loading pages...
            </div>
          ) : null}

          {!loading && pages.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
              <div className="text-xl font-semibold text-white">No pages yet</div>
              <div className="mt-2 text-sm text-slate-400">
                Generate your first landing page and it will show up here.
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            {pages.map((page) => (
              <article
                key={page.id}
                className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.28)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.26em] text-slate-500">Landing page</div>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{page.title || "Untitled Page"}</h3>
                    <p className="mt-3 text-sm text-slate-400">
                      {page.created_at ? new Date(page.created_at).toLocaleDateString() : "Draft"}
                    </p>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                    {page.custom_domain ? "Custom domain" : "Hosted path"}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    label="Live path"
                    value={`/site/${page.id}`}
                  />
                  <InfoCard
                    label="Domain"
                    value={page.custom_domain || "Not attached yet"}
                    status={page.domain_status || "not_connected"}
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push(`/edit/${page.id}`)}
                    className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
                  >
                    Open Editor
                  </button>
                  <button
                    onClick={() => router.push(`/site/${page.id}`)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Preview Site
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "pink" | "emerald";
}) {
  const toneMap = {
    cyan: "from-cyan-400/20 to-cyan-300/5 text-cyan-100",
    pink: "from-pink-400/20 to-pink-300/5 text-pink-100",
    emerald: "from-emerald-400/20 to-emerald-300/5 text-emerald-100",
  };

  return (
    <div className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${toneMap[tone]} p-5`}>
      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-3 text-sm font-medium text-white">{value}</div>
      {status ? (
        <div className="mt-3 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-amber-100">
          {status}
        </div>
      ) : null}
    </div>
  );
}
