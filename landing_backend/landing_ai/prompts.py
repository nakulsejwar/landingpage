DESIGN_SYSTEM_PROMPT = """
You are a premium SaaS art director and brand strategist.

USER REQUEST:
{user_prompt}

GENERATION OPTIONS:
{generation_options}

Return STRICT JSON only:
{{
  "brand_name": "",
  "page_title": "",
  "tagline": "",
  "theme": {{
    "mood": "",
    "visual_style": "",
    "primary_color": "",
    "secondary_color": "",
    "accent_color": "",
    "surface_tone": "",
    "background_tone": "",
    "highlight_tone": "",
    "font_style": "",
    "button_style": "",
    "animation_style": ""
  }}
}}

Rules:
- Output concise theme values suitable for direct frontend rendering.
- Favor premium SaaS quality, clarity, and conversion.
- Do not include code fences or explanation.
"""


LANDING_PAGE_PROMPT = """
You are a conversion-focused landing page strategist.

USER REQUEST:
{user_prompt}

DESIGN SYSTEM:
{design_system}

GENERATION OPTIONS:
{generation_options}

Return STRICT JSON only:
{{
  "header": {{
    "announcement": "",
    "nav_items": ["Features", "About", "Testimonials", "FAQ", "Contact"],
    "cta_label": ""
  }},
  "hero": {{
    "layout_variant": "",
    "eyebrow": "",
    "headline": "",
    "subheadline": "",
    "primary_cta": "",
    "secondary_cta": "",
    "stats": [
      {{"label": "", "value": ""}},
      {{"label": "", "value": ""}},
      {{"label": "", "value": ""}}
    ],
    "image_query": "",
    "image_role": ""
  }},
  "features": {{
    "layout_variant": "",
    "eyebrow": "",
    "title": "",
    "description": "",
    "items": [
      {{"title": "", "description": "", "icon": ""}},
      {{"title": "", "description": "", "icon": ""}},
      {{"title": "", "description": "", "icon": ""}},
      {{"title": "", "description": "", "icon": ""}},
      {{"title": "", "description": "", "icon": ""}},
      {{"title": "", "description": "", "icon": ""}}
    ]
  }},
  "about": {{
    "layout_variant": "",
    "eyebrow": "",
    "title": "",
    "description": "",
    "bullets": ["", "", ""],
    "stats": [
      {{"label": "", "value": ""}},
      {{"label": "", "value": ""}},
      {{"label": "", "value": ""}}
    ],
    "image_query": "",
    "image_role": ""
  }},
  "testimonials": {{
    "layout_variant": "",
    "eyebrow": "",
    "title": "",
    "description": "",
    "items": [
      {{"name": "", "role": "", "quote": ""}},
      {{"name": "", "role": "", "quote": ""}},
      {{"name": "", "role": "", "quote": ""}}
    ],
    "image_query": "",
    "image_role": ""
  }},
  "faq": {{
    "layout_variant": "",
    "eyebrow": "",
    "title": "",
    "description": "",
    "items": [
      {{"question": "", "answer": ""}},
      {{"question": "", "answer": ""}},
      {{"question": "", "answer": ""}},
      {{"question": "", "answer": ""}}
    ]
  }},
  "contact": {{
    "layout_variant": "",
    "eyebrow": "",
    "title": "",
    "description": "",
    "primary_cta": "",
    "secondary_cta": "",
    "email": "",
    "links": [
      {{"label": "", "href": ""}},
      {{"label": "", "href": ""}},
      {{"label": "", "href": ""}}
    ]
  }}
}}

Rules:
- Keep copy realistic, premium, and commercially strong.
- Make every section feel consistent with the design system.
- Use layout_variant to diversify structure instead of repeating one layout.
- Example layout variants:
  hero: "split-right", "centered", "stacked-showcase", "split-left"
  features: "cards-3", "cards-2", "spotlight-first", "alternating"
  about: "split-media", "story-card", "stats-left"
  testimonials: "grid", "spotlight", "stacked"
  faq: "accordion", "two-column"
  contact: "split", "centered", "compact"
- image_query must be concrete, visual, and searchable on stock sites.
- image_query should mention subject, setting, style, and business context.
- Avoid vague image queries like "technology", "innovation", "dashboard", or "teamwork" on their own.
- Prefer editorial phrases such as "founder portrait in modern office", "cybersecurity analyst monitoring enterprise dashboard", "fintech app interface on premium glassmorphism device mockup", "warehouse automation robot in clean industrial facility".
- image_role should explain how the image supports that section and what emotion or trust signal it adds.
- Use concise but rich marketing copy.
- Do not include code fences or explanation.
"""


REGENERATE_SECTION_PROMPT = """
You are a senior landing page copywriter and creative director.

USER REQUEST:
{user_prompt}

SECTION:
{section}

DESIGN SYSTEM:
{design_system}

CURRENT SECTION DATA:
{existing_data}

Return STRICT JSON only for this section's data object.

Rules:
- Keep the section aligned with the design system.
- Improve clarity, conversion, and visual storytelling.
- Preserve the same object shape as the current section.
- If the section supports layout_variant, you may change it to improve structure and variety.
- If the section has image_query or image_role fields, improve them with more specific visual direction.
- Do not include code fences or explanation.
"""
