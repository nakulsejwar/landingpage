/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { LandingPageResponse, LandingSectionRecord, LandingTheme } from "../../lib/landing";

type Props = {
  page: Pick<LandingPageResponse, "brand_name" | "tagline" | "theme" | "sections">;
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

const FONT_STACKS: Record<string, string> = {
  modern: '"Segoe UI", "Trebuchet MS", "Helvetica Neue", Arial, sans-serif',
  display: '"Arial Black", "Segoe UI", "Trebuchet MS", Arial, sans-serif',
  editorial: 'Georgia, "Times New Roman", serif',
  mono: '"Consolas", "SFMono-Regular", monospace',
  luxury: '"Palatino Linotype", "Book Antiqua", serif',
  geometric: '"Century Gothic", "Avenir Next", sans-serif',
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asObjectArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    : [];
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function getMedia(data: Record<string, unknown>) {
  const media = data.media;
  return media && typeof media === "object" ? (media as Record<string, unknown>) : null;
}

function resolveFont(preset: string | undefined, fallback: string) {
  return FONT_STACKS[preset || ""] || fallback;
}

function getSectionDesign(data: Record<string, unknown>) {
  return asObject(data.design) as SectionDesign;
}

function sectionClasses(theme: LandingTheme) {
  const bodyFont = resolveFont(theme.font_style, FONT_STACKS.modern);
  const headingFont = resolveFont(theme.font_style === "editorial" ? "luxury" : "display", FONT_STACKS.display);

  return {
    surface: {
      backgroundColor: theme.surface_tone,
      borderColor: `${theme.accent_color}33`,
    },
    button: {
      background: `linear-gradient(135deg, ${theme.accent_color}, ${theme.highlight_tone})`,
      color: "#ffffff",
    },
    shell: {
      background: `radial-gradient(circle at top left, ${theme.accent_color}22, transparent 30%), radial-gradient(circle at top right, ${theme.highlight_tone}22, transparent 30%), linear-gradient(180deg, ${theme.background_tone}, ${theme.primary_color})`,
      fontFamily: bodyFont,
    },
    headingFont,
    bodyFont,
  };
}

function getTextAlignClass(alignment?: string) {
  return alignment === "center" ? "text-center" : "text-left";
}

function getSectionPaddingClass(value?: string) {
  return value || "py-24";
}

function getSectionShellStyle(design: SectionDesign) {
  return design.backgroundColor ? { backgroundColor: design.backgroundColor } : undefined;
}

function getSurfaceStyle(base: ReturnType<typeof sectionClasses>, design: SectionDesign) {
  return {
    ...base.surface,
    ...(design.panelColor ? { backgroundColor: design.panelColor } : {}),
    ...(design.borderColor ? { borderColor: design.borderColor } : {}),
    ...(design.bodyColor ? { color: design.bodyColor } : {}),
  };
}

function getButtonStyle(base: ReturnType<typeof sectionClasses>, design: SectionDesign) {
  return {
    ...base.button,
    ...(design.buttonColor ? { background: design.buttonColor } : {}),
    ...(design.buttonTextColor ? { color: design.buttonTextColor } : {}),
  };
}

function getHeadingStyle(base: ReturnType<typeof sectionClasses>, design: SectionDesign) {
  return {
    color: design.headingColor || "#ffffff",
    fontFamily: resolveFont(design.headingFont, base.headingFont),
    ...(design.headingSize ? { fontSize: design.headingSize, lineHeight: 1 } : {}),
  };
}

function getBodyStyle(base: ReturnType<typeof sectionClasses>, design: SectionDesign) {
  return {
    color: design.bodyColor || "#cbd5e1",
    fontFamily: resolveFont(design.bodyFont, base.bodyFont),
  };
}

function getEyebrowStyle(base: ReturnType<typeof sectionClasses>, design: SectionDesign) {
  return {
    color: design.accentColor || "#a5f3fc",
    fontFamily: resolveFont(design.bodyFont, base.bodyFont),
  };
}

export default function LandingRenderer({ page }: Props) {
  const theme = page.theme;
  const styles = sectionClasses(theme);

  return (
    <main style={styles.shell} className="min-h-screen text-white">
      {page.sections.map((section) => (
        <RenderSection
          key={section.name}
          section={section}
          theme={theme}
          brandName={page.brand_name}
          tagline={page.tagline}
          styles={styles}
        />
      ))}
    </main>
  );
}

function RenderSection({
  section,
  theme,
  brandName,
  tagline,
  styles,
}: {
  section: LandingSectionRecord;
  theme: LandingTheme;
  brandName: string;
  tagline: string;
  styles: ReturnType<typeof sectionClasses>;
}) {
  const data = section.data || {};

  switch (section.name) {
    case "header":
      return <HeaderSection data={data} brandName={brandName} styles={styles} />;
    case "hero":
      return <HeroSection data={data} brandName={brandName} tagline={tagline} styles={styles} />;
    case "features":
      return <FeaturesSection data={data} styles={styles} />;
    case "about":
      return <AboutSection data={data} styles={styles} />;
    case "testimonials":
      return <TestimonialsSection data={data} styles={styles} />;
    case "faq":
      return <FaqSection data={data} styles={styles} />;
    case "contact":
      return <ContactSection data={data} brandName={brandName} styles={styles} theme={theme} />;
    default:
      return null;
  }
}

function HeaderSection({
  data,
  brandName,
  styles,
}: {
  data: Record<string, unknown>;
  brandName: string;
  styles: ReturnType<typeof sectionClasses>;
}) {
  const [open, setOpen] = useState(false);
  const design = getSectionDesign(data);
  const navItems = asStringArray(data.nav_items).length ? asStringArray(data.nav_items) : ["Features", "About", "Testimonials", "FAQ", "Contact"];
  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl"
      style={getSectionShellStyle(design)}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div>
          <div className="text-lg font-semibold" style={getHeadingStyle(styles, design)}>{brandName}</div>
          <div className="text-xs uppercase tracking-[0.25em]" style={getEyebrowStyle(styles, design)}>
            {asString(data.announcement, "AI-crafted landing page")}
          </div>
        </div>
        <nav className="hidden items-center gap-6 md:flex" style={getBodyStyle(styles, design)}>
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm hover:text-white">
              {item}
            </a>
          ))}
          <a href="#contact" style={getButtonStyle(styles, design)} className="rounded-full px-5 py-2 text-sm font-semibold">
            {asString(data.cta_label, "Book Demo")}
          </a>
        </nav>
        <button onClick={() => setOpen((value) => !value)} className="md:hidden rounded-full border border-white/10 px-4 py-2 text-sm">
          Menu
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 px-6 py-4 md:hidden" style={getBodyStyle(styles, design)}>
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm">
                {item}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroSection({
  data,
  brandName,
  tagline,
  styles,
}: {
  data: Record<string, unknown>;
  brandName: string;
  tagline: string;
  styles: ReturnType<typeof sectionClasses>;
}) {
  const design = getSectionDesign(data);
  const layoutVariant = asString(data.layout_variant, "split-right");
  const stats = asObjectArray(data.stats);
  const media = getMedia(data);
  const alignClass = getTextAlignClass(design.contentAlign);
  const surfaceStyle = getSurfaceStyle(styles, design);
  const showCentered = layoutVariant === "centered";
  const showStacked = layoutVariant === "stacked-showcase";
  const reverseSplit = layoutVariant === "split-left";
  const textBlock = (
    <div className={showCentered ? "mx-auto max-w-3xl lg:col-span-2" : ""}>
      <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.28em]" style={getEyebrowStyle(styles, design)}>
        {asString(data.eyebrow, tagline || brandName)}
      </div>
      <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl" style={getHeadingStyle(styles, design)}>
        {asString(data.headline, brandName)}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8" style={getBodyStyle(styles, design)}>
        {asString(data.subheadline)}
      </p>
      <div className={`mt-8 flex flex-wrap gap-4 ${design.contentAlign === "center" || showCentered ? "justify-center" : ""}`}>
        <a href="#contact" style={getButtonStyle(styles, design)} className="rounded-full px-6 py-3 font-semibold shadow-lg">
          {asString(data.primary_cta, "Get Started")}
        </a>
        <a href="#features" className="rounded-full border border-white/15 px-6 py-3 font-semibold" style={getBodyStyle(styles, design)}>
          {asString(data.secondary_cta, "See Features")}
        </a>
      </div>
      {stats.length ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map((item, index) => (
            <div key={index} style={surfaceStyle} className="rounded-3xl border p-4 backdrop-blur">
              <div className="text-2xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.value)}</div>
              <div className="mt-1 text-sm" style={getBodyStyle(styles, design)}>{asString(item.label)}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
  const mediaBlock = (
    <div className="flex items-center">
      <div className="relative w-full rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur" style={surfaceStyle}>
        <div className="absolute -left-8 top-6 h-24 w-24 rounded-full blur-3xl" style={{ backgroundColor: `${design.accentColor || "#22d3ee"}44` }} />
        <div className="absolute -right-8 bottom-6 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: `${design.buttonColor || "#a855f7"}44` }} />
        {media?.url ? (
          <img
            src={asString(media.url)}
            alt={asString(media.alt, "Hero visual")}
            className="relative h-[420px] w-full rounded-[24px] object-cover"
          />
        ) : (
          <div className="relative flex h-[420px] items-center justify-center rounded-[24px] text-slate-200" style={{ background: `linear-gradient(135deg, ${design.accentColor || "rgba(34,211,238,0.16)"}, ${design.buttonColor || "rgba(168,85,247,0.18)"}, rgba(255,255,255,0.06))` }}>
            Cinematic product visual
          </div>
        )}
      </div>
    </div>
  );
  return (
    <section id="hero" className={`relative overflow-hidden ${getSectionPaddingClass(design.sectionPadding)}`} style={getSectionShellStyle(design)}>
      <div className={`mx-auto max-w-7xl px-6 lg:px-8 ${alignClass}`}>
        {showCentered ? (
          <div className="text-center">{textBlock}</div>
        ) : showStacked ? (
          <div className="space-y-10">
            {textBlock}
            {mediaBlock}
          </div>
        ) : (
          <div className={`grid gap-12 lg:grid-cols-[1.05fr_0.95fr] ${reverseSplit ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""}`}>
            {textBlock}
            {mediaBlock}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturesSection({ data, styles }: { data: Record<string, unknown>; styles: ReturnType<typeof sectionClasses> }) {
  const design = getSectionDesign(data);
  const layoutVariant = asString(data.layout_variant, "cards-3");
  const items = asObjectArray(data.items);
  return (
    <section id="features" className={`mx-auto max-w-7xl px-6 lg:px-8 ${getSectionPaddingClass(design.sectionPadding)}`} style={getSectionShellStyle(design)}>
      <SectionHeading data={data} styles={styles} design={design} />
      {layoutVariant === "spotlight-first" && items.length ? (
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div style={getSurfaceStyle(styles, design)} className="rounded-[32px] border p-8 backdrop-blur">
            <div className="text-3xl" style={getEyebrowStyle(styles, design)}>{asString(items[0]?.icon, "*")}</div>
            <h3 className="mt-5 text-3xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(items[0]?.title)}</h3>
            <p className="mt-4 text-base leading-8" style={getBodyStyle(styles, design)}>{asString(items[0]?.description)}</p>
          </div>
          <div className="grid gap-5">
            {items.slice(1).map((item, index) => (
              <div key={index} style={getSurfaceStyle(styles, design)} className="rounded-[28px] border p-6 backdrop-blur">
                <div className="text-2xl" style={getEyebrowStyle(styles, design)}>{asString(item.icon, "*")}</div>
                <h3 className="mt-4 text-xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.title)}</h3>
                <p className="mt-3 text-sm leading-7" style={getBodyStyle(styles, design)}>{asString(item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : layoutVariant === "alternating" ? (
        <div className="mt-12 space-y-5">
          {items.map((item, index) => (
            <div key={index} className={`grid gap-5 rounded-[30px] border p-6 backdrop-blur lg:grid-cols-[0.4fr_1fr] ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""}`} style={getSurfaceStyle(styles, design)}>
              <div className="text-4xl" style={getEyebrowStyle(styles, design)}>{asString(item.icon, "*")}</div>
              <div>
                <h3 className="text-2xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.title)}</h3>
                <p className="mt-3 text-base leading-8" style={getBodyStyle(styles, design)}>{asString(item.description)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`mt-12 grid gap-5 ${layoutVariant === "cards-2" ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
          {items.map((item, index) => (
            <div key={index} style={getSurfaceStyle(styles, design)} className="rounded-[28px] border p-6 backdrop-blur">
              <div className="text-2xl" style={getEyebrowStyle(styles, design)}>{asString(item.icon, "*")}</div>
              <h3 className="mt-4 text-xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.title)}</h3>
              <p className="mt-3 text-sm leading-7" style={getBodyStyle(styles, design)}>{asString(item.description)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AboutSection({ data, styles }: { data: Record<string, unknown>; styles: ReturnType<typeof sectionClasses> }) {
  const design = getSectionDesign(data);
  const layoutVariant = asString(data.layout_variant, "split-media");
  const bullets = asStringArray(data.bullets);
  const stats = asObjectArray(data.stats);
  const media = getMedia(data);
  return (
    <section id="about" className={`mx-auto max-w-7xl px-6 lg:px-8 ${getSectionPaddingClass(design.sectionPadding)}`} style={getSectionShellStyle(design)}>
      {layoutVariant === "story-card" ? (
        <div style={getSurfaceStyle(styles, design)} className="rounded-[34px] border p-8 backdrop-blur">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <SectionHeading data={data} styles={styles} design={design} />
              <div className="mt-6 space-y-4" style={getBodyStyle(styles, design)}>
                {bullets.map((item, index) => (
                  <div key={index} className="rounded-2xl border px-4 py-3" style={getSurfaceStyle(styles, design)}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {media?.url ? (
              <img
                src={asString(media.url)}
                alt={asString(media.alt, "About visual")}
                className="h-full min-h-[320px] w-full rounded-[28px] border object-cover"
                style={getSurfaceStyle(styles, design)}
              />
            ) : null}
          </div>
        </div>
      ) : layoutVariant === "stats-left" ? (
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((item, index) => (
              <div key={index} style={getSurfaceStyle(styles, design)} className="rounded-3xl border p-5">
                <div className="text-3xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.value)}</div>
                <div className="mt-2 text-sm" style={getBodyStyle(styles, design)}>{asString(item.label)}</div>
              </div>
            ))}
          </div>
          <div>
            <SectionHeading data={data} styles={styles} design={design} />
            <div className="mt-6 space-y-4" style={getBodyStyle(styles, design)}>
              {bullets.map((item, index) => (
                <div key={index} className="rounded-2xl border px-4 py-3" style={getSurfaceStyle(styles, design)}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeading data={data} styles={styles} design={design} />
            <div className="mt-6 space-y-4" style={getBodyStyle(styles, design)}>
              {bullets.map((item, index) => (
                <div key={index} className="rounded-2xl border px-4 py-3" style={getSurfaceStyle(styles, design)}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            {media?.url ? (
              <img
                src={asString(media.url)}
                alt={asString(media.alt, "About visual")}
                className="h-[280px] w-full rounded-[28px] border object-cover"
                style={getSurfaceStyle(styles, design)}
              />
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((item, index) => (
                <div key={index} style={getSurfaceStyle(styles, design)} className="rounded-3xl border p-4">
                  <div className="text-2xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.value)}</div>
                  <div className="mt-1 text-sm" style={getBodyStyle(styles, design)}>{asString(item.label)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TestimonialsSection({ data, styles }: { data: Record<string, unknown>; styles: ReturnType<typeof sectionClasses> }) {
  const design = getSectionDesign(data);
  const layoutVariant = asString(data.layout_variant, "grid");
  const items = asObjectArray(data.items);
  return (
    <section id="testimonials" className={`mx-auto max-w-7xl px-6 lg:px-8 ${getSectionPaddingClass(design.sectionPadding)}`} style={getSectionShellStyle(design)}>
      <SectionHeading data={data} styles={styles} design={design} />
      {layoutVariant === "spotlight" && items.length ? (
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div style={getSurfaceStyle(styles, design)} className="rounded-[32px] border p-8 backdrop-blur">
            <p className="text-2xl leading-9" style={getBodyStyle(styles, design)}>&ldquo;{asString(items[0]?.quote)}&rdquo;</p>
            <div className="mt-8">
              <div className="text-xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(items[0]?.name)}</div>
              <div className="mt-1 text-sm" style={getBodyStyle(styles, design)}>{asString(items[0]?.role)}</div>
            </div>
          </div>
          <div className="grid gap-5">
            {items.slice(1).map((item, index) => (
              <div key={index} style={getSurfaceStyle(styles, design)} className="rounded-[28px] border p-6 backdrop-blur">
                <p className="text-base leading-7" style={getBodyStyle(styles, design)}>&ldquo;{asString(item.quote)}&rdquo;</p>
                <div className="mt-6">
                  <div className="font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.name)}</div>
                  <div className="text-sm" style={getBodyStyle(styles, design)}>{asString(item.role)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : layoutVariant === "stacked" ? (
        <div className="mt-12 space-y-5">
          {items.map((item, index) => (
            <div key={index} style={getSurfaceStyle(styles, design)} className="rounded-[28px] border p-6 backdrop-blur">
              <p className="text-base leading-7" style={getBodyStyle(styles, design)}>&ldquo;{asString(item.quote)}&rdquo;</p>
              <div className="mt-6">
                <div className="font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.name)}</div>
                <div className="text-sm" style={getBodyStyle(styles, design)}>{asString(item.role)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <div key={index} style={getSurfaceStyle(styles, design)} className="rounded-[28px] border p-6 backdrop-blur">
              <p className="text-base leading-7" style={getBodyStyle(styles, design)}>&ldquo;{asString(item.quote)}&rdquo;</p>
              <div className="mt-6">
                <div className="font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.name)}</div>
                <div className="text-sm" style={getBodyStyle(styles, design)}>{asString(item.role)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FaqSection({ data, styles }: { data: Record<string, unknown>; styles: ReturnType<typeof sectionClasses> }) {
  const design = getSectionDesign(data);
  const layoutVariant = asString(data.layout_variant, "accordion");
  const items = asObjectArray(data.items);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className={`mx-auto max-w-5xl px-6 lg:px-8 ${getSectionPaddingClass(design.sectionPadding)}`} style={getSectionShellStyle(design)}>
      <SectionHeading data={data} styles={styles} design={design} />
      <div className={`mt-10 ${layoutVariant === "two-column" ? "grid gap-4 md:grid-cols-2" : "space-y-4"}`}>
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              style={getSurfaceStyle(styles, design)}
              className="block w-full rounded-[24px] border p-6 text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-semibold" style={getHeadingStyle(styles, design)}>{asString(item.question)}</div>
                <div className="text-2xl" style={getBodyStyle(styles, design)}>{open ? "-" : "+"}</div>
              </div>
              {open ? <p className="mt-4 text-sm leading-7" style={getBodyStyle(styles, design)}>{asString(item.answer)}</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ContactSection({
  data,
  brandName,
  styles,
  theme,
}: {
  data: Record<string, unknown>;
  brandName: string;
  styles: ReturnType<typeof sectionClasses>;
  theme: LandingTheme;
}) {
  const design = getSectionDesign(data);
  const layoutVariant = asString(data.layout_variant, "split");
  const links = asObjectArray(data.links);
  return (
    <section id="contact" className="border-t border-white/10" style={getSectionShellStyle(design)}>
      <div className={`mx-auto max-w-7xl px-6 lg:px-8 ${getSectionPaddingClass(design.sectionPadding)}`}>
        <div
          className="rounded-[32px] border border-white/10 p-8"
          style={{
            background: design.backgroundColor || `linear-gradient(135deg, ${theme.surface_tone}, ${theme.secondary_color})`,
            borderColor: design.borderColor || `${theme.accent_color}33`,
          }}
        >
          {layoutVariant === "centered" ? (
            <div className="mx-auto max-w-3xl text-center">
              <SectionHeading data={data} styles={styles} design={{ ...design, contentAlign: "center" }} />
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a href={`mailto:${asString(data.email, "hello@example.com")}`} style={getButtonStyle(styles, design)} className="rounded-full px-6 py-3 font-semibold">
                  {asString(data.primary_cta, "Book Intro Call")}
                </a>
                <a href="#hero" className="rounded-full border border-white/15 px-6 py-3 font-semibold" style={getBodyStyle(styles, design)}>
                  {asString(data.secondary_cta, "See Product Story")}
                </a>
              </div>
              <div className="mt-8 text-lg font-semibold" style={getHeadingStyle(styles, design)}>{asString(data.email, "hello@example.com")}</div>
            </div>
          ) : layoutVariant === "compact" ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <SectionHeading data={data} styles={styles} design={design} />
              </div>
              <div className="flex flex-wrap gap-4">
                <a href={`mailto:${asString(data.email, "hello@example.com")}`} style={getButtonStyle(styles, design)} className="rounded-full px-6 py-3 font-semibold">
                  {asString(data.primary_cta, "Book Intro Call")}
                </a>
                <a href="#hero" className="rounded-full border border-white/15 px-6 py-3 font-semibold" style={getBodyStyle(styles, design)}>
                  {asString(data.secondary_cta, "See Product Story")}
                </a>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <SectionHeading data={data} styles={styles} design={design} />
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href={`mailto:${asString(data.email, "hello@example.com")}`} style={getButtonStyle(styles, design)} className="rounded-full px-6 py-3 font-semibold">
                    {asString(data.primary_cta, "Book Intro Call")}
                  </a>
                  <a href="#hero" className="rounded-full border border-white/15 px-6 py-3 font-semibold" style={getBodyStyle(styles, design)}>
                    {asString(data.secondary_cta, "See Product Story")}
                  </a>
                </div>
              </div>
              <div className="rounded-[28px] border p-6 backdrop-blur" style={getSurfaceStyle(styles, design)}>
                <div className="text-sm uppercase tracking-[0.28em]" style={getEyebrowStyle(styles, design)}>Contact</div>
                <div className="mt-4 text-xl font-semibold" style={getHeadingStyle(styles, design)}>{asString(data.email, "hello@example.com")}</div>
                <div className="mt-8 text-sm uppercase tracking-[0.28em]" style={getEyebrowStyle(styles, design)}>Links</div>
                <div className="mt-4 flex flex-col gap-3">
                  {links.map((item, index) => (
                    <a key={index} href={asString(item.href, "#")} className="hover:text-white" style={getBodyStyle(styles, design)}>
                      {asString(item.label)}
                    </a>
                  ))}
                </div>
                <div className="mt-10 border-t border-white/10 pt-6 text-sm" style={getBodyStyle(styles, design)}>
                  {brandName}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  data,
  styles,
  design,
}: {
  data: Record<string, unknown>;
  styles: ReturnType<typeof sectionClasses>;
  design: SectionDesign;
}) {
  const alignClass = getTextAlignClass(design.contentAlign);
  return (
    <div className={alignClass}>
      <div className="text-xs uppercase tracking-[0.28em]" style={getEyebrowStyle(styles, design)}>
        {asString(data.eyebrow)}
      </div>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl" style={getHeadingStyle(styles, design)}>
        {asString(data.title)}
      </h2>
      <p className={`mt-4 max-w-2xl text-lg leading-8 ${design.contentAlign === "center" ? "mx-auto" : ""}`} style={getBodyStyle(styles, design)}>
        {asString(data.description)}
      </p>
    </div>
  );
}
