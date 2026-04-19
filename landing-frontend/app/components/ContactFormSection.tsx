"use client";
import { useEffect, useState } from "react";

type FieldConfig = { id: string; type: string; label: string; placeholder: string; required: boolean; options: string[] };
type FormConfig = { id: string; title: string; subtitle: string; submit_label: string; success_message: string; fields_config: FieldConfig[]; button_color: string; background_color: string };

export default function ContactFormSection({ pageId }: { pageId: string }) {
  const [form, setForm] = useState<FormConfig | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/`)
      .then(r => r.json()).then(d => { if (d && d.fields_config) setForm(d); }).catch(() => {});
  }, [pageId]);

  if (!form || form.fields_config.length === 0) return null;

  function validate() {
    const errs: Record<string, string> = {};
    form!.fields_config.forEach(f => {
      if (f.required && !values[f.label]?.trim()) errs[f.label] = `${f.label} is required`;
      if (f.type === "email" && values[f.label] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.label])) errs[f.label] = "Invalid email address";
    });
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setSubmitting(true); setErrorMsg("");
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/submit/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: values }),
      });
      const data = await r.json();
      if (data.success) { setSubmitted(true); setSuccessMsg(data.message || form!.success_message); }
      else setErrorMsg(data.error || "Submission failed. Please try again.");
    } catch { setErrorMsg("Network error. Please try again."); }
    finally { setSubmitting(false); }
  }

  const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "white", outline: "none", fontFamily: "inherit", transition: "border-color .2s" };
  const errStyle: React.CSSProperties = { fontSize: 12, color: "#f87171", marginTop: 4 };

  if (submitted) return (
    <section id="contact-form" style={{ padding: "clamp(60px,8vw,100px) clamp(16px,4vw,32px)", textAlign: "center" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "clamp(32px,5vw,56px)", borderRadius: 28, background: "rgba(255,255,255,.04)", border: `1px solid ${form.button_color}44` }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: "white" }}>You're all set!</h3>
        <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.6 }}>{successMsg}</p>
      </div>
    </section>
  );

  return (
    <section id="contact-form" style={{ padding: "clamp(60px,8vw,100px) clamp(16px,4vw,32px)", background: form.background_color === "transparent" ? undefined : form.background_color }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(28px,4vw,40px)" }}>
          <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 800, color: "white", margin: "0 0 12px", fontFamily: "var(--fh, inherit)" }}>{form.title}</h2>
          {form.subtitle && <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.65 }}>{form.subtitle}</p>}
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: "clamp(24px,4vw,40px)" }}>
          {form.fields_config.map(field => (
            <div key={field.id} style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 7 }}>
                {field.label}{field.required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
              </label>
              {field.type === "textarea" && (
                <textarea style={{ ...inp, minHeight: 110, resize: "vertical" as const, borderColor: errors[field.label] ? "#f87171" : undefined }} placeholder={field.placeholder} value={values[field.label] || ""} onChange={e => setValues(v => ({ ...v, [field.label]: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = form!.button_color)} onBlur={e => (e.target.style.borderColor = errors[field.label] ? "#f87171" : "rgba(255,255,255,.12)")}/>
              )}
              {field.type === "dropdown" && (
                <select style={{ ...inp, cursor: "pointer", borderColor: errors[field.label] ? "#f87171" : undefined }} value={values[field.label] || ""} onChange={e => setValues(v => ({ ...v, [field.label]: e.target.value }))}>
                  <option value="">Select {field.label}…</option>
                  {field.options.map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
              )}
              {field.type === "checkbox" && (
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={values[field.label] === "true"} onChange={e => setValues(v => ({ ...v, [field.label]: e.target.checked ? "true" : "" }))} style={{ width: 18, height: 18, accentColor: form.button_color, cursor: "pointer" }}/>
                  <span style={{ fontSize: 14, color: "#94a3b8" }}>{field.placeholder || field.label}</span>
                </label>
              )}
              {!["textarea","dropdown","checkbox"].includes(field.type) && (
                <input type={field.type === "phone" ? "tel" : field.type} style={{ ...inp, borderColor: errors[field.label] ? "#f87171" : undefined }} placeholder={field.placeholder} value={values[field.label] || ""} onChange={e => setValues(v => ({ ...v, [field.label]: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = form!.button_color)} onBlur={e => (e.target.style.borderColor = errors[field.label] ? "#f87171" : "rgba(255,255,255,.12)")}/>
              )}
              {errors[field.label] && <p style={errStyle}>{errors[field.label]}</p>}
            </div>
          ))}

          {errorMsg && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", fontSize: 14, marginBottom: 16 }}>{errorMsg}</div>}

          <button type="submit" disabled={submitting} style={{ width: "100%", padding: "14px 28px", borderRadius: 100, fontWeight: 700, fontSize: 16, cursor: submitting ? "not-allowed" : "pointer", border: "none", background: `linear-gradient(135deg,${form.button_color},${form.button_color}cc)`, color: "#000", opacity: submitting ? .75 : 1, transition: "opacity .2s,transform .2s", boxShadow: `0 0 32px ${form.button_color}44` }}
            onMouseEnter={e => { if (!submitting) (e.currentTarget.style.transform = "translateY(-2px)"); }}
            onMouseLeave={e => { (e.currentTarget.style.transform = "none"); }}>
            {submitting ? "Sending…" : form.submit_label}
          </button>
        </form>
      </div>
    </section>
  );
}
