import os
import uuid

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.db import transaction
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .asset_services import (
    build_asset_manifest,
    build_stock_search_hint,
    generate_svg_data_uri,
    search_pexels_images,
)
from .authentication import create_access_token
from .gemini_client import get_llm
from .models import LandingPage, LandingSection
from .prompts import DESIGN_SYSTEM_PROMPT, LANDING_PAGE_PROMPT, REGENERATE_SECTION_PROMPT
from .utils import safe_json_load


DEFAULT_SECTION_ORDER = [
    "header",
    "hero",
    "features",
    "about",
    "testimonials",
    "faq",
    "contact",
]

META_SECTION_NAME = "__meta__"


DEFAULT_THEME = {
    "mood": "premium",
    "visual_style": "cinematic saas",
    "primary_color": "#0f172a",
    "secondary_color": "#1e293b",
    "accent_color": "#22d3ee",
    "surface_tone": "#111827",
    "background_tone": "#020617",
    "highlight_tone": "#a855f7",
    "font_style": "modern",
    "button_style": "rounded",
    "animation_style": "smooth",
}


SECTION_LABELS = {
    "header": "Header",
    "hero": "Hero",
    "features": "Features",
    "about": "About",
    "testimonials": "Testimonials",
    "faq": "FAQ",
    "contact": "Contact",
}


def build_generation_options(request_data):
    return {
        "visual_intensity": request_data.get("visual_intensity", "cinematic"),
        "animation_level": request_data.get("animation_level", "high"),
        "depth_mode": request_data.get("depth_mode", "3d"),
        "image_mode": request_data.get("image_mode", "mixed"),
    }


def clean_string(value):
    return value.strip() if isinstance(value, str) else ""


def truncate_words(value, limit):
    words = clean_string(value).split()
    return " ".join(words[:limit])


def infer_image_query(section_name, section_data):
    provided_query = clean_string(section_data.get("image_query"))
    if len(provided_query) >= 12:
        return provided_query

    role = clean_string(section_data.get("image_role"))
    title = clean_string(section_data.get("title") or section_data.get("headline"))
    description = clean_string(section_data.get("description") or section_data.get("subheadline"))
    item_titles = []
    for item in section_data.get("items", []):
        if isinstance(item, dict):
            item_title = clean_string(item.get("title") or item.get("label") or item.get("name"))
            if item_title:
                item_titles.append(item_title)

    query_parts = [
        SECTION_LABELS.get(section_name, section_name.title()),
        title,
        truncate_words(description, 10),
        ", ".join(item_titles[:3]),
        role,
        "high quality website editorial scene",
    ]
    return ", ".join([part for part in query_parts if part])


