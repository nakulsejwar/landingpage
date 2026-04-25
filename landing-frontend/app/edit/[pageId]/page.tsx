"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthModal from "../../components/AuthModal";
import Header from "../../components/Header";
import VisualEditorPanel from "../../components/VisualEditorPanel";
import { parseApiResponse } from "../../../lib/api";
import type {
  LandingPageResponse,
  LandingSectionOption,
  LandingSectionRecord,
  LandingTheme,
} from "../../../lib/landing";
import { defaultTheme, sectionLabel, sectionsToMap } from "../../../lib/landing";
import { isLoggedIn } from "../../utils/auth";

type SidebarTab = "sections" | "editor" | "settings";
type PreviewMode = "desktop" | "mobile";

function createSectionDraft(name: string): LandingSectionRecord {
  const defaults: Record<string, Record<string, unknown>> = {
    header: {
      announcement: "Built to turn curious visitors into qualified conversations.",
      nav_items: ["Features", "About", "Testimonials", "FAQ", "Contact"],
      cta_label: "Book Demo",
    },
    hero: {
      layout_variant: "split-right",
      eyebrow: "Premium landing experience",
      headline: "A sharper first impression for your product.",
      subheadline: "Edit the copy, structure, and visual story live until the page feels ready to sell.",
      primary_cta: "Get Started",
      secondary_cta: "See Features",
      stats: [
        { label: "Launch speed", value: "Fast" },
        { label: "Design quality", value: "Premium" },
        { label: "Customization", value: "Full" },
      ],
      image_query: "premium SaaS landing page hero visual in editorial studio lighting",
      image_role: "A premium visual that makes the hero feel polished and trustworthy.",
      media_choices: [],
    },
    features: {
      layout_variant: "cards-3",
      eyebrow: "Capabilities",
      title: "Build the exact story your page needs.",
      description: "Add, remove, and refine content blocks while the preview updates live.",
      items: [
        { icon: "Spark", title: "Live editing", description: "Update the experience instantly without raw JSON." },
        { icon: "Grid", title: "Section control", description: "Reorder and shape the page the way a visual builder should." },
        { icon: "Image", title: "Media curation", description: "Choose visuals that actually match the section story." },
      ],
    },
    about: {
      layout_variant: "split-media",
      eyebrow: "Story",
      title: "Tell visitors why this offer deserves attention.",
      description: "Use bullets, stats, and an image to create trust around the product or company.",
      bullets: [
        "Clarify what makes the offer different.",
        "Show enough detail to build trust quickly.",
        "Keep the visual style aligned with the hero.",
      ],
      stats: [
        { label: "Trust signal", value: "High" },
        { label: "Readability", value: "Clear" },
        { label: "Flexibility", value: "Custom" },
      ],
      image_query: "modern startup team in premium office editorial photography",
      image_role: "A relevant supporting scene that humanizes the offer.",
      media_choices: [],
    },
    testimonials: {
      layout_variant: "grid",
      eyebrow: "Proof",
      title: "Add credible customer voices.",
      description: "Short, specific testimonials are usually stronger than generic praise.",
      items: [
        { name: "Alex Rivera", role: "Founder", quote: "The page finally matched the quality of our product." },
      ],
      image_query: "professional founder portrait in modern office",
      image_role: "An editorial portrait that adds human credibility.",
      media_choices: [],
    },
    faq: {
      layout_variant: "accordion",
      eyebrow: "FAQ",
      title: "Handle objections before they become drop-offs.",
      description: "Answer the practical questions buyers actually ask.",
      items: [
        { question: "Can this be customized?", answer: "Yes. Every section can be changed, reordered, or expanded." },
      ],
    },
    contact: {
      layout_variant: "split",
      eyebrow: "Contact",
      title: "Make the next step obvious.",
      description: "Use a focused call to action with the right channels attached.",
      primary_cta: "Book Intro Call",
      secondary_cta: "See Demo",
      email: "hello@example.com",
      links: [{ label: "Email", href: "mailto:hello@example.com" }],
    },
  };

  return {
    name,
    kind: "structured",
    data: defaults[name] || {},
    assets: {},
    strategy: {},
  };
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;

  const [page, setPage] = useState<LandingPageResponse | null>(null);
  const [sections, setSections] = useState<Record<string, LandingSectionRecord>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [active, setActive] = useState("hero");
  const [aiPrompt, setAiPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("editor");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      setShowAuth(true);
      setLoading(false);
      return;
    }
    if (!pageId) {
      return;
    }

    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/edit/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => parseApiResponse<LandingPageResponse>(res))
      .then((data) => {
        setPage(data);
        setSections(sectionsToMap(data.sections));
        setOrder(data.section_order);
        setActive(data.section_order[0] || "hero");
      })
      .catch((err) => {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to load page");
      })
      .finally(() => setLoading(false));
  }, [pageId]);

  const previewPage = useMemo(() => {
    if (!page) {
      return null;
    }

    return {
      ...page,
      theme: page.theme || defaultTheme,
      sections: order.map((name) => sections[name]).filter(Boolean),
    };
  }, [page, sections, order]);

  const availableSections = useMemo(() => {
    const options = page?.available_sections || [];
    return options.filter((option) => !order.includes(option.name));
  }, [page?.available_sections, order]);

  useEffect(() => {
    if (!previewPage || !previewFrameRef.current?.contentWindow) {
      return;
    }

    previewFrameRef.current.contentWindow.postMessage(
      {
        type: "landing-preview:update",
        payload: previewPage,
      },
      window.location.origin
    );
  }, [previewPage]);

  function updateThemeField(field: keyof LandingTheme, value: string) {
    setPage((prev) =>
      prev
        ? {
            ...prev,
            theme: {
              ...prev.theme,
              [field]: value,
            },
          }
        : prev
    );
  }

  function updateSection(section: LandingSectionRecord) {
    setSections((prev) => ({
      ...prev,
      [section.name]: section,
    }));
  }

  function moveSection(sectionName: string, direction: -1 | 1) {
    setOrder((prev) => {
      const index = prev.indexOf(sectionName);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeSection(sectionName: string) {
    const nextOrder = order.filter((name) => name !== sectionName);
    setOrder(nextOrder);
    setActive((prev) => {
      if (prev !== sectionName) {
        return prev;
      }
      return nextOrder[0] || "hero";
    });
    if (sidebarTab === "editor" && active === sectionName) {
      setSidebarTab("sections");
    }
  }

  function addSection(option: LandingSectionOption) {
    setSections((prev) => ({
      ...prev,
      [option.name]: prev[option.name] || createSectionDraft(option.name),
    }));
    setOrder((prev) => [...prev, option.name]);
    setActive(option.name);
    setSidebarTab("editor");
  }

  async function regenerate(sectionName: string) {
    if (!aiPrompt.trim()) {
      alert("Enter instructions for the regeneration.");
      return;
    }

    try {
      setMessage("Regenerating section...");
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/section/${sectionName}/regenerate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: aiPrompt }),
        }
      );

      const data = await parseApiResponse<{ section: LandingSectionRecord }>(res);
      setSections((prev) => ({
        ...prev,
        [sectionName]: data.section,
      }));
      setMessage(`${sectionLabel(sectionName)} refreshed.`);
      setAiPrompt("");
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Regeneration failed.");
    }
  }

  async function saveAll() {
    if (!page) {
      return;
    }

    setSaving(true);
    setMessage("Saving...");
    try {
      const token = localStorage.getItem("token");
      await parseApiResponse(
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/update/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            theme: page.theme,
            brand_name: page.brand_name,
            tagline: page.tagline,
            custom_domain: page.custom_domain || "",
            domain_status: page.custom_domain ? "pending_verification" : "not_connected",
            section_order: order,
            sections: Object.fromEntries(
              Object.entries(sections).map(([name, section]) => [
                name,
                {
                  kind: section.kind,
                  data: section.data,
                  assets: section.assets,
                  strategy: section.strategy,
                },
              ])
            ),
          }),
        })
      );
      setMessage("Saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePage() {
    if (!confirm("Delete this page?")) {
      return;
    }
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/delete/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push("/admin");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="mx-auto max-w-7xl px-6 py-16 text-slate-400">Loading editor...</div>
      </div>
    );
  }

  if (!page || !previewPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="mx-auto max-w-7xl px-6 py-16 text-slate-400">Unable to load this page.</div>
        {showAuth ? <AuthModal onClose={() => setShowAuth(false)} /> : null}
      </div>
    );
  }

  const activeSection = sections[active] || null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617,#020617_12%,#081226_100%)] text-white">
      <Header />
      <div className="mx-auto max-w-[1900px] px-4 py-6 sm:px-6 xl:px-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[0_20px_80px_rgba(2,6,23,0.28)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-200">Builder</div>
              <h1 className="mt-2 text-2xl font-semibold">{page.title}</h1>
              <p className="mt-1 text-sm text-slate-400">
                Preview the page on desktop or mobile and edit content from one docked control panel.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveAll}
                disabled={saving}
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Page"}
              </button>
              <button
                onClick={deletePage}
                className="rounded-full border border-rose-400/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-100"
              >
                Delete Page
              </button>
            </div>
          </div>
          {message ? <div className="mt-3 text-sm text-slate-300">{message}</div> : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="min-w-0">
            <div className="rounded-[34px] border border-white/10 bg-slate-950/60 shadow-[0_40px_120px_rgba(2,6,23,0.4)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-sm text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Live preview</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                    {sectionLabel(active)} selected
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
                  <DeviceButton
                    label="Laptop"
                    active={previewMode === "desktop"}
                    onClick={() => setPreviewMode("desktop")}
                  />
                  <DeviceButton
                    label="Mobile"
                    active={previewMode === "mobile"}
                    onClick={() => setPreviewMode("mobile")}
                  />
                </div>
              </div>

              <div className="h-[calc(100vh-220px)] overflow-auto p-4 sm:p-6">
                <div className={previewMode === "mobile" ? "mx-auto w-[390px] max-w-full" : "w-full"}>
                  <div
                    className={`overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/60 ${
                      previewMode === "mobile" ? "shadow-[0_25px_80px_rgba(2,6,23,0.5)]" : ""
                    }`}
                  >
                    {previewMode === "mobile" ? (
                      <div className="flex items-center justify-center gap-2 border-b border-white/10 bg-slate-950/80 px-4 py-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                        <span className="ml-3 text-xs uppercase tracking-[0.24em] text-slate-500">Mobile canvas</span>
                      </div>
                    ) : null}
                    <iframe
                      ref={previewFrameRef}
                      key={previewMode}
                      src="/preview-frame"
                      title="Landing page preview"
                      onLoad={() => {
                        if (!previewFrameRef.current?.contentWindow || !previewPage) {
                          return;
                        }
                        previewFrameRef.current.contentWindow.postMessage(
                          {
                            type: "landing-preview:update",
                            payload: previewPage,
                          },
                          window.location.origin
                        );
                      }}
                      className={`block border-0 bg-transparent ${
                        previewMode === "mobile" ? "h-[780px] w-[390px] max-w-full" : "h-[calc(100vh-260px)] w-full"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/80 shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
              <div className="border-b border-white/10 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-200">Control panel</div>
                <div className="mt-3 flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
                  <SidebarTabButton
                    label="Sections"
                    active={sidebarTab === "sections"}
                    onClick={() => setSidebarTab("sections")}
                  />
                  <SidebarTabButton
                    label="Editor"
                    active={sidebarTab === "editor"}
                    onClick={() => setSidebarTab("editor")}
                  />
                  <SidebarTabButton
                    label="Settings"
                    active={sidebarTab === "settings"}
                    onClick={() => setSidebarTab("settings")}
                  />
                </div>
              </div>

              <div className="h-[calc(100vh-220px)] overflow-y-auto p-4">
                {sidebarTab === "sections" ? (
                  <div className="space-y-5">
                    <div>
                      <div className="text-sm font-semibold text-white">Sections</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Switch sections, change the order, or add hidden blocks back into the page.
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.map((name) => (
                        <div
                          key={name}
                          className={`rounded-[22px] border px-3 py-3 transition ${
                            active === name
                              ? "border-cyan-400/30 bg-cyan-400/10"
                              : "border-white/10 bg-white/[0.03]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActive(name);
                              setSidebarTab("editor");
                            }}
                            className="w-full text-left"
                          >
                            <div className="font-medium text-white">{sectionLabel(name)}</div>
                            <div className="mt-1 text-sm text-slate-400">Open in editor</div>
                          </button>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <MiniButton label="Up" onClick={() => moveSection(name, -1)} />
                            <MiniButton label="Down" onClick={() => moveSection(name, 1)} />
                            <MiniButton label="Hide" onClick={() => removeSection(name)} danger />
                          </div>
                        </div>
                      ))}
                    </div>

                    {availableSections.length ? (
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Insert blocks</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {availableSections.map((option) => (
                            <button
                              key={option.name}
                              type="button"
                              onClick={() => addSection(option)}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200"
                            >
                              Add {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {sidebarTab === "editor" ? (
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-sm font-semibold text-white">Active section</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Editing {sectionLabel(active)}. Changes appear in the preview immediately.
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-sm font-semibold text-white">AI rewrite</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Refresh just this section if you want stronger copy or better section direction.
                      </div>
                      <textarea
                        value={aiPrompt}
                        onChange={(event) => setAiPrompt(event.target.value)}
                        placeholder={`Improve the ${sectionLabel(active)} section for stronger conversion, motion, and storytelling...`}
                        className="mt-4 min-h-[140px] w-full rounded-[22px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                      />
                      <button
                        onClick={() => regenerate(active)}
                        className="mt-3 w-full rounded-[20px] bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                      >
                        Regenerate Active Section
                      </button>
                    </div>

                    <VisualEditorPanel section={activeSection} onChange={updateSection} />
                  </div>
                ) : null}

                {sidebarTab === "settings" ? (
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-sm font-semibold text-white">Page settings</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Tune brand identity and preview mode while keeping more space for the canvas.
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Brand</div>
                      <div className="mt-4 space-y-4">
                        <EditorInput
                          label="Brand name"
                          value={page.brand_name}
                          onChange={(value) => setPage((prev) => (prev ? { ...prev, brand_name: value } : prev))}
                        />
                        <EditorInput
                          label="Tagline"
                          value={page.tagline || ""}
                          onChange={(value) => setPage((prev) => (prev ? { ...prev, tagline: value } : prev))}
                        />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Custom domain</div>
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-100">
                          {page.domain_status || "not_connected"}
                        </span>
                      </div>
                      <div className="mt-4 space-y-4">
                        <EditorInput
                          label="Domain"
                          value={page.custom_domain || ""}
                          onChange={(value) =>
                            setPage((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    custom_domain: value,
                                    domain_status: value ? "pending_verification" : "not_connected",
                                  }
                                : prev
                            )
                          }
                        />
                        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-400">
                          Point your DNS to this app after deployment. Suggested setup:
                          <div className="mt-2 font-mono text-xs text-slate-300">CNAME www -&gt; your-deployment-host</div>
                          <div className="mt-1 font-mono text-xs text-slate-300">A apex -&gt; your hosting provider IP</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Contact Form</div>
                      <p className="mt-2 text-sm text-slate-400">Build a lead capture form that pops up when visitors click your CTA buttons.</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => router.push(`/form/${pageId}`)}
                          className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-4 py-2 text-sm font-semibold text-cyan-200"
                        >
                          📋 Form Builder
                        </button>
                        <button
                          onClick={() => router.push(`/entries/${pageId}`)}
                          className="rounded-full bg-purple-400/10 border border-purple-400/30 px-4 py-2 text-sm font-semibold text-purple-200"
                        >
                          📊 View Entries
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Theme</div>
                      <div className="mt-4 space-y-4">
                        <EditorColorInput
                          label="Primary tone"
                          value={page.theme.primary_color}
                          onChange={(value) => updateThemeField("primary_color", value)}
                        />
                        <EditorColorInput
                          label="Secondary tone"
                          value={page.theme.secondary_color}
                          onChange={(value) => updateThemeField("secondary_color", value)}
                        />
                        <EditorColorInput
                          label="Background tone"
                          value={page.theme.background_tone}
                          onChange={(value) => updateThemeField("background_tone", value)}
                        />
                        <EditorColorInput
                          label="Accent color"
                          value={page.theme.accent_color}
                          onChange={(value) => updateThemeField("accent_color", value)}
                        />
                        <EditorColorInput
                          label="Highlight color"
                          value={page.theme.highlight_tone}
                          onChange={(value) => updateThemeField("highlight_tone", value)}
                        />
                        <EditorColorInput
                          label="Surface tone"
                          value={page.theme.surface_tone}
                          onChange={(value) => updateThemeField("surface_tone", value)}
                        />
                        <ThemeSelect
                          label="Font system"
                          value={page.theme.font_style}
                          onChange={(value) => updateThemeField("font_style", value)}
                          options={[
                            { value: "modern", label: "Modern Sans" },
                            { value: "display", label: "Display Sans" },
                            { value: "editorial", label: "Editorial Serif" },
                            { value: "luxury", label: "Luxury Serif" },
                            { value: "geometric", label: "Geometric Sans" },
                            { value: "mono", label: "Mono" },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Preview device</div>
                      <div className="mt-3 flex gap-2 rounded-full border border-white/10 bg-slate-900/80 p-1">
                        <DeviceButton
                          label="Laptop"
                          active={previewMode === "desktop"}
                          onClick={() => setPreviewMode("desktop")}
                        />
                        <DeviceButton
                          label="Mobile"
                          active={previewMode === "mobile"}
                          onClick={() => setPreviewMode("mobile")}
                        />
                      </div>
                      <div className="mt-3 text-sm text-slate-400">
                        Mobile mode shrinks the canvas so you can check spacing and content density before saving.
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showAuth ? <AuthModal onClose={() => setShowAuth(false)} /> : null}
    </div>
  );
}

function EditorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[18px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
      />
    </label>
  );
}

function EditorColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-slate-900/80 px-3 py-2.5">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-xl border border-white/10 bg-transparent"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 bg-transparent text-sm text-white outline-none"
        />
      </div>
    </label>
  );
}

function ThemeSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[18px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MiniButton({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs ${
        danger
          ? "border-rose-400/25 bg-rose-500/10 text-rose-100"
          : "border-white/10 bg-white/[0.04] text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function SidebarTabButton({
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
      className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
        active ? "bg-cyan-400 text-slate-950" : "text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function DeviceButton({
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
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-white text-slate-950" : "text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
