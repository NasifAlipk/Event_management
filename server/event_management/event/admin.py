from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "organizer", "start_date", "status", "created_at")
    list_filter = ("status", "category", "event_type")
    search_fields = ("title", "venue_name", "organizer__username")
