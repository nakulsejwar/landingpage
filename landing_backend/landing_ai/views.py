from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from .gemini_client import get_llm
from .prompts import *
from .utils import safe_json_load, strip_return_component
from .models import LandingPage, LandingSection


# ===============================
# Generate Landing Page
# ===============================

class GenerateLanding(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user_prompt = request.data.get("prompt")

        if not user_prompt:
            return Response({"error": "Prompt required"}, status=400)

        llm = get_llm()

        # STEP 1 — Generate design system
        design_prompt = DESIGN_SYSTEM_PROMPT.replace("{user_prompt}", user_prompt)

        design_res = llm.generate_content(design_prompt)

        design_system = safe_json_load(design_res.text)

        # Sections we want
        sections = [
            "header",
            "hero",
            "features",
            "about",
            "testimonials",
            "faq",
            "contact"
        ]

        page = LandingPage.objects.create(
            user=request.user,
            title="AI Generated Page",
            prompt=user_prompt
        )

        order = []

        # STEP 2 — Generate each section separately
        for section in sections:

            section_prompt = SECTION_PROMPT \
                .replace("{section}", section) \
                .replace("{user_prompt}", user_prompt) \
                .replace("{design_system}", str(design_system))

            res = llm.generate_content(section_prompt)

            data = safe_json_load(res.text)

            code = strip_return_component(data["code"])

            LandingSection.objects.create(
                page=page,
                section_name=section,
                content_json={"code": code}
            )

            order.append(section)

        page.section_order = order
        page.save()

        return Response({
            "page_id": str(page.id),
            "sections": order
        })


# ===============================
# Regenerate Single Section
# ===============================

class RegenerateSection(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, page_id, section):

        page = LandingPage.objects.get(
            id=page_id,
            user=request.user
        )

        obj = LandingSection.objects.filter(
            page=page,
            section_name=section
        ).first()

        existing_code = ""

        if obj:
            existing_code = obj.content_json.get("code", "")

        user_prompt = request.data.get(
            "prompt",
            "Improve this section"
        )

        prompt = REGENERATE_SECTION_PROMPT.format(
            section=section,
            user_prompt=user_prompt,
            existing_code=existing_code
        )

        llm = get_llm()

        res = llm.generate_content(prompt)

        data = safe_json_load(res.text)

        LandingSection.objects.update_or_create(
            page=page,
            section_name=section,
            defaults={
                "content_json": {
                    "code": data["code"]
                }
            }
        )

        return Response({"message": "section regenerated"})


# ===============================
# Preview regenerate (no save)
# ===============================

class PreviewRegenerate(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        prompt = request.data.get("prompt")

        llm = get_llm()

        res = llm.generate_content(prompt)

        return Response({
            "code": res.text
        })


# ===============================
# Get Landing Page (Public view)
# ===============================

class GetLanding(APIView):

    permission_classes = [AllowAny]

    def get(self, request, page_id):

        page = LandingPage.objects.get(id=page_id)

        sections = page.sections.all()

        return Response({

            "section_order": page.section_order,

            "sections": {
                s.section_name: {
                    "code": s.content_json.get("code")
                }
                for s in sections
            }

        })


# ===============================
# Edit Landing (Auth required)
# ===============================

class EditLanding(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, page_id):

        page = LandingPage.objects.get(
            id=page_id,
            user=request.user
        )

        sections = page.sections.all()

        return Response({

            "page_id": str(page.id),

            "section_order": page.section_order,

            "sections": {
                s.section_name: s.content_json
                for s in sections
            }
        })


# ===============================
# Update Entire Landing
# ===============================

class UpdateLanding(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, page_id):

        page = LandingPage.objects.get(
            id=page_id,
            user=request.user
        )

        sections = request.data.get("sections", {})
        section_order = request.data.get("section_order", [])

        with transaction.atomic():

            for section_name, content in sections.items():

                page.sections.filter(
                    section_name=section_name
                ).update(content_json=content)

            page.section_order = section_order
            page.save(update_fields=["section_order"])

        return Response({"status": "saved"})


# ===============================
# Delete Section
# ===============================

class DeleteSection(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, page_id):

        sections = request.data.get("sections", [])

        page = LandingPage.objects.get(
            id=page_id,
            user=request.user
        )

        LandingSection.objects.filter(
            page=page,
            section_name__in=sections
        ).delete()

        return Response({"deleted": sections})


# ===============================
# Delete Page
# ===============================

class DeletePage(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, page_id):

        LandingPage.objects.filter(
            id=page_id,
            user=request.user
        ).delete()

        return Response({"deleted": True})


# ===============================
# User Dashboard Pages
# ===============================

class UserPages(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        pages = LandingPage.objects.filter(
            user=request.user
        ).order_by("-created_at")

        return Response([
            {
                "id": str(p.id),
                "title": p.title,
                "created_at": p.created_at
            }
            for p in pages
        ])
    
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password


class RegisterUser(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "username and password required"},
                status=400
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "username already exists"},
                status=400
            )

        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password)
        )

        return Response({
            "message": "account created"
        })