/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { LandingSectionRecord } from "../../lib/landing";
import { parseApiResponse } from "../../lib/api";

type Props = {
  section: LandingSectionRecord | null;
  onChange: (section: LandingSectionRecord) => void;
};

type FieldKind = "text" | "textarea";
type ObjectField = { key: string; label: string; kind?: FieldKind };
type ListSchema = { key: string; label: string; itemLabel: string; fields: ObjectField[] };

// All layout variants now include the full 50+ set
const LAYOUT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  header: [
    { value: "glass", label: "Glass (scrolled blur)" },
    { value: "pill", label: "Pill nav" },
    { value: "editorial", label: "Editorial (centered)" },
    { value: "neon", label: "Neon glow" },
    { value: "brutalist", label: "Brutalist" },
    { value: "minimal", label: "Minimal" },
    { value: "frosted", label: "Frosted" },
    { value: "tech", label: "Tech terminal" },
    { value: "large", label: "Large brand" },
    { value: "announcement", label: "Announcement bar" },
  ],
  hero: [
    { value: "split-right", label: "Split Right (text left, image right)" },
    { value: "split-left", label: "Split Left (image left, text right)" },
    { value: "split-accent", label: "Split Accent (diagonal bg)" },
    { value: "split-bold", label: "Split Bold (massive type)" },
    { value: "split-stats-bottom", label: "Split + Stats Bar Below" },
    { value: "split-editorial", label: "Split Editorial (magazine)" },
    { value: "split-announce", label: "Split + Announcement" },
    { value: "centered", label: "Centered (no image)" },
    { value: "centered-media", label: "Centered + Image Below" },
    { value: "centered-pill", label: "Centered + Pill Badge" },
    { value: "centered-dark", label: "Centered Dark Burst" },
    { value: "full-bg", label: "Full BG Image Overlay" },
    { value: "big-text", label: "Big Text (oversized headline)" },
    { value: "diagonal", label: "Diagonal Color Split" },
    { value: "gradient-burst", label: "Gradient Burst" },
    { value: "stacked-showcase", label: "Stacked Showcase (full-width image)" },
    { value: "product-card", label: "Product Card Mockup" },
    { value: "brut-banner", label: "Brutalist Banner" },
    { value: "neon-frame", label: "Neon Grid Frame" },
    { value: "magazine", label: "Magazine Layout" },
  ],
  features: [
    { value: "cards-3", label: "3 Column Cards" },
    { value: "cards-2", label: "2 Column Cards" },
    { value: "cards-4", label: "4 Column Cards" },
    { value: "spotlight-first", label: "Spotlight First Card" },
    { value: "alternating", label: "Alternating Rows" },
    { value: "numbered-list", label: "Numbered List (sticky heading)" },
    { value: "icon-row", label: "Icon Row Grid" },
    { value: "bento", label: "Bento Grid (mixed sizes)" },
    { value: "feature-table", label: "Feature Table" },
    { value: "two-column-text", label: "Two Column Text List" },
    { value: "ticker", label: "Ticker Tape (auto-scroll)" },
    { value: "terminal", label: "Terminal CLI Style" },
    { value: "checklist-cols", label: "Checklist Columns" },
    { value: "icon-dominant", label: "Icon Dominant Grid" },
    { value: "half-screen", label: "Half Screen Panel" },
    { value: "numbered-magazine", label: "Numbered Magazine" },
    { value: "accordion-features", label: "Accordion Expand" },
    { value: "stripe-rows", label: "Stripe Rows" },
    { value: "stat-forward", label: "Stat Forward" },
    { value: "card-image-top", label: "Card with Image Top" },
    { value: "sticky-scroll", label: "Sticky Scroll" },
    { value: "comparison", label: "Before/After Comparison" },
    { value: "neon-cards", label: "Neon Glow Cards" },
    { value: "brutalist-grid", label: "Brutalist Grid" },
    { value: "glass-float", label: "Glass Float Cards" },
    { value: "tab-switcher", label: "Tab Switcher" },
    { value: "editorial-features", label: "Editorial Layout" },
  ],
  about: [
    { value: "split-media", label: "Split Media (text + image)" },
    { value: "story-card", label: "Story Card (image inset)" },
    { value: "stats-left", label: "Stats Left Column" },
    { value: "timeline", label: "Timeline Steps" },
    { value: "full-width-card", label: "Full Width Card" },
    { value: "centered-prose", label: "Centered Prose" },
    { value: "dark-feature-card", label: "Dark Feature Card" },
    { value: "full-bleed", label: "Full Bleed Image" },
    { value: "counter-showcase", label: "Counter Showcase" },
    { value: "manifesto", label: "Manifesto (large text)" },
    { value: "mosaic", label: "Mosaic Grid" },
  ],
  testimonials: [
    { value: "grid", label: "3 Column Grid" },
    { value: "marquee", label: "Auto-scroll Marquee" },
    { value: "spotlight", label: "Spotlight (1 large + small)" },
    { value: "stacked", label: "Stacked Single Column" },
    { value: "masonry", label: "Masonry Columns" },
    { value: "quote-large", label: "Giant Single Quote" },
    { value: "side-by-side", label: "Side by Side (2 large)" },
    { value: "magazine-grid", label: "Magazine Grid" },
    { value: "split-panel", label: "Split Dark Panel" },
    { value: "logo-wall", label: "Logo Wall + Reviews" },
  ],
  faq: [
    { value: "accordion", label: "Accordion" },
    { value: "two-column", label: "Two Column" },
    { value: "side-question", label: "Side Tab Questions" },
    { value: "numbered-accordion", label: "Numbered Large" },
    { value: "minimal-list", label: "Minimal Borderless" },
    { value: "cards-grid", label: "Cards Grid" },
    { value: "centered-accordion", label: "Centered Accordion" },
  ],
  contact: [
    { value: "split", label: "Split (text + links)" },
    { value: "centered", label: "Centered CTA" },
    { value: "compact", label: "Compact Inline" },
    { value: "minimal-cta", label: "Minimal Bottom Bar" },
    { value: "full-width-dark", label: "Full Width Dark" },
    { value: "two-col-links", label: "Two Column Links" },
    { value: "newsletter", label: "Newsletter Input" },
    { value: "social-cta", label: "Social CTA + Footer" },
    { value: "newspaper", label: "Newspaper Footer" },
  ],
};

