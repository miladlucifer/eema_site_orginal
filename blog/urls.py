from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostDetailView, blog_page, CategoryPosts
from eema.views import CommentViewSet

router = DefaultRouter()
router.register(r'comments', CommentViewSet, basename='comments')

urlpatterns = [
    path('', blog_page, name='blog_page'),
    path('category/<slug:category_slug>/', CategoryPosts, name='category_posts'),
    re_path(r'^(?P<slug>[-\wء-ي]+)/$', BlogPostDetailView.as_view(), name='blog_detail'),
    path('api/blog/<slug:blog_slug>/', include(router.urls)),  # اضافه کردن مسیر جدید برای کامنت‌ها
]
