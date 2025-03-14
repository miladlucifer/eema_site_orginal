from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from core.models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username","email", "usable_password", "password1", "password2","first_name","last_name"),
            },
        ),
    )



