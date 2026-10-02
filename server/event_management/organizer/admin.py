from django.contrib import admin

from .models import OrganizerApplication


@admin.register(OrganizerApplication)
class OrganizerApplicationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "organization_name", "organizer_type", "status", "created_at")
    list_filter = ("status", "organizer_type", "created_at")
    search_fields = ("full_name", "organization_name", "user__email")
