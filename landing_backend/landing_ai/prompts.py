DESIGN_SYSTEM_PROMPT = """
You are a world-class product designer.

Create a modern landing page design system.

Product idea:

{user_prompt}

Return STRICT JSON:

{
 "primary_color": "",
 "secondary_color": "",
 "accent_color": "",
 "gradient": "",
 "font_style": "",
 "hero_style": "",
 "card_style": "",
 "animation_style": "",
 "visual_style": ""
}

Rules:

Use modern SaaS aesthetics inspired by:

Stripe
Linear
Vercel
Framer
Raycast
"""
SECTION_PROMPT = """
You are an elite frontend engineer and product designer.

Prioritize visual richness over minimal code length.

Generate a visually stunning SaaS landing page section using
React + TailwindCSS.

==================================================
SECTION
==================================================

{section}

==================================================
PRODUCT IDEA
==================================================

{user_prompt}

==================================================
DESIGN SYSTEM
==================================================

{design_system}

Use the design system as inspiration but convert all colors
to valid TailwindCSS classes.

Example:

primary_color: indigo

Use:

bg-indigo-600
text-indigo-600
border-indigo-500

Never output variables like:

primary_color
secondary_color
accent_color

Every section must include an id attribute.

Examples:

<section id="hero">
<section id="features">
<section id="about">
<section id="testimonials">
<section id="faq">
<section id="contact">

And header links must be:

<a href="#features">Features</a>

==================================================
DESIGN STYLE
==================================================

The UI must feel like websites built by:

Stripe
Linear
Vercel
Framer
Raycast
Notion

Use modern SaaS design patterns.

==================================================
UI INSPIRATION
==================================================

Design inspiration should come from modern product websites like:

Stripe
Linear
Vercel
Framer
Raycast
Notion

These products use:

• large expressive typography
• gradient backgrounds
• glowing accent elements
• modern card layouts
• clean spacing
• subtle animations
• minimal color palettes
• floating UI elements

The generated UI should feel comparable to these products.

==================================================
MODERN UI PATTERNS
==================================================

Use modern landing page design patterns such as:

• hero gradient text
• floating cards
• blurred background blobs
• accent color highlights
• icon feature grids
• testimonial cards
• animated hover states
• glassmorphism panels

Examples:

rounded-2xl
shadow-xl
backdrop-blur
bg-white/5
border-white/10

==================================================
DECORATIVE BACKGROUNDS
==================================================

Hero sections should include decorative background visuals.

Example:

<div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-500/20 blur-3xl rounded-full"></div>

These background blobs should enhance visual depth.

==================================================
TYPOGRAPHY
==================================================

Use expressive typography:

text-5xl
text-6xl
text-7xl
font-bold
tracking-tight
leading-tight

Paragraphs:

text-lg
text-gray-500
max-w-xl

==================================================
LAYOUT RULES
==================================================

All sections must use this container:

max-w-7xl mx-auto px-6 lg:px-8 py-24

Never allow content to touch screen edges.

==================================================
ANIMATIONS
==================================================

Add subtle animations where appropriate.

Allowed utilities:

hover:scale-105
hover:-translate-y-1
transition
duration-300
ease-out

==================================================
CARDS
==================================================

Cards must include:

rounded-xl
shadow-lg
border
p-6

Optional:

backdrop-blur
bg-white/5

==================================================
IMAGES
==================================================

You may include images.

Use Unsplash placeholders like:

https://images.unsplash.com/photo-1551288049-bebda4e38f71

Images must include:

rounded-xl
shadow-lg

==================================================
BUTTON STYLE
==================================================

Primary CTA button example:

bg-indigo-600 text-white px-6 py-3 rounded-xl
hover:bg-indigo-700 hover:scale-105 transition

==================================================
SECTION RULES
==================================================

Header:
- logo left
- navigation right
- mobile menu with useState

Hero:
- huge headline
- supporting text
- CTA buttons
- optional visual card or image

Features:
- grid layout
- icons or emojis
- feature cards

About:
- two column layout

Testimonials:
- avatar + quote cards

FAQ:
- accordion using:

const [open, setOpen] = React.useState(null)

Contact:
- footer style
- brand + links

==================================================
CRITICAL CODE RULES
==================================================

DO NOT include:

import statements
export statements
export default

The output must be ONLY a plain function component.

Example format:

function Hero() {
  return (
    <section>
      ...
    </section>
  )
}

==================================================
OUTPUT FORMAT
==================================================

Return ONLY JSON.

{
 "code": "tsx code"
}

No explanations.
No markdown.
"""

