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

type ObjectField = {
  key: string;
  label: string;
  kind?: FieldKind;
};

type ListSchema = {
  key: string;
  label: string;
  itemLabel: string;
  fields: ObjectField[];
};

type SectionDesign = {
  backgroundColor?: string;
  panelColor?: string;
  borderColor?: string;
  headingColor?: string;
  bodyColor?: string;
  accentColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  headingFont?: string;
  bodyFont?: string;
  contentAlign?: "left" | "center";
  sectionPadding?: string;
  headingSize?: string;
};

const FONT_OPTIONS = [
  { value: "modern", label: "Modern Sans" },
  { value: "display", label: "Display Sans" },
  { value: "editorial", label: "Editorial Serif" },
  { value: "luxury", label: "Luxury Serif" },
  { value: "geometric", label: "Geometric Sans" },
  { value: "mono", label: "Mono" },
];

const SPACING_OPTIONS = [
  { value: "py-16", label: "Compact" },
  { value: "py-24", label: "Balanced" },
  { value: "py-32", label: "Spacious" },
];

const HEADING_SIZE_OPTIONS = [
  { value: "2.5rem", label: "Medium" },
  { value: "3.25rem", label: "Large" },
  { value: "4.25rem", label: "XL" },
  { value: "5.25rem", label: "Hero XL" },
];

const LAYOUT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  hero: [
    { value: "split-right", label: "Split Right" },
    { value: "split-left", label: "Split Left" },
    { value: "centered", label: "Centered" },
    { value: "stacked-showcase", label: "Stacked Showcase" },
  ],
  features: [
    { value: "cards-3", label: "3 Column Grid" },
    { value: "cards-2", label: "2 Column Grid" },
    { value: "spotlight-first", label: "Spotlight First Card" },
    { value: "alternating", label: "Alternating Rows" },
  ],
  about: [
    { value: "split-media", label: "Split Media" },
    { value: "story-card", label: "Story Card" },
    { value: "stats-left", label: "Stats Left" },
  ],
  testimonials: [
    { value: "grid", label: "Grid" },
    { value: "spotlight", label: "Spotlight" },
    { value: "stacked", label: "Stacked" },
  ],
  faq: [
    { value: "accordion", label: "Accordion" },
    { value: "two-column", label: "Two Column" },
  ],
  contact: [
    { value: "split", label: "Split" },
    { value: "centered", label: "Centered" },
    { value: "compact", label: "Compact" },
  ],
};

const SECTION_FIELDS: Record<string, { simple?: ObjectField[]; lists?: ListSchema[]; media?: boolean }> = {
  header: {
    simple: [
      { key: "announcement", label: "Announcement", kind: "textarea" },
      { key: "cta_label", label: "CTA label" },
    ],
    lists: [
      {
        key: "nav_items",
        label: "Navigation items",
        itemLabel: "Nav item",
        fields: [{ key: "value", label: "Label" }],
      },
    ],
  },
  hero: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "headline", label: "Headline", kind: "textarea" },
      { key: "subheadline", label: "Subheadline", kind: "textarea" },
      { key: "primary_cta", label: "Primary CTA" },
      { key: "secondary_cta", label: "Secondary CTA" },
      { key: "image_query", label: "Image query", kind: "textarea" },
      { key: "image_role", label: "Image role", kind: "textarea" },
    ],
    lists: [
      {
        key: "stats",
        label: "Stats",
        itemLabel: "Stat",
        fields: [
          { key: "label", label: "Label" },
          { key: "value", label: "Value" },
        ],
      },
    ],
    media: true,
  },
  features: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
    ],
    lists: [
      {
        key: "items",
        label: "Feature cards",
        itemLabel: "Feature",
        fields: [
          { key: "icon", label: "Icon" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description", kind: "textarea" },
        ],
      },
    ],
  },
  about: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "image_query", label: "Image query", kind: "textarea" },
      { key: "image_role", label: "Image role", kind: "textarea" },
    ],
    lists: [
      {
        key: "bullets",
        label: "Bullets",
        itemLabel: "Bullet",
        fields: [{ key: "value", label: "Text", kind: "textarea" }],
      },
      {
        key: "stats",
        label: "Stats",
        itemLabel: "Stat",
        fields: [
          { key: "label", label: "Label" },
          { key: "value", label: "Value" },
        ],
      },
    ],
    media: true,
  },
  testimonials: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "image_query", label: "Image query", kind: "textarea" },
      { key: "image_role", label: "Image role", kind: "textarea" },
    ],
    lists: [
      {
        key: "items",
        label: "Testimonials",
        itemLabel: "Testimonial",
        fields: [
          { key: "name", label: "Name" },
          { key: "role", label: "Role" },
          { key: "quote", label: "Quote", kind: "textarea" },
        ],
      },
    ],
    media: true,
  },
  faq: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
    ],
    lists: [
      {
        key: "items",
        label: "FAQ items",
        itemLabel: "Question",
        fields: [
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer", kind: "textarea" },
        ],
      },
    ],
  },
  contact: {
    simple: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", kind: "textarea" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "primary_cta", label: "Primary CTA" },
      { key: "secondary_cta", label: "Secondary CTA" },
      { key: "email", label: "Email" },
    ],
    lists: [
      {
        key: "links",
        label: "Links",
        itemLabel: "Link",
        fields: [
          { key: "label", label: "Label" },
          { key: "href", label: "URL" },
        ],
      },
    ],
  },
};

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asObjectList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item))
    : [];
}

