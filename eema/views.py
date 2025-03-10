from django.db.models import Prefetch
from django.template.defaultfilters import first
from django.views.generic.detail import DetailView
import re
from django.shortcuts import render, get_object_or_404, redirect
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.text import slugify
from docs.conf import author
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.viewsets import ModelViewSet
from django.contrib import messages
from urllib3 import request

# from .forms import CourseRegistrationForm
from core.models import CustomUser
from .pagination import DefaultPagination
from .forms import CourseRegistrationForm
from eema.models import Product, Order, Category, OrderItem, Comment
from eema.serializers import ProductSerializer, CommentSerializer, OrderSerializer, CategorySerializer
from django.shortcuts import render
from django.db.models import Q
from .models import Product, BlogPost, Slide, Course


def course_list(request):
    courses = Course.objects.filter(is_active=True)
    return render(request, 'course_list.html', {'courses': courses})


def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id, is_active=True)
    return render(request, 'course_detail.html', {'course': course})


def course_registration(request):
    if request.method == 'POST':
        form = CourseRegistrationForm(request.POST)
        if form.is_valid():
            form.save()  # ذخیره اطلاعات در دیتابیس
            messages.success(request, 'ثبت نام شما با موفقیت انجام شد!')
            return redirect('home')  # تغییر به صفحه‌ی اصلی یا صفحه‌ی تشکر
    else:
        form = CourseRegistrationForm()

    return render(request, 'course_registration.html', {'form': form})


def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'detailProduct.html', {'product_detail': product})


from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Slide, Course
from .forms import CourseRegistrationForm  # فرم ثبت نام


def home(request):
    slides = Slide.objects.filter(is_active=True)
    courses = Course.objects.filter(is_active=True)

    if request.method == 'POST':
        form = CourseRegistrationForm(request.POST)
        if form.is_valid():
            form.save()  # ذخیره اطلاعات در دیتابیس
            messages.success(request, 'ثبت نام شما با موفقیت انجام شد!')
            return redirect('home')  # تغییر به صفحه‌ی اصلی یا صفحه‌ی تشکر
    else:
        form = CourseRegistrationForm()

    return render(request, 'home.html', {'slides': slides, 'courses': courses, 'form': form})


def blog_detail(request, pk):
    blog_post = get_object_or_404(BlogPost, pk=pk)  # دریافت پست وبلاگ بر اساس pk
    return render(request, 'detailBlog.html', {'blog_detail': blog_post})


@api_view()
def Order_list(request):
    order = Order.objects.get_by_status(status=Order.ORDER_STATUS_CANCELLED)
    serializer = OrderSerializer(order, many=True)
    return Response(serializer.data)


def search(request):
    query = request.GET.get('q')  # دریافت عبارت جستجو از پارامتر GET
    if query:
        # جستجو در محصولات
        product_results = Product.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
        # جستجو در وبلاگ‌ها
        blog_results = BlogPost.objects.filter(
            Q(title__icontains=query) | Q(body__icontains=query)  # از body به جای content استفاده کنید
        )
    else:
        product_results = Product.objects.none()
        blog_results = BlogPost.objects.none()

    return render(request, 'search_results.html', {
        'product_results': product_results,
        'blog_results': blog_results,
        'query': query
    })


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related('category').order_by('name')
    serializer_class = ProductSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'unit_price', 'inventory']
    filterset_fields = ['category', 'inventory']
    pagination_class = DefaultPagination

    def get_serializer_context(self):
        return {'request': self.request}

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        category = Category.objects.all()
        page = self.paginate_queryset(queryset)
        page_object = self.paginator.page

        if page is not None:
            serializer_product = ProductSerializer(page, many=True).data
            context = {
                'serializer_product': serializer_product,
                'products': queryset,
                'categories': category,
                'page': page_object,
            }
            return render(request, 'hello.html', context)

        serializer_product = ProductSerializer(queryset, many=True).data
        context = {
            'serializer_product': serializer_product,
            'categories': category,
        }

        return render(request, 'hello.html', context)

    def destroy(self, request, pk):
        product = get_object_or_404(Product.objects.select_related('category'), pk=pk)
        category = Category.objects.all()

        if product.order_items.count() > 0:
            return render(
                request,
                'error-delete-product.html',
                {
                    'products': self.queryset,
                    'categories': category,
                    'error_exist_order_Item': 'ERROR : there is some order items including this product | please remove them first.',
                },
            )
        product.delete()
        return redirect('product-list')


