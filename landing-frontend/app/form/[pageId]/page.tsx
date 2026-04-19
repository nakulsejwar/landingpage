"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseApiResponse } from "../../../lib/api";

const PRESET_FIELDS = [
  { type: "text",     label: "Full Name",       placeholder: "John Doe" },
  { type: "email",    label: "Email Address",   placeholder: "john@example.com" },
  { type: "phone",    label: "Phone Number",    placeholder: "+1 (555) 000-0000" },
  { type: "text",     label: "Company",         placeholder: "Acme Inc." },
  { type: "text",     label: "Job Title",       placeholder: "CEO" },
  { type: "textarea", label: "Message",          placeholder: "Tell us about your project..." },
  { type: "dropdown", label: "Budget Range",    placeholder: "", options: ["< $5k", "$5k–$20k", "$20k–$50k", "$50k+"] },
  { type: "dropdown", label: "Timeline",        placeholder: "", options: ["ASAP", "1–3 months", "3–6 months", "6+ months"] },
  { type: "url",      label: "Website URL",     placeholder: "https://yoursite.com" },
  { type: "number",   label: "Team Size",       placeholder: "10" },
  { type: "dropdown", label: "How did you hear about us?", placeholder: "", options: ["Google", "Social Media", "Referral", "Event", "Other"] },
  { type: "text",     label: "Industry",        placeholder: "SaaS / Healthcare / Finance…" },
  { type: "checkbox", label: "Subscribe to newsletter", placeholder: "" },
  { type: "date",     label: "Preferred date",  placeholder: "" },
  { type: "textarea", label: "Additional notes", placeholder: "Anything else?" },
];

type FieldConfig = {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
};

type FormConfig = {
  title: string;
  subtitle: string;
  submit_label: string;
  success_message: string;
  admin_email: string;
  fields_config: FieldConfig[];
  button_color: string;
};

function genId() { return Math.random().toString(36).slice(2, 10); }

const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "white", outline: "none", fontFamily: "inherit" };
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#94a3b8", marginBottom: 6, display: "block" };
const card: React.CSSProperties = { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: 20, marginBottom: 12 };
const btn = (primary = false): React.CSSProperties => ({ padding: "10px 22px", borderRadius: 100, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: primary ? "#22d3ee" : "rgba(255,255,255,.07)", color: primary ? "#000" : "white" });