const SECTION_FIELDS: Record<string, { simple?: ObjectField[]; lists?: ListSchema[]; media?: boolean }> = {
  header: {
    simple: [
      { key: "announcement", label: "Announcement bar text", kind: "textarea" },
      { key: "cta_label", label: "CTA button label" },
    ],
    lists: [
      { key: "nav_items", label: "Nav items", itemLabel: "Item", fields: [{ key: "value", label: "Label" }] },
    ],
  },
  hero: {
    simple: [
      { key: "eyebrow", label: "Eyebrow badge" },
      { key: "headline", label: "Headline", kind: "textarea" },
      { key: "subheadline", label: "Subheadline", kind: "textarea" },
      { key: "primary_cta", label: "Primary CTA" },
      { key: "secondary_cta", label: "Secondary CTA" },
    ],
    lists: [
      { key: "stats", label: "Stats", itemLabel: "Stat", fields: [{ key: "label", label: "Label" }, { key: "value", label: "Value" }] },
    ],
    media: true,
  },
  features: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Section title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
    ],
    lists: [
      { key: "items", label: "Features", itemLabel: "Feature", fields: [{ key: "icon", label: "Icon name" }, { key: "title", label: "Title" }, { key: "description", label: "Description", kind: "textarea" }] },
    ],
  },
  about: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
    ],
    lists: [
      { key: "bullets", label: "Bullet points", itemLabel: "Point", fields: [{ key: "value", label: "Text", kind: "textarea" }] },
      { key: "stats", label: "Stats", itemLabel: "Stat", fields: [{ key: "label", label: "Label" }, { key: "value", label: "Value" }] },
    ],
    media: true,
  },
  testimonials: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
    ],
    lists: [
      { key: "items", label: "Testimonials", itemLabel: "Testimonial", fields: [{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "company", label: "Company" }, { key: "quote", label: "Quote", kind: "textarea" }] },
    ],
  },
  faq: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
    ],
    lists: [
      { key: "items", label: "FAQ items", itemLabel: "Q&A", fields: [{ key: "question", label: "Question" }, { key: "answer", label: "Answer", kind: "textarea" }] },
    ],
  },
  contact: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "primary_cta", label: "Primary CTA" },
      { key: "secondary_cta", label: "Secondary CTA" },
      { key: "email", label: "Email address" },
    ],
    lists: [
      { key: "links", label: "Links", itemLabel: "Link", fields: [{ key: "label", label: "Label" }, { key: "href", label: "URL" }] },
    ],
  },
  contact_form: {
    simple: [
      { key: "title", label: "Form title" },
      { key: "subtitle", label: "Form subtitle", kind: "textarea" },
      { key: "submit_label", label: "Submit button label" },
      { key: "success_message", label: "Success message", kind: "textarea" },
      { key: "admin_email", label: "Admin notification email" },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function asObject(v: unknown) { return v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {}; }
function asString(v: unknown) { return typeof v === "string" ? v : ""; }
function asStringList(v: unknown) { return Array.isArray(v) ? v.filter((i): i is string => typeof i === "string") : []; }
function asObjectList(v: unknown) { return Array.isArray(v) ? v.filter((i): i is Record<string, unknown> => !!i && typeof i === "object" && !Array.isArray(i)) : []; }
function defaultItemFor(fields: ObjectField[]) { return Object.fromEntries(fields.map(f => [f.key, ""])); }
function dedupeByUrl(items: Record<string, unknown>[]) {
  const seen = new Set<string>();
  return items.filter(i => { const u = asString(i.url); if (!u || seen.has(u)) return false; seen.add(u); return true; });
}
function mergeMediaChoices(section: LandingSectionRecord) {
  const fromData = asObjectList(section.data.media_choices);
  const assets = asObject(section.assets);
  const fromAssets = ["stock", "generated"].flatMap(b => asObjectList(assets[b]));
  const unique = new Map<string, Record<string, unknown>>();
  [...fromData, ...fromAssets].forEach(i => { const u = asString(i.url); if (u && !unique.has(u)) unique.set(u, i); });
  return Array.from(unique.values());
}
function applySectionData(section: LandingSectionRecord, nextData: Record<string, unknown>) {
  return { ...section, data: nextData };
}
function applyMedia(section: LandingSectionRecord, media: Record<string, unknown>, mediaChoices?: Record<string, unknown>[]) {
  return { ...section, data: { ...section.data, media, media_choices: mediaChoices ?? section.data.media_choices } };
}

// ── Get effective data for editing (handles custom_html sections) ──────────────
// When a section was regenerated with custom_html, the data fields may be sparse.
// We still show what we have and let users edit the structured fields.
function getEffectiveData(section: LandingSectionRecord): Record<string, unknown> {
  return section.data || {};
}

export default function VisualEditorPanel({ section, onChange }: Props) {
  const [imageSearch, setImageSearch] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageMessage, setImageMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "layout" | "media">("content");

  const config = section ? (SECTION_FIELDS[section.name] || null) : null;
  const layoutOptions = section ? (LAYOUT_OPTIONS[section.name] || []) : [];

  useEffect(() => {
    if (!section) { setImageSearch(""); setImageMessage(""); return; }
    const q = asString(section.strategy?.image_query) || asString(section.data?.image_query);
    setImageSearch(q);
    setImageMessage("");
  }, [section?.name]);

  const mediaChoices = useMemo(() => (section ? mergeMediaChoices(section) : []), [section]);
  const selectedMedia = useMemo(() => (section ? asObject(section.data?.media) : {}), [section]);

  if (!section) {
    return (
      <div style={{ padding: 24, borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.02)", color: "#94a3b8", fontSize: 14 }}>
        Select a section from the left panel to start editing.
      </div>
    );
  }

  const hasCustomHtml = !!asString(section.data?.custom_html);
  const currentSection = section;
  const effectiveData = getEffectiveData(currentSection);

  function setValue(key: string, value: string) {
    // When editing a custom_html section, we clear the custom_html so structured rendering takes over
    const nextData: Record<string, unknown> = { ...effectiveData, [key]: value };
    if (hasCustomHtml && key !== "custom_html") {
      // Keep custom_html unless user explicitly edits content fields
      // Actually remove it so the structured renderer picks up
      delete nextData.custom_html;
    }
    onChange(applySectionData(currentSection, nextData));
  }

  function setLayoutVariant(value: string) {
    const nextData: Record<string, unknown> = { ...effectiveData, layout_variant: value };
    if (hasCustomHtml) delete nextData.custom_html; // switch back to structured
    onChange(applySectionData(currentSection, nextData));
  }

  function setStringListValue(key: string, index: number, value: string) {
    const current = asStringList(effectiveData[key]);
    current[index] = value;
    onChange(applySectionData(currentSection, { ...effectiveData, [key]: current }));
  }
  function addStringListValue(key: string) {
    const current = asStringList(effectiveData[key]);
    onChange(applySectionData(currentSection, { ...effectiveData, [key]: [...current, ""] }));
  }
  function removeStringListValue(key: string, index: number) {
    const current = asStringList(effectiveData[key]).filter((_, i) => i !== index);
    onChange(applySectionData(currentSection, { ...effectiveData, [key]: current }));
  }
  function updateObjectListValue(listKey: string, index: number, fieldKey: string, value: string) {
    const current = [...asObjectList(effectiveData[listKey])];
    current[index] = { ...current[index], [fieldKey]: value };
    onChange(applySectionData(currentSection, { ...effectiveData, [listKey]: current }));
  }
  function addObjectListValue(listKey: string, fields: ObjectField[]) {
    const current = asObjectList(effectiveData[listKey]);
    onChange(applySectionData(currentSection, { ...effectiveData, [listKey]: [...current, defaultItemFor(fields)] }));
  }
  function removeObjectListValue(listKey: string, index: number) {
    const current = asObjectList(effectiveData[listKey]).filter((_, i) => i !== index);
    onChange(applySectionData(currentSection, { ...effectiveData, [listKey]: current }));
  }
  function moveObjectListValue(listKey: string, index: number, direction: -1 | 1) {
    const current = [...asObjectList(effectiveData[listKey])];
    const target = index + direction;
    if (target < 0 || target >= current.length) return;
    [current[index], current[target]] = [current[target], current[index]];
    onChange(applySectionData(currentSection, { ...effectiveData, [listKey]: current }));
  }

  async function searchImages() {
    const q = imageSearch.trim();
    if (!q) { setImageMessage("Add a search phrase first."); return; }
    setImageLoading(true); setImageMessage("");
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}stock-images/?query=${encodeURIComponent(q)}`);
      const data = await parseApiResponse<{ results?: Record<string, unknown>[]; hint?: string }>(r);
      const results = Array.isArray(data.results) ? data.results : [];
      onChange(applyMedia(currentSection, asObject(currentSection.data?.media), dedupeByUrl([...results, ...mediaChoices])));
      setImageMessage(results.length ? `${results.length} images loaded.` : data.hint || "No results.");
    } catch (e) { setImageMessage("Image search failed."); }
    finally { setImageLoading(false); }
  }

  async function uploadImage(file: File | null) {
    if (!file) return;
    setImageLoading(true); setImageMessage("");
    try {
      const fd = new FormData(); fd.append("image", file);
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}landing-image-upload/`, { method: "POST", body: fd });
      const data = await parseApiResponse<Record<string, unknown>>(r);
      const uploaded = { url: asString(data.url), alt: file.name, provider: "upload", thumbnail: asString(data.url) };
      onChange(applyMedia(currentSection, uploaded, dedupeByUrl([uploaded, ...mediaChoices])));
      setImageMessage("Image uploaded and applied.");
    } catch { setImageMessage("Upload failed."); }
    finally { setImageLoading(false); }
  }

  // Tab button style
  const tabStyle = (active: boolean) => ({
    padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
    background: active ? "rgba(34,211,238,.15)" : "transparent",
    border: active ? "1px solid rgba(34,211,238,.4)" : "1px solid transparent",
    color: active ? "#22d3ee" : "#94a3b8", cursor: "pointer",
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 13,
    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
    color: "white", outline: "none", fontFamily: "inherit",
  };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 72, resize: "vertical" as const };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" as const, color: "#94a3b8", marginBottom: 4, display: "block" };
  const sectionBox: React.CSSProperties = { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 16, marginBottom: 16 };

  return (
    <div style={{ borderRadius: 24, border: "1px solid rgba(255,255,255,.1)", background: "rgba(2,6,23,.85)", padding: 20, boxShadow: "0 20px 80px rgba(2,6,23,.45)" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "#22d3ee", marginBottom: 4 }}>Visual Editor</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "white", textTransform: "capitalize", margin: 0 }}>{currentSection.name}</h2>
        {hasCustomHtml && (
          <div style={{ marginTop: 8, padding: "6px 12px", borderRadius: 8, background: "rgba(251,191,36,.1)", border: "1px solid rgba(251,191,36,.3)", fontSize: 12, color: "#fbbf24" }}>
            ⚡ This section was AI-regenerated. Editing any field will switch back to structured mode.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <button style={tabStyle(activeTab === "content")} onClick={() => setActiveTab("content")}>Content</button>
        {layoutOptions.length > 0 && <button style={tabStyle(activeTab === "layout")} onClick={() => setActiveTab("layout")}>Layout</button>}
        {config?.media && <button style={tabStyle(activeTab === "media")} onClick={() => setActiveTab("media")}>Media</button>}
      </div>

      {/* Content tab */}
      {activeTab === "content" && config && (
        <div>
          {/* Simple fields */}
          {config.simple && config.simple.map(field => (
            <div key={field.key} style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{field.label}</label>
              {field.kind === "textarea"
                ? <textarea style={textareaStyle} value={asString(effectiveData[field.key])} onChange={e => setValue(field.key, e.target.value)} />
                : <input style={inputStyle} value={asString(effectiveData[field.key])} onChange={e => setValue(field.key, e.target.value)} />
              }
            </div>
          ))}

          {/* List fields */}
          {config.lists && config.lists.map(list => {
            const isStringList = list.fields.length === 1 && list.fields[0].key === "value";
            return (
              <div key={list.key} style={sectionBox}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 12 }}>{list.label}</div>
                {isStringList
                  ? asStringList(effectiveData[list.key]).map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "flex-start" }}>
                        <textarea style={{ ...textareaStyle, flex: 1, minHeight: 56 }} value={item} onChange={e => setStringListValue(list.key, i, e.target.value)} />
                        <button onClick={() => removeStringListValue(list.key, i)} style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
                      </div>
                    ))
                  : asObjectList(effectiveData[list.key]).map((item, i) => (
                      <div key={i} style={{ ...sectionBox, margin: "0 0 10px", padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{list.itemLabel} {i + 1}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => moveObjectListValue(list.key, i, -1)} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>↑</button>
                            <button onClick={() => moveObjectListValue(list.key, i, 1)} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>↓</button>
                            <button onClick={() => removeObjectListValue(list.key, i)} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", cursor: "pointer", fontSize: 12 }}>✕</button>
                          </div>
                        </div>
                        {list.fields.map(field => (
                          <div key={field.key} style={{ marginBottom: 8 }}>
                            <label style={labelStyle}>{field.label}</label>
                            {field.kind === "textarea"
                              ? <textarea style={{ ...textareaStyle, minHeight: 56 }} value={asString(item[field.key])} onChange={e => updateObjectListValue(list.key, i, field.key, e.target.value)} />
                              : <input style={inputStyle} value={asString(item[field.key])} onChange={e => updateObjectListValue(list.key, i, field.key, e.target.value)} />
                            }
                          </div>
                        ))}
                      </div>
                    ))
                }
                <button
                  onClick={() => isStringList ? addStringListValue(list.key) : addObjectListValue(list.key, list.fields)}
                  style={{ width: "100%", padding: "8px 0", borderRadius: 10, background: "rgba(34,211,238,.08)", border: "1px dashed rgba(34,211,238,.3)", color: "#22d3ee", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  + Add {list.itemLabel}
                </button>
              </div>
            );
          })}

          {!config.simple && !config.lists && (
            <p style={{ color: "#94a3b8", fontSize: 13 }}>No editable fields for this section type.</p>
          )}
        </div>
      )}

      {/* Layout tab */}
      {activeTab === "layout" && layoutOptions.length > 0 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Layout variant</label>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
              Choosing a layout switches back to structured rendering mode.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {layoutOptions.map(opt => {
                const isActive = asString(effectiveData.layout_variant) === opt.value;
                return (
                  <button key={opt.value} onClick={() => setLayoutVariant(opt.value)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 12, background: isActive ? "rgba(34,211,238,.12)" : "rgba(255,255,255,.03)", border: `1px solid ${isActive ? "rgba(34,211,238,.4)" : "rgba(255,255,255,.08)"}`, color: isActive ? "#22d3ee" : "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 700 : 400 }}>
                    {isActive && <span style={{ marginRight: 8 }}>✓</span>}{opt.label}
                    {isActive && <span style={{ fontSize: 11, marginLeft: 8, opacity: .6 }}>active</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Media tab */}
      {activeTab === "media" && config?.media && (
        <div>
          {/* Search */}
          <div style={sectionBox}>
            <label style={labelStyle}>Search stock photos</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={imageSearch} onChange={e => setImageSearch(e.target.value)} placeholder="e.g. minimal office desk" onKeyDown={e => e.key === "Enter" && searchImages()} />
              <button onClick={searchImages} disabled={imageLoading} style={{ padding: "9px 16px", borderRadius: 10, background: "#22d3ee", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none", flexShrink: 0 }}>
                {imageLoading ? "…" : "Search"}
              </button>
            </div>
            {imageMessage && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{imageMessage}</p>}
          </div>

          {/* Upload */}
          <div style={sectionBox}>
            <label style={labelStyle}>Upload your own</label>
            <input type="file" accept="image/*" onChange={e => uploadImage(e.target.files?.[0] || null)} style={{ fontSize: 13, color: "#94a3b8", width: "100%" }} />
          </div>

          {/* Media choices grid */}
          {mediaChoices.length > 0 && (
            <div>
              <label style={labelStyle}>Choose image ({mediaChoices.length} available)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {mediaChoices.map((choice, i) => {
                  const isSelected = asString(selectedMedia.url) === asString(choice.url);
                  return (
                    <button key={i} onClick={() => onChange(applyMedia(currentSection, choice))} style={{ padding: 4, borderRadius: 10, border: `2px solid ${isSelected ? "#22d3ee" : "rgba(255,255,255,.1)"}`, background: isSelected ? "rgba(34,211,238,.1)" : "transparent", cursor: "pointer" }}>
                      <img src={asString(choice.thumbnail || choice.url)} alt={asString(choice.alt)} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 7, display: "block" }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