def section_template(section_name):
    base_templates = {
        "header": {
            "announcement": "Built for teams that need a sharper web presence.",
            "nav_items": ["Features", "About", "Testimonials", "FAQ", "Contact"],
            "cta_label": "Book Demo",
        },
        "hero": {
            "layout_variant": "split-right",
            "eyebrow": "Premium digital experience",
            "headline": "Landing pages that feel expensive before the sales call.",
            "subheadline": "Launch a modern product story with stronger visuals, cleaner messaging, and a conversion-focused layout.",
            "primary_cta": "Start Project",
            "secondary_cta": "See Capabilities",
            "stats": [
                {"label": "Launch speed", "value": "72 hrs"},
                {"label": "Conversion uplift", "value": "31%"},
                {"label": "Teams supported", "value": "120+"},
            ],
            "image_query": "premium SaaS product dashboard in futuristic studio lighting",
            "image_role": "A cinematic product showcase that makes the hero feel premium and modern.",
        },
        "features": {
            "layout_variant": "cards-3",
            "eyebrow": "What you get",
            "title": "Everything needed to tell a sharper product story.",
            "description": "Focused blocks that explain the offer, surface proof, and move visitors toward action.",
            "items": [
                {"title": "Hero storytelling", "description": "A clearer opening message with stronger product framing.", "icon": "Spark"},
                {"title": "Feature grid", "description": "Scannable value communication with benefit-led copy.", "icon": "Grid"},
                {"title": "Proof sections", "description": "Testimonials and stats placed where trust matters most.", "icon": "Shield"},
            ],
        },
        "about": {
            "layout_variant": "split-media",
            "eyebrow": "Why it works",
            "title": "Built to balance brand feel with sales clarity.",
            "description": "The page structure gives prospects enough detail to trust the offer without slowing them down.",
            "bullets": [
                "Message hierarchy that makes the value obvious fast.",
                "Visual rhythm that keeps each section distinct.",
                "Calls to action placed around intent, not guesswork.",
            ],
            "stats": [
                {"label": "Avg. session depth", "value": "4.8x"},
                {"label": "Scroll completion", "value": "67%"},
                {"label": "Bounce reduction", "value": "24%"},
            ],
            "image_query": "creative team collaborating around premium digital product visuals",
            "image_role": "A human, trustworthy image that supports the story behind the product or company.",
        },
        "testimonials": {
            "layout_variant": "grid",
            "eyebrow": "Social proof",
            "title": "The kind of trust-building detail buyers actually read.",
            "description": "Short, specific quotes that reduce hesitation and reinforce the value proposition.",
            "items": [
                {"name": "Avery Chen", "role": "Growth Lead", "quote": "The new page finally matched the quality of our product demo."},
                {"name": "Maya Singh", "role": "Founder", "quote": "We stopped sounding generic and started converting warmer traffic."},
                {"name": "Jordan Hale", "role": "Marketing Director", "quote": "It felt like a proper premium SaaS launch, not another template."},
            ],
            "image_query": "professional founder portrait in modern office editorial style",
            "image_role": "An editorial portrait or customer-facing visual that adds human credibility.",
        },
        "faq": {
            "layout_variant": "accordion",
            "eyebrow": "Questions",
            "title": "Answers that remove the usual hesitation.",
            "description": "Clear responses around fit, process, and next steps.",
            "items": [
                {"question": "How fast can we launch?", "answer": "Most teams can get a polished first version quickly, then refine from live feedback."},
                {"question": "Can we customize everything later?", "answer": "Yes. Sections, copy, visuals, colors, and call-to-action paths can all evolve."},
                {"question": "Does it work for complex offers?", "answer": "Yes. The structure supports both simple offers and multi-layered SaaS positioning."},
            ],
        },
        "contact": {
            "layout_variant": "split",
            "eyebrow": "Next step",
            "title": "Turn interest into a conversation.",
            "description": "Give visitors a crisp path to book, message, or continue exploring.",
            "primary_cta": "Book Intro Call",
            "secondary_cta": "View Product Story",
            "email": "hello@example.com",
            "links": [
                {"label": "LinkedIn", "href": "#"},
                {"label": "X / Twitter", "href": "#"},
                {"label": "Email", "href": "mailto:hello@example.com"},
            ],
        },
    }
    return base_templates.get(section_name, {}).copy()


def merge_with_template(section_name, section_data):
    template = section_template(section_name)
    for key, value in section_data.items():
        template[key] = value
    return template


def build_strategy(section_name, section_data):
    return {
        "section": section_name,
        "image_query": infer_image_query(section_name, section_data),
        "image_role": clean_string(section_data.get("image_role")),
        "title": section_data.get("title") or section_data.get("headline") or "",
    }


def get_page_meta(page):
    meta_section = page.sections.filter(section_name=META_SECTION_NAME).first()
    payload = meta_section.content_json if meta_section and isinstance(meta_section.content_json, dict) else {}
    return {
        "theme": payload.get("theme", DEFAULT_THEME),
        "brand_name": payload.get("brand_name", page.title),
        "tagline": payload.get("tagline", ""),
        "custom_domain": payload.get("custom_domain", ""),
        "domain_status": payload.get("domain_status", "not_connected"),
    }


