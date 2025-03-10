from rest_framework_nested import routers
from django.urls import path, include
from . import views

router = routers.DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'blog', views.BlogPostViewSet, basename='blog')
router.register(r'blog/(?P<blog_slug>[^/.]+)/comments', views.BlogPostCommentViewSet, basename='blogpost-comment')
router.register('orders', views.OrderViewSet, basename='order')
router.register(r'categories', views.CategoryViewSet, basename='category')

# کامنت‌های محصولات
product_router = routers.NestedDefaultRouter(router, 'products', lookup='product')
product_router.register('comments', views.ProductCommentViewSet, basename='product-comment')

# کامنت‌های پست‌های وبلاگ
comments = routers.NestedDefaultRouter(router, 'blog', lookup='blog')
comments.register('comments', views.BlogPostCommentViewSet, basename='post-comment')
# تمام کامنت‌ها برای پنل ادمین
comments.register('admin-comments', views.AdminCommentViewSet, basename='admin-post-comment')

urlpatterns = [
    path('', include(router.urls)),
    path('products/', views.ProductViewSet.as_view({'get': 'list'}), name='product-list'),
    path('blog/', views.BlogPostViewSet.as_view({'get': 'list'}), name='blog-list'),
    path('products/<int:pk>/delete/', views.ProductViewSet.as_view({'post': 'destroy'}), name='product-destroy'),
    path('products-list/<int:pk>/', views.product_detail, name='product-detail'),
    path('search/', views.search, name='search'),
    path('check-auth/', views.check_auth, name='check_auth'),
    path('product/<int:pk>/', views.product_detail, name='product_detail'),
    path('blog/<int:pk>/', views.blog_detail, name='blog_detail'),
] + product_router.urls + comments.urls