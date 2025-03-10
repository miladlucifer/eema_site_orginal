from django.urls import path, re_path
from .views import BlogPostDetailView, blog_page, CategoryPosts
urlpatterns = [
    path('', blog_page, name='blog_page'),
    path('category/<slug:category_slug>/', CategoryPosts, name='category_posts'),
    re_path(r'^(?P<slug>[-\wء-ي]+)/$', BlogPostDetailView.as_view(), name='blog_detail'),
]