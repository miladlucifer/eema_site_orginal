from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from django.contrib.auth import login, authenticate,logout
from django.contrib import messages
from .forms import CustomLoginForm, CustomSignupForm
from core.models import CustomUser


class LoginSignupView(TemplateView):
    template_name = 'account/login_signup.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['login_form'] = CustomLoginForm()
        context['signup_form'] = CustomSignupForm()
        context['next'] = self.request.GET.get('next', '')
        return context

    def handle_login(self, request, login_form, next_url, **kwargs):
        if login_form.is_valid():
            user = login_form.cleaned_data.get('user')
            backend = login_form.cleaned_data.get('backend')
            if user is not None:
                login(request, user, backend=backend)
                return redirect(next_url if next_url else 'home')
            else:
                login_form.add_error(None, 'ایمیل یا نام کاربری یا رمز عبور اشتباه است')

        context = self.get_context_data(**kwargs)
        context['login_form'] = login_form
        context['next'] = next_url
        return self.render_to_response(context)

    def handle_signup(self, request, signup_form, next_url, **kwargs):
        if signup_form.is_valid():
            signup_form.save(request)
            messages.success(request, 'ثبت نام با موفقیت انجام شد، برای ورود میتوانید اقدام کنید.')
            return redirect('login_signup')

        context = self.get_context_data(**kwargs)
        context['signup_form'] = signup_form
        context['next'] = next_url
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        login_form = CustomLoginForm(request.POST)
        signup_form = CustomSignupForm(request.POST)
        next_url = request.POST.get('next', '')

        if 'login' in request.POST:
            return self.handle_login(request, login_form, next_url, **kwargs)

        elif 'signup' in request.POST:
            return self.handle_signup(request, signup_form, next_url, **kwargs)

        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)


def custom_logout_view(request):
    logout(request)
    return redirect('home')

