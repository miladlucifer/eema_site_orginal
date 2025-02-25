from itertools import product
import re
from django.utils.text import slugify
from rest_framework import serializers
from unicodedata import category

from core.models import CustomUser
from eema.models import Product, Category, Comment, BlogPost, Customer
from jalali_date import datetime2jalali


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email']


class CategorySerializer(serializers.ModelSerializer):
    num_of_products = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'title', 'description', 'num_of_products']


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.title')

    class Meta:
        model = Product
        fields = ['id', 'name', 'unit_price', 'category', 'inventory']

    def validate(self, data):
        if len(data['name']) < 6:
            raise serializers.ValidationError('Name must be at least 6 characters')
        return data

    def create(self, validated_data):
        product = Product(**validated_data)
        product.slug = slugify(product.name)
        product.save()
        return product


from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'body', 'post', 'product', 'datetime_created', 'status']

    def create(self, validated_data):
        request = self.context.get('request')
        blog_pk = request.parser_context['kwargs'].get('blog_pk')
        product_pk = request.parser_context['kwargs'].get('product_pk')

        if blog_pk:
            validated_data['post_id'] = blog_pk
            validated_data.pop('product', None)  # حذف فیلد 'product' در صورت وجود
        elif product_pk:
            validated_data['product_id'] = product_pk
            validated_data.pop('post', None)  # حذف فیلد 'post' در صورت وجود

        return Comment.objects.create(**validated_data)



class OrderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.CharField()


import logging
from rest_framework import serializers
from .models import BlogPost, Category
from django.utils.text import slugify
from jalali_date import datetime2jalali

logger = logging.getLogger(__name__)

class BlogPostSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True, required=False)
    category_display = CategorySerializer(source='category', many=True, read_only=True)
    jalali_date = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'body', 'short_body', 'author', 'category', 'datetime_created', 'category_display',
                  'datetime_modified', 'image', 'slug', 'url', 'jalali_date', 'status']

    def get_jalali_date(self, obj):
        return datetime2jalali(obj.datetime_created).strftime('%d-%م-%ی')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.get_absolute_url())

    def create(self, validated_data):
        try:
            logger.info("Creating blog post")
            if 'slug' not in validated_data or not validated_data['slug']:
                base_slug = re.sub(r'[^-\w\s]', '', validated_data['title'])  # حذف تمامی کاراکترهای غیرمجاز
                base_slug = base_slug.replace(" ", "-")  # جایگزینی فاصله‌ها با خط تیره
                base_slug = re.sub(r'--+', '-', base_slug)  # حذف خط تیره‌های متوالی
                validated_data['slug'] = base_slug
            logger.info(f"Creating blog post with slug: {validated_data['slug']}")
            return super().create(validated_data)
        except Exception as e:
            logger.error(f"Error creating blog post: {e}")
            raise e

    def update(self, instance, validated_data):
        try:
            logger.info("Updating blog post")
            logger.info(f"Validated data: {validated_data}")  # افزودن لاگ برای بررسی داده‌های اعتبارسنجی‌شده
            if 'slug' not in validated_data or not validated_data['slug']:
                base_slug = re.sub(r'[^-\w\s]', '', validated_data['title'])  # حذف تمامی کاراکترهای غیرمجاز
                base_slug = base_slug.replace(" ", "-")  # جایگزینی فاصله‌ها با خط تیره
                base_slug = re.sub(r'--+', '-', base_slug)  # حذف خط تیره‌های متوالی
                validated_data['slug'] = base_slug
            logger.info(f"Updating blog post with slug: {validated_data['slug']}")
            return super().update(instance, validated_data)
        except Exception as e:
            logger.error(f"Error updating blog post: {e}")
            raise e



class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'user', 'phone_number', 'birth_date']