class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = Category.objects.prefetch_related('products').all()
        blog_id = self.request.query_params.get('blog_id')  # دریافت blog_id از query parameters
        if blog_id:
            blog = get_object_or_404(BlogPost, id=blog_id)
            queryset = blog.categories.all()  # فیلتر کردن دسته‌بندی‌های مرتبط با پست
        return queryset

    def destroy(self, request, pk):
        category = get_object_or_404(Category.objects.prefetch_related('products'), pk=pk)
        if category.products.count() > 0:
            return Response({'ERROR': 'There are some products related to this category. Please remove them first.'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


from rest_framework import viewsets, serializers, status
from rest_framework.response import Response
from .models import BlogPost
from .serializers import BlogPostSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly


class BlogPostViewSet(viewsets.ModelViewSet):
    serializer_class = BlogPostSerializer
    queryset = BlogPost.objects.all().prefetch_related('category__products').select_related('author')
    search_fields = ['title', 'body']
    ordering_fields = ['datetime_created']
    pagination_class = DefaultPagination
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['DELETE', 'GET'], url_path='categories/(?P<category_id>\d+)')
    def remove_category(self, request, slug=None, category_id=None):
        if not category_id:
            return Response({'error': 'Category ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        blog_post = self.get_object()
        category = get_object_or_404(Category, id=category_id)

        # حذف دسته‌بندی از پست
        blog_post.category.remove(category)

        return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['GET'], url_path='categories')
    def get_post_categories(self, request, slug=None):
        if not slug:
            return Response({'error': 'Slug is required.'}, status=status.HTTP_400_BAD_REQUEST)
        blog_post = self.get_object()  # یافتن پست بر اساس slug
        categories = blog_post.category.all()  # دریافت دسته‌بندی‌های مرتبط با پست
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category')
        title = self.request.query_params.get('title')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if category_id:
            queryset = queryset.filter(category__id=category_id)
        if title:
            queryset = queryset.filter(title__icontains=title)
        if start_date and end_date:
            queryset = queryset.filter(datetime_created__range=[start_date, end_date])

        return queryset

    def create(self, request, *args, **kwargs):
        title = request.data.get('title')
        if BlogPost.objects.filter(title=title).exists():
            return Response({'error': 'عنوان این پست از قبل وجود دارد.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    def perform_destroy(self, instance):
        # حذف تمام کامنت‌های مرتبط با پست
        instance.comments.all().delete()
        # حذف تمام دسته‌بندی‌های مرتبط با پست
        instance.category.clear()
        # حذف پست
        instance.delete()


# ---------------------------------------------------------------------------------------------------------------------

class ProductCommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_id = self.kwargs.get('product_pk')
        return Comment.objects.filter(product_id=product_id, parent__isnull=True)  # فقط نظرات والد (بدون پاسخ‌ها)

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_pk')
        product = Product.objects.get(id=product_id)
        serializer.save(product=product, author=self.request.user, status=Comment.WAITING)

    @action(detail=True, methods=['post'])
    def reply(self, request, blog_slug=None, pk=None):
        parent_comment = self.get_object()  # این می‌تواند یک کامنت اصلی یا یک ریپلای باشد
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            post=parent_comment.post,
            author=request.user,
            parent=parent_comment,  # parent را به کامنت فعلی تنظیم می‌کند
            status=Comment.WAITING
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def like(self, request, blog_slug=None, pk=None):
        comment = self.get_object()  # این می‌تواند یک کامنت اصلی یا یک ریپلای باشد
        comment.likes.add(request.user)
        comment.dislikes.remove(request.user)
        return Response({
            'like_count': comment.like_count,
            'dislike_count': comment.dislike_count,
        })

    @action(detail=True, methods=['post'])
    def dislike(self, request, blog_slug=None, pk=None):
        comment = self.get_object()  # این می‌تواند یک کامنت اصلی یا یک ریپلای باشد
        comment.dislikes.add(request.user)
        comment.likes.remove(request.user)
        return Response({
            'like_count': comment.like_count,
            'dislike_count': comment.dislike_count,
        })


# ---------------------------------------------------------------------------------------------------------------------


class BlogPostCommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        blog_slug = self.kwargs.get('blog_slug')
        return Comment.objects.filter(
            post__slug=blog_slug,
            status=Comment.APPROVED,
            parent__isnull=True  # فقط کامنت‌های اصلی
        ).prefetch_related(
            'replies'
        ).distinct().order_by('-datetime_created')

    def perform_create(self, serializer):
        blog_slug = self.kwargs.get('blog_slug')
        blog_post = get_object_or_404(BlogPost, slug=blog_slug)
        serializer.save(post=blog_post, author=self.request.user)

    @action(detail=True, methods=['post'])
    def reply(self, request, blog_slug=None, pk=None):
        parent_comment = get_object_or_404(Comment, id=pk)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(parent=parent_comment, author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def like(self, request, blog_slug=None, pk=None):
        comment = get_object_or_404(Comment, id=pk)
        comment.likes.add(request.user)
        comment.dislikes.remove(request.user)
        return Response({
            'like_count': comment.like_count,
            'dislike_count': comment.dislike_count,
        })

    @action(detail=True, methods=['post'])
    def dislike(self, request, blog_slug=None, pk=None):
        comment = get_object_or_404(Comment, id=pk)
        comment.dislikes.add(request.user)
        comment.likes.remove(request.user)
        return Response({
            'like_count': comment.like_count,
            'dislike_count': comment.dislike_count,
        })


from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

@login_required
def check_auth(request):
    return JsonResponse({
        'isAuthenticated': request.user.is_authenticated,
    })


# ---------------------------------------------------------------------------------------------------------------------

class AdminCommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    http_method_names = ['get', 'delete']

    def get_queryset(self):
        blog_slug = self.kwargs.get('blog_slug')
        return Comment.objects.prefetch_related('author').filter(
            post__slug=blog_slug)  # تمام کامنت‌ها (بدون فیلتر وضعیت)


# ---------------------------------------------------------------------------------------------------------------------


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.prefetch_related(
            Prefetch(
                'items',
                queryset=OrderItem.objects.select_related('product')
            )
        ).select_related('customer').all()
