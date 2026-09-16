from django.conf import settings
from django.db import models


class Event(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending Review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    class Visibility(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"
        PRIVATE = "PRIVATE", "Private"

    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="events")
    title = models.CharField(max_length=180)
    description = models.TextField(max_length=3000)
    event_type = models.CharField(max_length=80)
    category = models.CharField(max_length=80)
    start_date = models.DateField()
    start_time = models.TimeField()
    end_date = models.DateField()
    end_time = models.TimeField()
    venue_name = models.CharField(max_length=180)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=20)
    visibility = models.CharField(max_length=10, choices=Visibility.choices, default=Visibility.PUBLIC)
    max_participants = models.PositiveIntegerField(default=0)
    regular_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    regular_quantity = models.PositiveIntegerField(default=0)
    vip_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vip_quantity = models.PositiveIntegerField(default=0)
    premium_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    premium_quantity = models.PositiveIntegerField(default=0)
    main_banner = models.FileField(upload_to="event_banners/")
    promotional_image = models.FileField(upload_to="event_promotions/", blank=True, null=True)
    age_restriction = models.BooleanField(default=False)
    special_instructions = models.TextField(blank=True, default="")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.title