def select_primary_asset(assets):
    for bucket in ("stock", "generated"):
        items = assets.get(bucket, [])
        if isinstance(items, list) and items:
            item = items[0]
            return {
                "url": item.get("url", ""),
                "alt": item.get("alt", ""),
                "provider": item.get("provider", bucket),
                "thumbnail": item.get("thumbnail", item.get("url", "")),
                "photographer": item.get("photographer", ""),
                "photographer_url": item.get("photographer_url", ""),
                "license": item.get("license", ""),
                "source_page": item.get("source_page", ""),
            }
    return {}


def section_supports_media(section_name):
    return section_name in {"hero", "about", "testimonials"}


def get_media_choices(assets):
    choices = []
    for bucket in ("stock", "generated"):
        items = assets.get(bucket, [])
        if not isinstance(items, list):
            continue
        for item in items:
            if isinstance(item, dict) and item.get("url"):
                choices.append(
                    {
                        "url": item.get("url", ""),
                        "alt": item.get("alt", ""),
                        "provider": item.get("provider", bucket),
                        "thumbnail": item.get("thumbnail", item.get("url", "")),
                        "photographer": item.get("photographer", ""),
                        "photographer_url": item.get("photographer_url", ""),
                        "license": item.get("license", ""),
                        "source_page": item.get("source_page", ""),
                    }
                )
    return choices


def build_section_payload(section_name, section_data, image_mode):
    section_data = merge_with_template(
        section_name,
        section_data if isinstance(section_data, dict) else {},
    )
    strategy = build_strategy(section_name, section_data)
    assets = build_asset_manifest(
        section_name=section_name,
        image_query=strategy["image_query"] or section_name,
        image_mode=image_mode,
    )
    media = select_primary_asset(assets)

    normalized_data = {
        key: value
        for key, value in section_data.items()
        if key not in {"image_query", "image_role"}
    }

    if section_supports_media(section_name) and media:
        normalized_data["media"] = media
        normalized_data["media_choices"] = get_media_choices(assets)

    return {
        "kind": "structured",
        "data": normalized_data,
        "assets": assets,
        "strategy": strategy,
    }


def normalize_section(section_name, payload):
    payload = payload if isinstance(payload, dict) else {}
    data = payload.get("data", {}) or {}
    strategy = payload.get("strategy", {}) or {}

    if not data:
        fallback_title = strategy.get("title") or section_name.replace("_", " ").title()
        data = {
            "eyebrow": section_name.title(),
            "title": fallback_title,
            "headline": fallback_title,
            "description": "Legacy section content was generated with an older format. Regenerate this section to upgrade it.",
            "subheadline": "Legacy section content was generated with an older format. Regenerate this section to upgrade it.",
            "items": [],
            "stats": [],
            "bullets": [],
            "links": [],
        }

    data = merge_with_template(section_name, data)
    if section_supports_media(section_name):
        data["media_choices"] = data.get("media_choices", []) if isinstance(data.get("media_choices"), list) else []

    return {
        "name": section_name,
        "kind": payload.get("kind", "structured"),
        "data": data,
        "assets": payload.get("assets", {}) or {},
        "strategy": strategy,
    }


def serialize_page(page):
    meta = get_page_meta(page)
    section_map = {
        section.section_name: normalize_section(section.section_name, section.content_json)
        for section in page.sections.all()
        if section.section_name != META_SECTION_NAME
    }
    ordered_names = page.section_order or list(section_map.keys())
    ordered_sections = [section_map[name] for name in ordered_names if name in section_map]
    remaining_sections = [
        section
        for name, section in section_map.items()
        if name not in ordered_names
    ]

    return {
        "page_id": str(page.id),
        "title": page.title,
        "prompt": page.prompt,
        "theme": meta["theme"],
        "brand_name": meta["brand_name"],
        "tagline": meta["tagline"],
        "custom_domain": meta["custom_domain"],
        "domain_status": meta["domain_status"],
        "section_order": [section["name"] for section in ordered_sections + remaining_sections],
        "sections": ordered_sections + remaining_sections,
        "available_sections": [
            {"name": section_name, "label": SECTION_LABELS.get(section_name, section_name.title())}
            for section_name in DEFAULT_SECTION_ORDER
        ],
    }


