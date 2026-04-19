# landing_ai/models.py
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
import uuid


class LandingPage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="landing_pages", null=True, blank=True)
    title = models.CharField(max_length=200)
    prompt = models.TextField()
    section_order = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class LandingSection(models.Model):
    page = models.ForeignKey(LandingPage, on_delete=models.CASCADE, related_name="sections")
    section_name = models.CharField(max_length=100)
    content_json = models.JSONField(null=True, blank=True)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("page", "section_name")

    def __str__(self):
        return f"{self.page.title} - {self.section_name}"


class ContactFormConfig(models.Model):
    """Config for the contact/lead form attached to a landing page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.OneToOneField(LandingPage, on_delete=models.CASCADE, related_name="contact_form")

    title = models.CharField(max_length=200, default="Get In Touch")
    subtitle = models.TextField(blank=True, default="Fill the form and we will get back to you shortly.")
    submit_label = models.CharField(max_length=100, default="Send Message")
    success_message = models.TextField(default="Thank you! We'll be in touch soon.")
    admin_email = models.EmailField(blank=True)

    # JSON array of field configs:
    # [{"id":"uuid","type":"text","label":"Name","placeholder":"","required":true,"options":[]}]
    fields_config = models.JSONField(default=list)

    button_color = models.CharField(max_length=20, default="#22d3ee")
    background_color = models.CharField(max_length=20, default="transparent")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Form for {self.page.title}"


class ContactFormEntry(models.Model):
    """A single submitted form entry."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(ContactFormConfig, on_delete=models.CASCADE, related_name="entries")
    data = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Entry {self.id} — {self.submitted_at.strftime('%Y-%m-%d %H:%M')}"
