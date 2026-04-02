import base64
import html
import os
import random

import requests


def generate_svg_data_uri(prompt: str, variant: str = "hero") -> str:
    seed = abs(hash(f"{prompt}-{variant}")) % 9973
    random.seed(seed)

    gradients = [
        ("#0f172a", "#2563eb", "#22d3ee"),
        ("#111827", "#7c3aed", "#ec4899"),
        ("#020617", "#06b6d4", "#10b981"),
        ("#1e1b4b", "#3b82f6", "#f97316"),
    ]
    bg, c1, c2 = random.choice(gradients)
    label = html.escape((prompt or "Generated visual")[:54])

    circles = []
    for _ in range(6):
        cx = random.randint(80, 1120)
        cy = random.randint(60, 560)
        radius = random.randint(60, 180)
        opacity = random.choice(["0.12", "0.18", "0.22", "0.28"])
        fill = random.choice([c1, c2, "#ffffff"])
        circles.append(
            f"<circle cx='{cx}' cy='{cy}' r='{radius}' fill='{fill}' opacity='{opacity}' />"
        )

    polygons = []
    for _ in range(3):
        x = random.randint(150, 900)
        y = random.randint(80, 420)
        polygons.append(
            "<polygon points='{0},{1} {2},{3} {4},{5}' fill='{6}' opacity='0.18' />".format(
                x,
                y,
                x + random.randint(80, 220),
                y + random.randint(20, 110),
                x - random.randint(40, 120),
                y + random.randint(120, 220),
                random.choice([c1, c2, "#38bdf8"]),
            )
        )

    svg = f"""
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="panel" x1="70" y1="40" x2="1080" y2="590" gradientUnits="userSpaceOnUse">
          <stop stop-color="{bg}" />
          <stop offset="0.55" stop-color="{c1}" />
          <stop offset="1" stop-color="{c2}" />
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
          gradientTransform="translate(910 170) rotate(120) scale(420 420)">
          <stop stop-color="white" stop-opacity="0.8"/>
          <stop offset="1" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" rx="36" fill="url(#panel)" />
      <rect x="66" y="58" width="1068" height="514" rx="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" />
      <rect x="116" y="124" width="430" height="286" rx="26" fill="rgba(15,23,42,0.45)" stroke="rgba(255,255,255,0.14)" />
      <rect x="598" y="114" width="240" height="148" rx="28" fill="rgba(255,255,255,0.12)" />
      <rect x="684" y="300" width="292" height="162" rx="30" fill="rgba(15,23,42,0.32)" stroke="rgba(255,255,255,0.18)" />
      <circle cx="980" cy="172" r="210" fill="url(#glow)" />
      {''.join(circles)}
      {''.join(polygons)}
      <text x="120" y="470" fill="white" opacity="0.75" font-size="20" font-family="Arial, Helvetica, sans-serif" letter-spacing="4">GENERATED VISUAL</text>
      <text x="120" y="510" fill="white" font-size="44" font-weight="700" font-family="Arial, Helvetica, sans-serif">{label}</text>
    </svg>
    """.strip()

    encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return f"data:image/svg+xml;base64,{encoded}"


def search_pexels_images(query: str, per_page: int = 6):
    api_key = os.getenv("PEXELS_API_KEY")
    if not api_key or not query:
        return []

    response = requests.get(
        "https://api.pexels.com/v1/search",
        headers={"Authorization": api_key},
        params={
            "query": query,
            "per_page": per_page,
            "orientation": "landscape",
        },
        timeout=15,
    )
    response.raise_for_status()

    photos = response.json().get("photos", [])
    results = []
    for item in photos:
        src = item.get("src", {})
        image_url = src.get("large") or src.get("large2x") or src.get("original")
        if not image_url:
            continue
        results.append(
            {
                "provider": "pexels",
                "url": image_url,
                "thumbnail": src.get("medium") or image_url,
                "alt": item.get("alt") or query,
                "photographer": item.get("photographer"),
                "photographer_url": item.get("photographer_url"),
                "source_page": item.get("url"),
                "license": "Pexels License",
            }
        )
    return results


def build_asset_manifest(section_name: str, image_query: str, image_mode: str):
    image_mode = (image_mode or "mixed").lower()
    generated_assets = []
    stock_assets = []

    if image_mode in {"generated", "mixed"}:
        generated_assets.append(
            {
                "type": "generated_svg",
                "url": generate_svg_data_uri(image_query or section_name, variant=section_name),
                "alt": f"{section_name} generated visual",
            }
        )

    if image_mode in {"stock", "mixed"}:
        try:
            stock_assets = search_pexels_images(image_query or section_name)
        except requests.RequestException:
            stock_assets = []

    return {
        "section": section_name,
        "image_query": image_query,
        "generated": generated_assets,
        "stock": stock_assets,
    }


def build_stock_search_hint(query: str) -> str:
    return (
        "Add your PEXELS_API_KEY to enable royalty-free stock image search for: "
        f"{query}"
    )
