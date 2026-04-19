"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { parseApiResponse } from "../../lib/api";

type PageRecord = { id: string; title: string; created_at?: string; custom_domain?: string; domain_status?: string };

export default function Admin() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  function loadPages() {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}my-pages/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => parseApiResponse<PageRecord[] | { pages: PageRecord[] }>(r))
      .then(data => setPages(Array.isArray(data) ? data : Array.isArray((data as any).pages) ? (data as any).pages : []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }
  useEffect(loadPages, []);

  async function deletePage(id: string) {
    if (!confirm("Delete this page and all its data?")) return;
    setDeletingId(id);
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${id}/delete/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setPages(p => p.filter(pg => pg.id !== id));
    setDeletingId(null);
  }

  const stats = useMemo(() => ({ total: pages.length, withDomain: pages.filter(p => p.custom_domain).length, hostedPaths: pages.filter(p => !p.custom_domain).length }), [pages]);

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#060816,#091127 55%,#040611)", color: "white", fontFamily: "'Inter',sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(20px,5vw,40px) clamp(16px,4vw,32px)" }}>
        {/* Hero card */}
        <section style={{ borderRadius: 36, border: "1px solid rgba(255,255,255,.1)", background: "linear-gradient(145deg,rgba(10,16,34,.94),rgba(15,23,42,.92))", padding: "clamp(24px,4vw,40px)", marginBottom: 32, boxShadow: "0 30px 100px rgba(2,6,23,.45)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "#67e8f9", marginBottom: 8 }}>Dashboard</div>
              <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, margin: 0, lineHeight: 1.15 }}>Your Landing Pages</h1>
              <p style={{ color: "#94a3b8", fontSize: 15, marginTop: 8, maxWidth: 520 }}>Edit pages, manage forms, track leads, and publish your sites.</p>
            </div>
            <button onClick={() => router.push("/")} style={{ padding: "12px 24px", borderRadius: 100, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: "linear-gradient(135deg,#22d3ee,#7c3aed,#f43f5e)", color: "white", flexShrink: 0 }}>
              + Create New Page
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[["Total pages", String(stats.total), "from-cyan-400/20"], ["Domains added", String(stats.withDomain), "from-pink-400/20"], ["Hosted paths", String(stats.hostedPaths), "from-emerald-400/20"]].map(([label, value]) => (
              <div key={label} style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", padding: "clamp(14px,3vw,24px)" }}>
                <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "#64748b" }}>{label}</div>
                <div style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, marginTop: 8 }}>{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pages list */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Your pages</h2>
          {loading && <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Loading pages…</div>}
          {!loading && pages.length === 0 && (
            <div style={{ borderRadius: 28, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.02)", padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>No pages yet</div>
              <div style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>Generate your first landing page to get started.</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(280px,40vw,500px),1fr))", gap: 20 }}>
            {pages.map(page => (
              <article key={page.id} style={{ borderRadius: 28, border: "1px solid rgba(255,255,255,.1)", background: "linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.02))", padding: "clamp(16px,3vw,28px)", boxShadow: "0 20px 70px rgba(2,6,23,.28)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", color: "#64748b" }}>Landing page</div>
                    <h3 style={{ fontSize: "clamp(16px,2.5vw,22px)", fontWeight: 700, margin: "6px 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.title || "Untitled"}</h3>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{page.created_at ? new Date(page.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Draft"}</p>
                  </div>
                  <span style={{ borderRadius: 100, border: "1px solid rgba(34,211,238,.2)", background: "rgba(34,211,238,.08)", padding: "4px 12px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#67e8f9", flexShrink: 0 }}>
                    {page.custom_domain ? "Custom domain" : "Hosted"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.02)", padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>Live path</div>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>/site/{page.id.slice(0, 8)}…</div>
                  </div>
                  <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.02)", padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>Domain</div>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.custom_domain || "Not attached"}</div>
                  </div>
                </div>

                {/* Action buttons - all 5 */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button onClick={() => router.push(`/edit/${page.id}`)} style={{ padding: "9px 18px", borderRadius: 100, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none", background: "white", color: "#0f172a", flexShrink: 0 }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => router.push(`/site/${page.id}`)} style={{ padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: 13, cursor: "pointer", border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.04)", color: "white", flexShrink: 0 }}>
                    👁 Preview
                  </button>
                  <button onClick={() => router.push(`/form/${page.id}`)} style={{ padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: 13, cursor: "pointer", border: "1px solid rgba(34,211,238,.25)", background: "rgba(34,211,238,.07)", color: "#22d3ee", flexShrink: 0 }}>
                    📋 Form Builder
                  </button>
                  <button onClick={() => router.push(`/entries/${page.id}`)} style={{ padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: 13, cursor: "pointer", border: "1px solid rgba(168,85,247,.25)", background: "rgba(168,85,247,.07)", color: "#c084fc", flexShrink: 0 }}>
                    📊 Entries
                  </button>
                  <button onClick={() => deletePage(page.id)} disabled={deletingId === page.id} style={{ padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: 13, cursor: "pointer", border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.07)", color: "#f87171", flexShrink: 0 }}>
                    {deletingId === page.id ? "…" : "🗑 Delete"}
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
