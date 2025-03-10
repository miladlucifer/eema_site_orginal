from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.contrib import admin
from django.views.generic import TemplateView
from eema.views import home, course_registration, course_list, course_detail
from panels.views import delete_post_confirmation
from accounts.views import custom_logout_view
from accounts.views import LoginSignupView
admin.site.site_header = 'EEMA'
admin.site.index_title = 'EEMA WEBSITE MANAGEMENT'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',home,name='home',),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('blog/', include('blog.urls')),
    path('api/', include('eema.urls')),
    path('courses/', course_list, name='course_list'),
    path('panels/', include('panels.urls')),
    path('course-registration/', course_registration, name='course_registration'),
    path('courses/<int:course_id>/', course_detail, name='course_detail'),
    path('rosetta/', include('rosetta.urls')),
    path('accounts/', include('allauth.urls')),
    path('accounts/login_signup/', LoginSignupView.as_view(), name='login_signup'),
    path('logout/', custom_logout_view, name='custom_logout'),
    path("__debug__/", include('debug_toolbar.urls')),
    path('delete-post-confirmation/<slug:blog_slug>/',delete_post_confirmation, name='delete_post_confirmation'),





]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
