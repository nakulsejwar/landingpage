# landing_ai/models.py
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
import uuid

class LandingPage(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="landing_pages",null=True, blank=True)

    title = models.CharField(max_length=200)
    prompt = models.TextField()

    section_order = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class LandingSection(models.Model):

    page = models.ForeignKey(
        LandingPage,
        on_delete=models.CASCADE,
        related_name="sections"
    )

    section_name = models.CharField(max_length=100)

    content_json = models.JSONField(null=True, blank=True)

    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("page", "section_name")

    def __str__(self):
        return f"{self.page.title} - {self.section_name}"