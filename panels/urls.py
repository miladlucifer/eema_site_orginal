from django.urls import path , include
from rest_framework.routers import DefaultRouter
from .views import admin_panel, user_panel, CustomUserViewSet,AuthorListView, get_admin_info, edit_admin_profile_ajax

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    path('api/',include(router.urls)),
    path('api/authors/', AuthorListView.as_view(), name='author-list'),
    path('admin-panel/', admin_panel, name='admin-panel'),
    path('api/get_admin_info/', get_admin_info, name='get_admin_info'),
    path('api/edit_admin_profile/', edit_admin_profile_ajax, name='edit_admin_profile'),
    path('user-panel/', user_panel, name='user-panel'),
]





