export type LandingTheme = {
  mood: string;
  visual_style: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  surface_tone: string;
  background_tone: string;
  highlight_tone: string;
  font_style: string;
  button_style: string;
  animation_style: string;
};

export type LandingMedia = {
  url: string;
  alt?: string;
  provider?: string;
  thumbnail?: string;
  photographer?: string;
  photographer_url?: string;
  license?: string;
  source_page?: string;
};

export type LandingSectionRecord = {
  name: string;
  kind: "structured";
  data: Record<string, unknown>;
  assets: Record<string, unknown>;
  strategy: Record<string, unknown>;
};

export type LandingSectionOption = {
  name: string;
  label: string;
};

export type LandingPageResponse = {
  page_id: string;
  title: string;
  prompt: string;
  theme: LandingTheme;
  brand_name: string;
  tagline: string;
  custom_domain?: string;
  domain_status?: string;
  section_order: string[];
  sections: LandingSectionRecord[];
  available_sections?: LandingSectionOption[];
};

export const defaultTheme: LandingTheme = {
  mood: "premium",
  visual_style: "cinematic saas",
  primary_color: "#0f172a",
  secondary_color: "#1e293b",
  accent_color: "#22d3ee",
  surface_tone: "#111827",
  background_tone: "#020617",
  highlight_tone: "#a855f7",
  font_style: "modern",
  button_style: "rounded",
  animation_style: "smooth",
};

export function sectionsToMap(sections: LandingSectionRecord[]) {
  return Object.fromEntries(sections.map((section) => [section.name, section]));
}

export function toPrettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function sectionLabel(name: string) {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