function defaultItemFor(fields: ObjectField[]) {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

function mergeMediaChoices(section: LandingSectionRecord) {
  const fromData = asObjectList(section.data.media_choices);
  const assets = asObject(section.assets);
  const fromAssets = ["stock", "generated"].flatMap((bucket) => asObjectList(assets[bucket]));
  const unique = new Map<string, Record<string, unknown>>();

  [...fromData, ...fromAssets].forEach((item) => {
    const url = asString(item.url);
    if (url && !unique.has(url)) {
      unique.set(url, item);
    }
  });

  return Array.from(unique.values());
}

function applySectionData(section: LandingSectionRecord, nextData: Record<string, unknown>) {
  return {
    ...section,
    data: nextData,
  };
}

function applyMedia(section: LandingSectionRecord, media: Record<string, unknown>, mediaChoices?: Record<string, unknown>[]) {
  return {
    ...section,
    data: {
      ...section.data,
      media,
      media_choices: mediaChoices ?? section.data.media_choices,
    },
  };
}

function getSectionDesign(section: LandingSectionRecord) {
  return asObject(section.data.design) as SectionDesign;
}

export default function VisualEditorPanel({ section, onChange }: Props) {
  const config = section ? SECTION_FIELDS[section.name] : null;
  const [imageSearch, setImageSearch] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageMessage, setImageMessage] = useState("");

  useEffect(() => {
    if (!section) {
      setImageSearch("");
      setImageMessage("");
      return;
    }
    const query = asString(section.strategy.image_query) || asString(section.data.image_query);
    setImageSearch(query);
    setImageMessage("");
  }, [section]);

  const mediaChoices = useMemo(() => (section ? mergeMediaChoices(section) : []), [section]);
  const selectedMedia = useMemo(() => (section ? asObject(section.data.media) : {}), [section]);

  if (!section || !config) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-400">
        Select a section to start editing.
      </div>
    );
  }

  const currentSection = section;
  const design = getSectionDesign(currentSection);

  function updateDesign(key: keyof SectionDesign, value: string) {
    const nextDesign: SectionDesign = {
      ...design,
      [key]: value,
    };

    onChange(
      applySectionData(currentSection, {
        ...currentSection.data,
        design: nextDesign,
      })
    );
  }

  function setValue(key: string, value: string) {
    onChange(
      applySectionData(currentSection, {
        ...currentSection.data,
        [key]: value,
      })
    );
  }

  function setStringListValue(key: string, index: number, value: string) {
    const current = asStringList(currentSection.data[key]);
    current[index] = value;
    onChange(applySectionData(currentSection, { ...currentSection.data, [key]: current }));
  }

  function addStringListValue(key: string) {
    const current = asStringList(currentSection.data[key]);
    onChange(applySectionData(currentSection, { ...currentSection.data, [key]: [...current, ""] }));
  }

  function removeStringListValue(key: string, index: number) {
    const current = asStringList(currentSection.data[key]).filter((_, itemIndex) => itemIndex !== index);
    onChange(applySectionData(currentSection, { ...currentSection.data, [key]: current }));
  }

  function moveStringListValue(key: string, index: number, direction: -1 | 1) {
    const current = [...asStringList(currentSection.data[key])];
    const target = index + direction;
    if (target < 0 || target >= current.length) {
      return;
    }
    [current[index], current[target]] = [current[target], current[index]];
    onChange(applySectionData(currentSection, { ...currentSection.data, [key]: current }));
  }

  function updateObjectListValue(listKey: string, index: number, fieldKey: string, value: string) {
    const current = [...asObjectList(currentSection.data[listKey])];
    current[index] = { ...current[index], [fieldKey]: value };
    onChange(applySectionData(currentSection, { ...currentSection.data, [listKey]: current }));
  }

  function addObjectListValue(listKey: string, fields: ObjectField[]) {
    const current = asObjectList(currentSection.data[listKey]);
    onChange(applySectionData(currentSection, { ...currentSection.data, [listKey]: [...current, defaultItemFor(fields)] }));
  }

  function removeObjectListValue(listKey: string, index: number) {
    const current = asObjectList(currentSection.data[listKey]).filter((_, itemIndex) => itemIndex !== index);
    onChange(applySectionData(currentSection, { ...currentSection.data, [listKey]: current }));
  }

  function moveObjectListValue(listKey: string, index: number, direction: -1 | 1) {
    const current = [...asObjectList(currentSection.data[listKey])];
    const target = index + direction;
    if (target < 0 || target >= current.length) {
      return;
    }
    [current[index], current[target]] = [current[target], current[index]];
    onChange(applySectionData(currentSection, { ...currentSection.data, [listKey]: current }));
  }

  async function searchImages() {
    const query = imageSearch.trim();
    if (!query) {
      setImageMessage("Add a search phrase first.");
      return;
    }

    setImageLoading(true);
    setImageMessage("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}stock-images/?query=${encodeURIComponent(query)}`
      );
      const data = await parseApiResponse<{ results?: Record<string, unknown>[]; hint?: string; warning?: string }>(response);
      const results = Array.isArray(data.results) ? data.results : [];
      const mergedChoices = [...results, ...mediaChoices];
      onChange(
        applyMedia(
          currentSection,
          asObject(currentSection.data.media),
          dedupeByUrl(mergedChoices)
        )
      );
      setImageMessage(results.length ? "Fresh image options loaded." : data.hint || data.warning || "No results found.");
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : "Image search failed.");
    } finally {
      setImageLoading(false);
    }
  }

  async function generateImage() {
    setImageLoading(true);
    setImageMessage("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}generate-image/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            imageSearch ||
            asString(currentSection.strategy.image_query) ||
            asString(currentSection.data.title) ||
            currentSection.name,
          variant: currentSection.name,
        }),
      });
      const data = await parseApiResponse<Record<string, unknown>>(response);
      const generated = {
        url: asString(data.url),
        alt: `${currentSection.name} generated visual`,
        provider: asString(data.provider) || "generated",
        thumbnail: asString(data.url),
      };
      onChange(applyMedia(currentSection, generated, dedupeByUrl([generated, ...mediaChoices])));
      setImageMessage("Generated a fresh visual for this section.");
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : "Image generation failed.");
    } finally {
      setImageLoading(false);
    }
  }

  async function uploadImage(file: File | null) {
    if (!file) {
      return;
    }

    setImageLoading(true);
    setImageMessage("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}landing-image-upload/`, {
        method: "POST",
        body: formData,
      });
      const data = await parseApiResponse<Record<string, unknown>>(response);
      const uploaded = {
        url: asString(data.url),
        alt: file.name,
        provider: "upload",
        thumbnail: asString(data.url),
      };
      onChange(applyMedia(currentSection, uploaded, dedupeByUrl([uploaded, ...mediaChoices])));
      setImageMessage("Uploaded image applied to this section.");
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-[28px] border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-cyan-200">Visual editor</div>
        <h2 className="mt-2 text-2xl font-semibold capitalize">{currentSection.name}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Edit copy, blocks, and media here. The preview on the left updates immediately.
        </p>
      </div>

      <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div>
          <div className="text-sm font-semibold text-white">Style studio</div>
          <div className="mt-1 text-sm text-slate-400">
            Control fonts, colors, spacing, alignment, and button styling for this section.
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {LAYOUT_OPTIONS[currentSection.name] ? (
            <SelectControl
              label="Layout"
              value={asString(currentSection.data.layout_variant) || LAYOUT_OPTIONS[currentSection.name]?.[0]?.value || ""}
              options={LAYOUT_OPTIONS[currentSection.name]}
              onChange={(value) => setValue("layout_variant", value)}
            />
          ) : null}
          <SelectControl
            label="Content alignment"
            value={design.contentAlign || "left"}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
            ]}
            onChange={(value) => updateDesign("contentAlign", value)}
          />
          <SelectControl
            label="Section spacing"
            value={design.sectionPadding || "py-24"}
            options={SPACING_OPTIONS}
            onChange={(value) => updateDesign("sectionPadding", value)}
          />
          <SelectControl
            label="Heading font"
            value={design.headingFont || "display"}
            options={FONT_OPTIONS}
            onChange={(value) => updateDesign("headingFont", value)}
          />
          <SelectControl
            label="Body font"
            value={design.bodyFont || "modern"}
            options={FONT_OPTIONS}
            onChange={(value) => updateDesign("bodyFont", value)}
          />
          <SelectControl
            label="Heading size"
            value={design.headingSize || "3.25rem"}
            options={HEADING_SIZE_OPTIONS}
            onChange={(value) => updateDesign("headingSize", value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ColorControl label="Section background" value={design.backgroundColor || "#020617"} onChange={(value) => updateDesign("backgroundColor", value)} />
          <ColorControl label="Card / panel background" value={design.panelColor || "#111827"} onChange={(value) => updateDesign("panelColor", value)} />
          <ColorControl label="Heading color" value={design.headingColor || "#ffffff"} onChange={(value) => updateDesign("headingColor", value)} />
          <ColorControl label="Body color" value={design.bodyColor || "#cbd5e1"} onChange={(value) => updateDesign("bodyColor", value)} />
          <ColorControl label="Accent / eyebrow" value={design.accentColor || "#67e8f9"} onChange={(value) => updateDesign("accentColor", value)} />
          <ColorControl label="Border color" value={design.borderColor || "#334155"} onChange={(value) => updateDesign("borderColor", value)} />
          <ColorControl label="Button background" value={design.buttonColor || "#22d3ee"} onChange={(value) => updateDesign("buttonColor", value)} />
          <ColorControl label="Button text" value={design.buttonTextColor || "#ffffff"} onChange={(value) => updateDesign("buttonTextColor", value)} />
        </div>
      </div>

      {config.simple?.map((field) => (
        <FieldControl
          key={field.key}
          label={field.label}
          multiline={field.kind === "textarea"}
          value={asString(currentSection.data[field.key])}
          onChange={(value) => setValue(field.key, value)}
        />
      ))}

      {config.lists?.map((list) => (
        <div key={list.key} className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{list.label}</div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Repeatable blocks</div>
            </div>
            <button
              type="button"
              onClick={() =>
                list.fields.length === 1 && list.fields[0]?.key === "value"
                  ? addStringListValue(list.key)
                  : addObjectListValue(list.key, list.fields)
              }
              className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
            >
              Add {list.itemLabel}
            </button>
          </div>

          {list.fields.length === 1 && list.fields[0]?.key === "value"
            ? asStringList(currentSection.data[list.key]).map((item, index) => (
                <div key={`${list.key}-${index}`} className="rounded-[20px] border border-white/10 bg-slate-900/80 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      {list.itemLabel} {index + 1}
                    </div>
                    <div className="flex gap-2">
                      <ActionButton label="Up" onClick={() => moveStringListValue(list.key, index, -1)} />
                      <ActionButton label="Down" onClick={() => moveStringListValue(list.key, index, 1)} />
                      <ActionButton label="Remove" onClick={() => removeStringListValue(list.key, index)} danger />
                    </div>
                  </div>
                  <FieldControl
                    label={list.fields[0].label}
                    multiline={list.fields[0].kind === "textarea"}
                    value={item}
                    onChange={(value) => setStringListValue(list.key, index, value)}
                  />
                </div>
              ))
            : asObjectList(currentSection.data[list.key]).map((item, index) => (
                <div key={`${list.key}-${index}`} className="space-y-3 rounded-[20px] border border-white/10 bg-slate-900/80 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      {list.itemLabel} {index + 1}
                    </div>
                    <div className="flex gap-2">
                      <ActionButton label="Up" onClick={() => moveObjectListValue(list.key, index, -1)} />
                      <ActionButton label="Down" onClick={() => moveObjectListValue(list.key, index, 1)} />
                      <ActionButton label="Remove" onClick={() => removeObjectListValue(list.key, index)} danger />
                    </div>
                  </div>
                  {list.fields.map((field) => (
                    <FieldControl
                      key={field.key}
                      label={field.label}
                      multiline={field.kind === "textarea"}
                      value={asString(item[field.key])}
                      onChange={(value) => updateObjectListValue(list.key, index, field.key, value)}
                    />
                  ))}
                </div>
              ))}
        </div>
      ))}

      {config.media ? (
        <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div>
            <div className="text-sm font-semibold text-white">Media</div>
            <div className="mt-1 text-sm text-slate-400">
              Pick the section visual, search for stronger matches, generate one, or upload your own.
            </div>
          </div>

              <FieldControl label="Search query" multiline value={imageSearch} onChange={setImageSearch} />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={searchImages}
              disabled={imageLoading}
              className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-60"
            >
              Search stock
            </button>
            <button
              type="button"
              onClick={generateImage}
              disabled={imageLoading}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Generate visual
            </button>
            <label className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  void uploadImage(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {imageMessage ? <div className="text-sm text-slate-400">{imageMessage}</div> : null}

          {asString(selectedMedia.url) ? (
            <div className="overflow-hidden rounded-[24px] border border-cyan-400/20 bg-slate-900/70">
              <img
                src={asString(selectedMedia.url)}
                  alt={asString(selectedMedia.alt) || `${currentSection.name} media`}
                className="h-48 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-slate-400">
                <span>{asString(selectedMedia.provider) || "selected image"}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      applySectionData(currentSection, {
                        ...currentSection.data,
                        media: {},
                      })
                    )
                  }
                  className="rounded-full border border-white/15 px-3 py-1 text-white"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {mediaChoices.map((item, index) => (
              <button
                key={`${asString(item.url)}-${index}`}
                type="button"
                onClick={() => onChange(applyMedia(currentSection, item, dedupeByUrl(mediaChoices)))}
                className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/70 text-left transition hover:border-cyan-400/30"
              >
                <img
                  src={asString(item.thumbnail) || asString(item.url)}
                  alt={asString(item.alt) || `${currentSection.name} option`}
                  className="h-36 w-full object-cover"
                />
                <div className="space-y-1 px-3 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{asString(item.provider) || "image"}</div>
                  <div className="line-clamp-2 text-sm text-slate-200">{asString(item.alt) || imageSearch || currentSection.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function dedupeByUrl(items: Record<string, unknown>[]) {
  const map = new Map<string, Record<string, unknown>>();
  items.forEach((item) => {
    const url = asString(item.url);
    if (url && !map.has(url)) {
      map.set(url, item);
    }
  });
  return Array.from(map.values());
}

function FieldControl({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
        />
      )}
    </label>
  );
}

function ActionButton({
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
      className={`rounded-full border px-3 py-1 text-xs ${
        danger
          ? "border-rose-400/25 bg-rose-500/10 text-rose-100"
          : "border-white/10 bg-white/5 text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function SelectControl({
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
        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
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

function ColorControl({
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
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5">
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
