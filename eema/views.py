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

from core.models import CustomUser
from .pagination import DefaultPagination
from eema.models import Product, Comment, Order, Category, BlogPost
from eema.serializers import ProductSerializer, CommentSerializer, OrderSerializer, CategorySerializer, \
    BlogPostSerializer


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


def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'detailProduct.html', {'product_detail': product})


class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.prefetch_related('products').all()

    def destroy(self, request, pk):
        category = get_object_or_404(Category.objects.prefetch_related('products'), pk=pk)
        if category.products.count() > 0:
            return Response({'ERROE': 'There is some products relating this category. please remove them first.'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view()
def Order_list(request):
    order = Order.objects.get_by_status(status=Order.ORDER_STATUS_CANCELLED)
    serializer = OrderSerializer(order, many=True)
    return Response(serializer.data)


import logging
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from .models import BlogPost
from .serializers import BlogPostSerializer
from .pagination import DefaultPagination
import re

logger = logging.getLogger(__name__)


from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import BlogPost
from .serializers import BlogPostSerializer
from .pagination import DefaultPagination

class BlogPostViewSet(viewsets.ModelViewSet):
    serializer_class = BlogPostSerializer
    queryset = BlogPost.objects.all().order_by('-datetime_created')
    search_fields = ['title', 'body']
    ordering_fields = ['datetime_created']
    pagination_class = DefaultPagination
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    lookup_field = 'slug'

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # فیلتر کردن بر اساس دسته‌بندی
        category_id = request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category__id=category_id)

        # فیلتر کردن بر اساس عنوان
        title = request.query_params.get('title', None)
        if title:
            queryset = queryset.filter(title=title)

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            data = serializer.data
            for item in data:
                items = CustomUser.objects.get(pk=item['author'])
                item['author_name'] = items.get_full_name()
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            items = CustomUser.objects.get(pk=item['author'])
            item['author_name'] = items.get_full_name()
        return Response(data)

    def create(self, request, *args, **kwargs):
        title = request.data.get('title')
        if BlogPost.objects.filter(title=title).exists():
            return Response({'error': 'عنوان این پست از قبل وجود دارد.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)



from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import BlogPost, Comment
from .serializers import CommentSerializer

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    pagination_class = DefaultPagination

    def get_queryset(self):
        blog_slug = self.kwargs.get('blog_slug')
        if blog_slug:
            try:
                blog_post = BlogPost.objects.get(slug=blog_slug)
                return Comment.objects.filter(post=blog_post, status=Comment.APPROVED).order_by('-datetime_created')
            except BlogPost.DoesNotExist:
                return Comment.objects.none()
        return Comment.objects.none()

    def perform_create(self, serializer):
        blog_slug = self.kwargs.get('blog_slug')
        try:
            blog_post = BlogPost.objects.get(slug=blog_slug)
            author = self.request.user
            serializer.save(post=blog_post, author=author, status=Comment.WAITING)
        except BlogPost.DoesNotExist:
            raise ValueError("Blog post does not exist")

    def create(self, request, *args, **kwargs):
        blog_slug = self.kwargs.get('blog_slug')
        if not blog_slug:
            return Response({'error': 'Blog slug is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            post = BlogPost.objects.get(slug=blog_slug)
            body = request.data.get('body')

            if not body:
                return Response({'error': 'Body is required'}, status=status.HTTP_400_BAD_REQUEST)

            author = request.user
            if not author.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

            comment = Comment(post=post, author=author, body=body, status=Comment.WAITING)
            comment.save()
            serializer = self.get_serializer(comment)
            return Response(serializer.data)
        except BlogPost.DoesNotExist:
            return Response({'error': 'Blog post does not exist'}, status=status.HTTP_400_BAD_REQUEST)










