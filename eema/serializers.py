import jdatetime
import logging
from itertools import product
import re
from django.utils.text import slugify
from rest_framework import serializers
from unicodedata import category
from core.models import CustomUser
from panels.serializers import CustomUserSerializer
from .models import Product, Category, Comment, BlogPost, Customer, Order, OrderItem
from jalali_date import datetime2jalali


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'user', 'phone_number', 'birth_date']


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
    author_avatar = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(source='author.is_staff', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'author_name', 'author_avatar', 'body', 'post', 'datetime_created',
            'status', 'parent', 'like_count', 'dislike_count', 'replies', 'is_staff'
        ]
        read_only_fields = [
            'id', 'author', 'post', 'datetime_created', 'status',
            'like_count', 'dislike_count', 'replies'
        ]

    def get_author_avatar(self, obj):
        request = self.context.get('request')
        if obj.author.avatar:
            return request.build_absolute_uri(obj.author.avatar.url)
        return None

    def get_like_count(self, obj):
        return obj.like_count

    def get_dislike_count(self, obj):
        return obj.dislike_count

    def get_replies(self, obj):
        replies = obj.approved_replies()
        return CommentSerializer(replies, many=True).data


class OrderItemProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'unit_price']


class OrderItemSerializer(serializers.ModelSerializer):
    product = OrderItemProductSerializer()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']


class OrderSerializer(serializers.Serializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'status', 'datetime_created', 'items']


def generate_slug(title):
    base_slug = re.sub(r'[^-\w\s]', '', title)  # حذف تمامی کاراکترهای غیرمجاز
    base_slug = base_slug.replace(" ", "-")  # جایگزینی فاصله‌ها با خط تیره
    base_slug = re.sub(r'--+', '-', base_slug)  # حذف خط تیره‌های متوالی
    return base_slug


logger = logging.getLogger(__name__)


class BlogPostSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True, required=False)
    category_display = CategorySerializer(source='category', many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    jalali_date = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'body', 'short_body', 'author', 'author_name', 'category', 'comments',
                  'datetime_created', 'category_display',
                  'datetime_modified', 'image', 'image_url', 'slug', 'url', 'jalali_date', 'status']

    def get_author_name(self, obj):
        return obj.author.get_full_name()

    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.get_absolute_url())

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_jalali_date(self, obj):
        jalali_date = jdatetime.datetime.fromgregorian(datetime=obj.datetime_created)
        return jalali_date.strftime('%Y/%m/%d')  # فرمت تاریخ شمسی

    def create(self, validated_data):
        try:
            logger.info("Creating blog post")
            if 'slug' not in validated_data or not validated_data['slug']:
                validated_data['slug'] = generate_slug(validated_data['title'])
            logger.info(f"Creating blog post with slug: {validated_data['slug']}")
            return super().create(validated_data)
        except Exception as e:
            logger.error(f"Error creating blog post: {e}")
            raise e

    def update(self, instance, validated_data):
        try:
            logger.info("Updating blog post")
            logger.info(f"Validated data: {validated_data}")
            if 'slug' not in validated_data or not validated_data['slug']:
                validated_data['slug'] = generate_slug(validated_data['title'])
            logger.info(f"Updating blog post with slug: {validated_data['slug']}")
            return super().update(instance, validated_data)
        except Exception as e:
            logger.error(f"Error updating blog post: {e}")
            raise e
