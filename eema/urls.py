from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_view
from unicodedata import lookup
from . import views
from rest_framework_nested import routers
from django.urls import include

router = routers.DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'blog', views.BlogPostViewSet, basename='blog')
router.register('categories', views.CategoryViewSet, basename='category')

product_router = routers.NestedDefaultRouter(router, 'products', lookup='product')
product_router.register('comments', views.CommentViewSet, basename='product-comment')

post_router = routers.NestedDefaultRouter(router, 'blog', lookup='blog')
post_router.register('comments', views.CommentViewSet, basename='post-comment')

urlpatterns = [
    path('', include(router.urls)),
    path('products/', views.ProductViewSet.as_view({'get': 'list'}), name='product-list'),
    path('blog/', views.BlogPostViewSet.as_view({'get': 'list'}), name='blog-list'),
    path('products/<int:pk>/delete/', views.ProductViewSet.as_view({'post': 'destroy'}), name='product-destroy'),
    path('products-list/<int:pk>/', views.product_detail, name='product-detail'),
] + product_router.urls + post_router.urls




# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('hello/',views.CategoryList.as_view(),name='category'),
#     path('products/', views.ProductList.as_view(), name='products'),
#     path('products/<int:pk>/', views.ProductDetail.as_view(), name='product'),
#     path('comments/', views.Comment_list, name='comments'),
#     path('orders/', views.Order_list, name='orders'),
#     path('categories/', views.CategoryList.as_view(), name='categories'),
#     path('categories/<int:pk>/', views.CategoryDetail.as_view(), name='category-detail'),
# ]