export default function FormBuilder() {
  const { pageId } = useParams() as { pageId: string };
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [cfg, setCfg] = useState<FormConfig>({
    title: "Get In Touch",
    subtitle: "Fill the form below and we'll get back to you shortly.",
    submit_label: "Send Message",
    success_message: "Thank you! We'll be in touch soon.",
    admin_email: "",
    fields_config: [],
    button_color: "#22d3ee",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (data && data.fields_config) setCfg(data); }).catch(() => {});
  }, [pageId]);

  function addPreset(preset: typeof PRESET_FIELDS[0]) {
    setCfg(c => ({
      ...c,
      fields_config: [...c.fields_config, { id: genId(), type: preset.type, label: preset.label, placeholder: preset.placeholder, required: false, options: (preset as any).options || [] }],
    }));
  }

  function addCustomField(type: string) {
    setCfg(c => ({ ...c, fields_config: [...c.fields_config, { id: genId(), type, label: "New Field", placeholder: "", required: false, options: [] }] }));
  }

  function updateField(id: string, key: string, value: unknown) {
    setCfg(c => ({ ...c, fields_config: c.fields_config.map(f => f.id === id ? { ...f, [key]: value } : f) }));
  }

  function removeField(id: string) {
    setCfg(c => ({ ...c, fields_config: c.fields_config.filter(f => f.id !== id) }));
  }

  function moveField(id: string, dir: -1 | 1) {
    setCfg(c => {
      const arr = [...c.fields_config];
      const i = arr.findIndex(f => f.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return c;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, fields_config: arr };
    });
  }

  async function save() {
    setSaving(true); setMsg("");
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(cfg),
      });
      setMsg("Form saved!");
    } catch { setMsg("Save failed."); }
    finally { setSaving(false); }
  }

  const CUSTOM_FIELD_TYPES = [
    { type: "text", label: "Text" }, { type: "email", label: "Email" },
    { type: "phone", label: "Phone" }, { type: "number", label: "Number" },
    { type: "textarea", label: "Textarea" }, { type: "dropdown", label: "Dropdown" },
    { type: "checkbox", label: "Checkbox" }, { type: "date", label: "Date" },
    { type: "url", label: "URL" }, { type: "file", label: "File Upload" },
  ];

  const FIELD_ICONS: Record<string, string> = { text: "T", email: "@", phone: "☎", number: "#", textarea: "¶", dropdown: "▾", checkbox: "☑", date: "📅", url: "🔗", file: "📎" };

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#060816,#091127 55%,#040611)", color: "white", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(20px,5vw,40px) clamp(16px,4vw,32px)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#22d3ee", cursor: "pointer", fontSize: 14, marginBottom: 8, padding: 0 }}>← Back</button>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Contact Form Builder</h1>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Design the lead capture form for this landing page.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {msg && <span style={{ fontSize: 13, color: msg.includes("!") ? "#22d3ee" : "#f87171", alignSelf: "center" }}>{msg}</span>}
            <button onClick={save} disabled={saving} style={btn(true)}>{saving ? "Saving…" : "Save Form"}</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Left: form settings + field builder */}
          <div>
            {/* Settings */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 16 }}>Form Settings</div>
              {[["title","Form Title","text"],["subtitle","Subtitle","textarea"],["submit_label","Submit Button Text","text"],["success_message","Success Message","textarea"],["admin_email","Admin Email (for notifications)","text"]].map(([key,label,kind]) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={lbl}>{label}</label>
                  {kind === "textarea"
                    ? <textarea style={{ ...inp, minHeight: 60, resize: "vertical" }} value={(cfg as any)[key]} onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))}/>
                    : <input style={inp} value={(cfg as any)[key]} onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))} type={key === "admin_email" ? "email" : "text"}/>
                  }
                </div>
              ))}
              <div style={{ marginBottom: 4 }}>
                <label style={lbl}>Button color</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="color" value={cfg.button_color} onChange={e => setCfg(c => ({ ...c, button_color: e.target.value }))} style={{ width: 44, height: 36, borderRadius: 8, border: "none", cursor: "pointer", padding: 2 }}/>
                  <input style={{ ...inp, flex: 1 }} value={cfg.button_color} onChange={e => setCfg(c => ({ ...c, button_color: e.target.value }))}/>
                </div>
              </div>
            </div>

            {/* Preset fields */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 12 }}>Quick Add (Common Fields)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {PRESET_FIELDS.map((p, i) => (
                  <button key={i} onClick={() => addPreset(p)} style={{ textAlign: "left", padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "#94a3b8", cursor: "pointer", fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ color: "#22d3ee", fontSize: 11 }}>{FIELD_ICONS[p.type] || "T"}</span>{p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom field types */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 12 }}>Add Custom Field</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CUSTOM_FIELD_TYPES.map(ft => (
                  <button key={ft.type} onClick={() => addCustomField(ft.type)} style={{ padding: "6px 14px", borderRadius: 100, background: "rgba(34,211,238,.08)", border: "1px solid rgba(34,211,238,.25)", color: "#22d3ee", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    {FIELD_ICONS[ft.type]} {ft.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: field list + preview */}
          <div>
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 16 }}>Form Fields ({cfg.fields_config.length})</div>
              {cfg.fields_config.length === 0 && (
                <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No fields yet. Add from presets or custom types.</p>
              )}
              {cfg.fields_config.map((field, i) => (
                <div key={field.id} style={{ ...card, margin: "0 0 10px", padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#22d3ee", fontWeight: 700, background: "rgba(34,211,238,.12)", padding: "2px 8px", borderRadius: 100 }}>{field.type}</span>
                      <span style={{ fontSize: 13, color: "white", fontWeight: 600 }}>{field.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => moveField(field.id, -1)} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#94a3b8", cursor: "pointer", fontSize: 11 }}>↑</button>
                      <button onClick={() => moveField(field.id, 1)} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#94a3b8", cursor: "pointer", fontSize: 11 }}>↓</button>
                      <button onClick={() => removeField(field.id)} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", cursor: "pointer", fontSize: 11 }}>✕</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ ...lbl, fontSize: 10 }}>Label</label>
                      <input style={{ ...inp, fontSize: 12, padding: "7px 10px" }} value={field.label} onChange={e => updateField(field.id, "label", e.target.value)}/>
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: 10 }}>Placeholder</label>
                      <input style={{ ...inp, fontSize: 12, padding: "7px 10px" }} value={field.placeholder} onChange={e => updateField(field.id, "placeholder", e.target.value)}/>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#94a3b8" }}>
                      <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, "required", e.target.checked)} style={{ accentColor: "#22d3ee" }}/> Required
                    </label>
                    {field.type === "dropdown" && (
                      <div style={{ flex: 1 }}>
                        <label style={{ ...lbl, fontSize: 10 }}>Options (comma-separated)</label>
                        <input style={{ ...inp, fontSize: 12, padding: "7px 10px" }} value={field.options.join(", ")} onChange={e => updateField(field.id, "options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}/>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Live preview */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 16 }}>Preview</div>
              <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,.06)" }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>{cfg.title}</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>{cfg.subtitle}</p>
                {cfg.fields_config.map(field => (
                  <div key={field.id} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 5, display: "block" }}>
                      {field.label}{field.required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
                    </label>
                    {field.type === "textarea"
                      ? <textarea disabled style={{ ...inp, minHeight: 72, opacity: .6 }} placeholder={field.placeholder}/>
                      : field.type === "dropdown"
                        ? <select disabled style={{ ...inp, opacity: .6 }}><option>Select {field.label}…</option>{field.options.map((o,i) => <option key={i}>{o}</option>)}</select>
                        : field.type === "checkbox"
                          ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" disabled style={{ accentColor: cfg.button_color }}/><span style={{ fontSize: 13, color: "#94a3b8" }}>{field.label}</span></div>
                          : <input type={field.type} disabled style={{ ...inp, opacity: .6 }} placeholder={field.placeholder}/>
                    }
                  </div>
                ))}
                {cfg.fields_config.length > 0 && (
                  <button disabled style={{ marginTop: 8, padding: "12px 28px", borderRadius: 100, background: cfg.button_color, color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "not-allowed", opacity: .85 }}>
                    {cfg.submit_label}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