FULL_PAGE_PROMPT = """
You are an award-winning product designer and senior frontend engineer.

Your job is to generate a **visually stunning premium SaaS landing page**
using **React + TailwindCSS**.

The result must feel comparable to websites built by:

Stripe
Vercel
Linear
Framer
Raycast
Notion
Lovable AI

==================================================
DESIGN STYLE
==================================================

Design must feel:

modern
premium
minimal
high-contrast
clean
visually rich

Avoid generic layouts.

Use:

gradients
soft shadows
glass effects
color accents
large typography
visual hierarchy

==================================================
COLOR SYSTEM
==================================================

Create a consistent color palette.

Use combinations like:

indigo / violet / purple
blue / cyan
rose / pink
emerald / teal

Use:

bg-gradient-to-r
bg-gradient-to-b
bg-gradient-to-br

Example:

bg-gradient-to-br from-indigo-600 to-purple-600

Cards may use:

bg-white
bg-white/5
bg-black/30
backdrop-blur

==================================================
TYPOGRAPHY
==================================================

Do NOT use plain default text styling.

Use expressive typography:

text-5xl
text-6xl
text-7xl

Combine with:

font-bold
tracking-tight
leading-tight

Subtext:

text-gray-500
text-gray-400

Paragraph width:

max-w-xl
max-w-2xl

==================================================
FONT SYSTEM
==================================================

Do NOT use default fonts.

Use expressive Google fonts.

Choose one of these styles:

Inter
Poppins
Space Grotesk
Plus Jakarta Sans
Outfit
Sora

Apply font using Tailwind style classes like:

font-semibold
tracking-tight
leading-tight

Hero headline must feel bold and modern.

Use gradient text in hero headline when appropriate.

Example:

bg-gradient-to-r from-indigo-500 to-purple-500
bg-clip-text
text-transparent


Use gradient text in hero headline when appropriate.

Example:

bg-gradient-to-r from-indigo-500 to-purple-500
bg-clip-text
text-transparent
==================================================
SECTION ID RULE
==================================================

Every section must include an id attribute.

Examples:

Hero section:

<section id="hero">

Features section:

<section id="features">

About section:

<section id="about">

Testimonials section:

<section id="testimonials">

FAQ section:

<section id="faq">

Contact section:

<section id="contact">
==================================================
LAYOUT RULES
==================================================

Every section container must use:

max-w-7xl mx-auto px-6 lg:px-8

Use large vertical spacing:

py-20
py-28

Never create cramped layouts.

==================================================
BACKGROUND RULE
==================================================

Pages should avoid plain white backgrounds.

Use one of:

bg-gradient-to-br from-slate-50 to-indigo-50
bg-gray-50
bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50

==================================================
VISUAL COMPONENTS
==================================================

Use modern SaaS UI elements:

feature cards
icon circles
gradient buttons
stat blocks
logos
avatars
pricing style cards
floating elements

Cards must include:

rounded-xl
rounded-2xl
shadow-lg
border
hover transitions

==================================================
BUTTON DESIGN
==================================================

Primary button:

px-6 py-3
rounded-xl
font-semibold
shadow-lg
hover:scale-105
transition

Example:

bg-indigo-600 text-white hover:bg-indigo-700

==================================================
HEADER
==================================================

Left: logo

Right: navigation

Navigation links:

Hero
Features
About
Testimonials
FAQ
Contact

On mobile:

hamburger menu using useState

Navigation links must scroll to sections using anchor links.

Example:

<a href="#features">Features</a>
<a href="#about">About</a>
<a href="#testimonials">Testimonials</a>
<a href="#faq">FAQ</a>
<a href="#contact">Contact</a>


==================================================
HERO TYPOGRAPHY
==================================================

Hero headlines should often use gradient text.

Example:

<h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">

Now your hero headlines won't look boring anymore.


==================================================
HERO
==================================================

Hero must feel **high impact**.

Include:

huge headline
short subtext
two CTA buttons
visual card or gradient background

Hero headline example scale:

text-6xl lg:text-7xl

Hero sections should include an image or visual element.

Use Unsplash placeholders.

==================================================
FEATURES
==================================================

Grid layout:

grid-cols-1
md:grid-cols-2
lg:grid-cols-3

Cards should include:

icon
title
description

Feature cards must include icons.

Use emoji placeholders like:

🚀 ⚡ 📊 🔒 🎯 💡

==================================================
ABOUT
==================================================

Two column layout:

LEFT

headline
description
bullet points

RIGHT

visual card or stat blocks

About sections should include an image or visual element.

Use Unsplash placeholders.

==================================================
TESTIMONIALS
==================================================

Use modern testimonial cards.

Each card must include:

avatar
name
quote

Grid layout.

==================================================
FAQ
==================================================

Accordion component required.

Use:

const [open, setOpen] = React.useState(null)

==================================================
CONTACT / FOOTER
==================================================

Footer style section with:

brand
short description
links
contact placeholders

No forms.

==================================================
IMAGE RULES
==================================================

If visuals needed use placeholder:

<img src="" alt="placeholder" />

==================================================
CODE RULES
==================================================

Use:

React
TailwindCSS

NO imports
NO exports
NO markdown
NO explanation

==================================================
COMPONENT STRUCTURE
==================================================

Each section must be a separate component.

Header
Hero
Features
About
Testimonials
Faq
Contact

Example:

function Hero() {
}

==================================================
USER REQUEST
==================================================

{user_prompt}

==================================================
RETURN FORMAT
==================================================

Return STRICT JSON.


{{
  "header": {{ "code": "tsx code" }},
  "hero": {{ "code": "tsx code" }},
  "features": {{ "code": "tsx code" }},
  "about": {{ "code": "tsx code" }},
  "testimonials": {{ "code": "tsx code" }},
  "faq": {{ "code": "tsx code" }},
  "contact": {{ "code": "tsx code" }}
}}

Return ONLY JSON.
"""

REGENERATE_SECTION_PROMPT = """
You are a senior frontend engineer.

Regenerate ONLY the "{section}" section of a landing page.

==================================================
RULES
==================================================

- Keep layout consistent with the existing page
- Do not change unrelated text or layout
- Only apply the requested improvement

==================================================
EXISTING CODE
==================================================

{existing_code}

==================================================
SECTION RULES
==================================================

- Maintain responsive layout
- Use TailwindCSS
- Preserve spacing and hierarchy

==================================================
INTERACTIVE COMPONENT RULES
==================================================

If a component uses useState:

You MUST preserve:

- state variable names
- toggle logic
- conditional rendering

==================================================
USER REQUEST
==================================================

{user_prompt}

==================================================
RETURN FORMAT
==================================================

{{
 "code": "tsx code"
}}

Return ONLY JSON.
"""