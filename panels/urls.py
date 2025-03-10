from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import admin_panel, user_panel, CustomUserViewSet, AuthorListView, get_admin_info, edit_admin_profile_ajax,\
    user_profile, edit_user_profile, user_orders, user_comments
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from . import views
router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/authors/', AuthorListView.as_view(), name='author-list'),
    path('admin-panel/', admin_panel, name='admin-panel'),
    path('api/get_admin_info/', get_admin_info, name='get_admin_info'),
    path('api/edit_admin_profile/', edit_admin_profile_ajax, name='edit_admin_profile'),
    path('user-panel/', user_panel, name='user-panel'),
    path('user-panel/profile/', user_profile, name='user_profile'),
    path('user-panel/profile/edit/', edit_user_profile, name='edit_user_profile'),
    path('user-panel/orders/', user_orders, name='user_orders'),
    path('user-panel/comments/', user_comments, name='user_comments'),
    path('tickets/', views.ticket_list, name='ticket_list'),
    path('tickets/create/', views.create_ticket, name='create_ticket'),
    path('tickets/<int:ticket_id>/', views.ticket_detail, name='ticket_detail'),
    path('api/order_data/', views.order_data, name='order_data'),
    path('api/comment_data/', views.comment_data, name='comment_data'),

    path('delete-post/<slug:slug>/', views.delete_post, name='delete_post'),

    path('password_change/', auth_views.PasswordChangeView.as_view(template_name='password_change.html'),
         name='password_change'),
    path('password_change/done/', auth_views.PasswordChangeDoneView.as_view(template_name='password_change_done.html'),
         name='password_change_done'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)





