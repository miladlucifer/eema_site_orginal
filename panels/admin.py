from django.contrib import admin
from .models import Ticket, TicketResponse

class TicketResponseInline(admin.TabularInline):
    model = TicketResponse
    extra = 1
    fields = ['user', 'message', 'created_at']
    readonly_fields = ['created_at']

from django.contrib import admin
from .models import Department, Ticket, TicketResponse

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'department', 'subject', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'department']
    search_fields = ['subject', 'user__username']
    fieldsets = [
        (None, {
            'fields': ['user', 'department', 'subject', 'message', 'status']
        }),
        ('تاریخ‌ها', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    ]
    readonly_fields = ['created_at', 'updated_at']

@admin.register(TicketResponse)
class TicketResponseAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticket', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['ticket__subject', 'user__username']
    fields = ['ticket', 'user', 'message', 'created_at']
    readonly_fields = ['created_at']


