"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseApiResponse } from "../../../lib/api";

type Entry = { id: string; data: Record<string, string>; submitted_at: string; ip_address?: string };
type EntriesData = { total: number; fields: string[]; form: { title: string; admin_email: string }; entries: Entry[] };

const card: React.CSSProperties = { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: 20 };

export default function FormEntries() {
  const { pageId } = useParams() as { pageId: string };
  const router = useRouter();
  const [data, setData] = useState<EntriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/entries/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => parseApiResponse<EntriesData>(r)).then(d => setData(d)).catch(() => setData(null)).finally(() => setLoading(false));
  }
  useEffect(load, [pageId]);

  async function deleteEntry(id: string) {
    setDeleting(id);
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/entries/?entry_id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
    setDeleting(null);
  }

  function exportCSV() {
    if (!data) return;
    const fields = data.fields;
    const rows = data.entries.map(e => [e.submitted_at, ...fields.map(f => `"${(e.data[f] || "").replace(/"/g, '""')}"`), e.ip_address || ""].join(","));
    const csv = ["Submitted At," + fields.join(",") + ",IP Address", ...rows].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `entries-${pageId}.csv`; a.click();
  }

  const filtered = data?.entries.filter(e => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return Object.values(e.data).some(v => String(v).toLowerCase().includes(s));
  }) || [];

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#060816,#091127 55%,#040611)", color: "white", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(20px,5vw,40px) clamp(16px,4vw,32px)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#22d3ee", cursor: "pointer", fontSize: 14, marginBottom: 8, padding: 0 }}>← Back to Dashboard</button>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Form Entries</h1>
            {data && <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{data.form.title} · {data.total} submissions{data.form.admin_email && ` · Notifying ${data.form.admin_email}`}</p>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => router.push(`/form/${pageId}`)} style={{ padding: "10px 20px", borderRadius: 100, fontWeight: 600, fontSize: 14, cursor: "pointer", border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.05)", color: "white" }}>Edit Form</button>
            <button onClick={exportCSV} disabled={!data?.entries.length} style={{ padding: "10px 20px", borderRadius: 100, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: "#22d3ee", color: "#000" }}>Export CSV</button>
          </div>
        </div>

        {/* Stats */}
        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            {[["Total Submissions", String(data.total), "#22d3ee"], ["Fields Collected", String(data.fields.length), "#a855f7"], ["Latest", data.entries[0]?.submitted_at ? new Date(data.entries[0].submitted_at).toLocaleDateString() : "—", "#10b981"]].map(([label, value, color]) => (
              <div key={label} style={card}>
                <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search entries…"
            style={{ width: "100%", maxWidth: 400, padding: "10px 16px", borderRadius: 100, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "white", fontSize: 14, outline: "none", fontFamily: "inherit" }}
          />
        </div>

        {/* Entries table */}
        {loading && <div style={{ ...card, textAlign: "center", padding: 40, color: "#64748b" }}>Loading entries…</div>}
        {!loading && !data && <div style={{ ...card, textAlign: "center", padding: 40, color: "#64748b" }}>No form configured for this page. <button onClick={() => router.push(`/form/${pageId}`)} style={{ color: "#22d3ee", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>Build one →</button></div>}
        {!loading && data && filtered.length === 0 && <div style={{ ...card, textAlign: "center", padding: 40, color: "#64748b" }}>{search ? "No entries match your search." : "No submissions yet."}</div>}

        {!loading && data && filtered.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,.1)" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 700, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Date</th>
                  {data.fields.map(f => (
                    <th key={f} style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 700, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{f}</th>
                  ))}
                  <th style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 700, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>IP</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid rgba(255,255,255,.05)", background: i % 2 === 0 ? "rgba(255,255,255,.01)" : "transparent" }}>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(entry.submitted_at).toLocaleString()}</td>
                    {data.fields.map(f => (
                      <td key={f} style={{ padding: "12px 16px", color: "white", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={String(entry.data[f] || "")}>
                        {entry.data[f] || <span style={{ color: "#64748b" }}>—</span>}
                      </td>
                    ))}
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 11 }}>{entry.ip_address || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => deleteEntry(entry.id)} disabled={deleting === entry.id} style={{ padding: "5px 10px", borderRadius: 8, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", cursor: "pointer", fontSize: 12 }}>
                        {deleting === entry.id ? "…" : "Del"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
