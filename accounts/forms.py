from cProfile import label

from cryptography.hazmat.backends.openssl import backend
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AdminUserCreationForm ,UserChangeForm ,UserCreationForm
from django.contrib.auth.models import User
from django import forms
from django.core.validators import EmailValidator, validate_email,ValidationError
from django.utils.translation import gettext_lazy as _
import re
from django.contrib.auth.forms import PasswordChangeForm
from urllib3 import request

from core.models import CustomUser



class CustomUserCreationForm(AdminUserCreationForm):
    usable_password = None
    class Meta:
        model = CustomUser
        fields = ('username', 'email','first_name','last_name', 'password1', 'password2','phone_number')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name','password','phone_number')



class CustomPasswordChangeForm(PasswordChangeForm):
    class Meta:
        fields = ['old_password', 'new_password1', 'new_password2']




class CustomSignupForm(UserCreationForm):
    email = forms.EmailField(
        label=_('ایمیل'),
        required=True,
    )
    first_name = forms.CharField(
        label=_('نام (جهت نمایش در سایت)'),
        max_length=30,
        required=False,
    )

    password1 = forms.CharField(
        label=_('رمز عبور'),
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        strip=False,
        help_text="",
    )

    password2 = forms.CharField(
        label=_('تکرار رمز عبور'),
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        strip=False,
        help_text="",
    )

    username = forms.CharField(
        label=_('نام کاربری'),
        widget=forms.TextInput(attrs={'autocomplete': 'new-user'}),
        help_text="",
        required=False,
    )

    phone_number = forms.CharField(
        label=('شماره تماس'),
        widget=forms.NumberInput(attrs={'autocomplete': 'new-number'}),
    )


    class Meta:
        model = CustomUser
        fields = ('first_name', 'username', 'email','phone_number', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user


class CustomLoginForm(forms.Form):
    email_or_username = forms.CharField(
        label=_('ایمیل یا نام کاربری'),
        max_length=100,
        widget=forms.TextInput(attrs={'autocomplete': 'email'})
    )
    password = forms.CharField(
        label=_('رمز عبور'),
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'current-password'})
    )

    def clean(self):
        email_or_username = self.cleaned_data.get('email_or_username')
        password = self.cleaned_data.get('password')

        email_regex = re.compile(r"[^@]+@[^@]+\.[^@]+")

        if email_regex.match(email_or_username):
            backend = 'accounts.backends.EmailBackend'
            user = CustomUser.objects.filter(email=email_or_username).first()
        else:
            backend = 'django.contrib.auth.backends.ModelBackend'
            user = CustomUser.objects.filter(username=email_or_username).first()

        if user:
            user = authenticate(request=request, username=user.username, password=password, backend=backend)
        else:
            if email_regex.match(email_or_username):
                raise forms.ValidationError('.این ایمیل وجود ندارد')
            else:
                raise forms.ValidationError('.این نام کاربری وجود ندارد')

        if not user:
            raise forms.ValidationError('.رمز عبور اشتباه است')

        self.cleaned_data['user'] = user
        self.cleaned_data['backend'] = backend
        return self.cleaned_data