class GenerateLanding(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_prompt = request.data.get("prompt")
            if not user_prompt:
                return Response({"error": "Prompt required"}, status=400)

            llm = get_llm()
            generation_options = build_generation_options(request.data)

            design_prompt = DESIGN_SYSTEM_PROMPT.format(
                user_prompt=user_prompt,
                generation_options=generation_options,
            )
            design_system = safe_json_load(llm.generate_content(design_prompt).text)

            landing_prompt = LANDING_PAGE_PROMPT.format(
                user_prompt=user_prompt,
                design_system=design_system,
                generation_options=generation_options,
            )
            page_content = safe_json_load(llm.generate_content(landing_prompt).text)

            page = LandingPage.objects.create(
                user=request.user,
                title=design_system.get("page_title") or design_system.get("brand_name") or "AI Generated Page",
                prompt=user_prompt,
                section_order=DEFAULT_SECTION_ORDER,
            )

            LandingSection.objects.create(
                page=page,
                section_name=META_SECTION_NAME,
                content_json={
                    "theme": design_system.get("theme", DEFAULT_THEME),
                    "brand_name": design_system.get("brand_name", page.title),
                    "tagline": design_system.get("tagline", ""),
                    "custom_domain": "",
                    "domain_status": "not_connected",
                },
            )

            for section_name in DEFAULT_SECTION_ORDER:
                content_json = build_section_payload(
                    section_name=section_name,
                    section_data=page_content.get(section_name, {}),
                    image_mode=generation_options["image_mode"],
                )
                LandingSection.objects.create(
                    page=page,
                    section_name=section_name,
                    content_json=content_json,
                )

            return Response(serialize_page(page))
        except Exception as exc:
            return Response({"error": str(exc)}, status=500)


class RegenerateSection(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, page_id, section):
        page = LandingPage.objects.get(id=page_id, user=request.user)
        obj = LandingSection.objects.filter(page=page, section_name=section).first()
        existing_payload = obj.content_json if obj and isinstance(obj.content_json, dict) else {}
        existing_data = existing_payload.get("data", {})
        user_prompt = request.data.get("prompt", "Improve this section")

        prompt = REGENERATE_SECTION_PROMPT.format(
            section=section,
            user_prompt=user_prompt,
            design_system=get_page_meta(page),
            existing_data=existing_data,
        )

        llm = get_llm()
        data = safe_json_load(llm.generate_content(prompt).text)

        content_json = build_section_payload(
            section_name=section,
            section_data=data,
            image_mode=request.data.get("image_mode", "mixed"),
        )

        section_obj, _ = LandingSection.objects.update_or_create(
            page=page,
            section_name=section,
            defaults={"content_json": content_json},
        )

        return Response(
            {
                "message": "section regenerated",
                "section": normalize_section(section, section_obj.content_json),
            }
        )


class PreviewRegenerate(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return Response({"preview": request.data})


class GetLanding(APIView):
    permission_classes = [AllowAny]

    def get(self, request, page_id):
        page = LandingPage.objects.get(id=page_id)
        return Response(serialize_page(page))


class EditLanding(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, page_id):
        page = LandingPage.objects.get(id=page_id, user=request.user)
        return Response(serialize_page(page))


class UpdateLanding(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, page_id):
        page = LandingPage.objects.get(id=page_id, user=request.user)
        sections = request.data.get("sections", {})
        section_order = request.data.get("section_order", [])
        theme = request.data.get("theme")
        brand_name = request.data.get("brand_name")
        tagline = request.data.get("tagline")
        has_custom_domain = "custom_domain" in request.data
        custom_domain = clean_string(request.data.get("custom_domain"))
        domain_status = clean_string(request.data.get("domain_status")) or "not_connected"

        with transaction.atomic():
            for section_name, content in sections.items():
                if section_name == META_SECTION_NAME:
                    continue
                LandingSection.objects.update_or_create(
                    page=page,
                    section_name=section_name,
                    defaults={"content_json": build_section_payload(
                        section_name=section_name,
                        section_data=(content or {}).get("data", {}),
                        image_mode=request.data.get("image_mode", "mixed"),
                    )},
                )

            if isinstance(theme, dict) or brand_name or tagline is not None or has_custom_domain:
                meta = get_page_meta(page)
                LandingSection.objects.update_or_create(
                    page=page,
                    section_name=META_SECTION_NAME,
                    defaults={
                        "content_json": {
                            "theme": theme if isinstance(theme, dict) else meta["theme"],
                            "brand_name": brand_name or meta["brand_name"],
                            "tagline": tagline if tagline is not None else meta["tagline"],
                            "custom_domain": custom_domain if has_custom_domain else meta["custom_domain"],
                            "domain_status": domain_status if custom_domain else "not_connected",
                        }
                    },
                )

            page.section_order = [name for name in section_order if name != META_SECTION_NAME]
            page.save(update_fields=["section_order"])

        return Response({"status": "saved"})


class DeleteSection(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, page_id):
        sections = request.data.get("sections", [])
        page = LandingPage.objects.get(id=page_id, user=request.user)
        LandingSection.objects.filter(page=page, section_name__in=sections).delete()
        return Response({"deleted": sections})


class DeletePage(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, page_id):
        LandingPage.objects.filter(id=page_id, user=request.user).delete()
        return Response({"deleted": True})


class UserPages(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pages = LandingPage.objects.filter(user=request.user).order_by("-created_at")
        return Response(
            [
                {
                    "id": str(p.id),
                    "title": p.title,
                    "created_at": p.created_at,
                    "custom_domain": get_page_meta(p)["custom_domain"],
                    "domain_status": get_page_meta(p)["domain_status"],
                }
                for p in pages
            ]
        )


class RegisterUser(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "username and password required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "username already exists"}, status=400)

        User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
        )
        return Response({"message": "account created"})


class LoginUser(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "username and password required"}, status=400)

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({"error": "invalid username or password"}, status=401)

        return Response(
            {
                "access": create_access_token(user),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            }
        )


class GenerateImage(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        prompt = request.data.get("prompt", "").strip()
        variant = request.data.get("variant", "hero")
        if not prompt:
            return Response({"error": "Prompt required"}, status=400)

        return Response(
            {
                "url": generate_svg_data_uri(prompt, variant=variant),
                "provider": "inline-svg",
            }
        )


class StockImageSearch(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("query", "").strip()
        if not query:
            return Response({"error": "query required"}, status=400)

        try:
            results = search_pexels_images(query=query, per_page=8)
        except Exception as exc:
            return Response(
                {
                    "results": [],
                    "warning": str(exc),
                    "hint": build_stock_search_hint(query),
                },
                status=200,
            )

        return Response(
            {
                "results": results,
                "provider": "pexels",
                "license_note": "Pexels content is governed by the Pexels License.",
                "hint": build_stock_search_hint(query) if not results else "",
            }
        )


class LandingImageUpload(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get("image")
        if not image:
            return Response({"error": "image required"}, status=400)

        ext = os.path.splitext(image.name)[1] or ".png"
        filename = f"landing-assets/{uuid.uuid4()}{ext}"
        saved_path = default_storage.save(filename, image)
        url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
        return Response({"url": url})
