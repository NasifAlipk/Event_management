from django.conf import settings
from django.db import models


class OrganizerApplication(models.Model):
    class OrganizerType(models.TextChoices):
        INDIVIDUAL = "INDIVIDUAL", "Individual"
        COMPANY = "COMPANY", "Company"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organizer_applications",
    )
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=30)
    organizer_type = models.CharField(max_length=12, choices=OrganizerType.choices)
    organization_name = models.CharField(max_length=180)
    short_description = models.TextField(max_length=1000)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    identity_document_type = models.CharField(max_length=80)
    identity_document_name = models.CharField(max_length=180)
    identity_document_image = models.FileField(upload_to="organizer_documents/")
    information_accurate = models.BooleanField(default=False)
    terms_accepted = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.full_name} ({self.get_status_display()})"
