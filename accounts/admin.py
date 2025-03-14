from django.contrib import admin

from django.contrib.auth.admin import UserAdmin

from core.admin import CustomUserAdmin
from core.models import CustomUser
from .forms import CustomUserCreationForm,CustomUserChangeForm

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ['username','email','is_staff']


