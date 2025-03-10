from datetime import timezone
from inspect import stack
import re
from django.db import models
from django.urls import reverse
from django.utils.text import slugify
from unicodedata import category
from config import settings
from core.models import CustomUser
from django.utils import timezone
from ckeditor.fields import RichTextField


# ----------CATEGORY MODEL ----------

class Category(models.Model):
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    top_product = models.ForeignKey('Product', on_delete=models.SET_NULL, null=True, related_name='+')

    def __str__(self):
        return self.title


# ----------CATEGORY MODEL ----------

# ---------------------------------------------------------------------------------------------------------

# ----------DISCOUNT MODEL ----------

class Discount(models.Model):
    discount = models.FloatField()
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.description


# ----------DISCOUNT MODEL ----------


# ----------PRODUCT MODEL ----------

class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    slug = models.SlugField()
    description = models.TextField()
    unit_price = models.DecimalField(max_digits=5, decimal_places=2)
    inventory = models.IntegerField()
    datetime_created = models.DateTimeField(auto_now_add=True)
    datetime_modified = models.DateTimeField(auto_now=True)
    discounts = models.ManyToManyField(Discount, blank=True)

    def __str__(self):
        return self.name


# ----------PRODUCT MODEL ----------

# ---------------------------------------------------------------------------------------------------------

# ----------CUSTOMER MODEL ----------

class Customer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    phone_number = models.CharField(max_length=11)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'


# ----------CUSTOMER MODEL ----------

# ---------------------------------------------------------------------------------------------------------

# ---------- ORDER MODEL ----------
# ===== settings query order =====
class OrderManager(models.Manager):
    def get_by_status(self, status):
        if status in [Order.ORDER_STATUS_UNPAID, Order.ORDER_STATUS_PAID, Order.ORDER_STATUS_CANCELLED]:
            return self.get_queryset().filter(status=status)
        return self.get_queryset()


class UnpaidOrderManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status=Order.ORDER_STATUS_UNPAID)


# ===== settings query order =====

class Order(models.Model):
    ORDER_STATUS_PAID = 'P'
    ORDER_STATUS_UNPAID = 'U'
    ORDER_STATUS_CANCELLED = 'C'

    ORDER_STATUS_CHOICES = [
        (ORDER_STATUS_PAID, 'پرداخت شده'),
        (ORDER_STATUS_UNPAID, 'پرداخت نشده'),
        (ORDER_STATUS_CANCELLED, 'لغو شده'),
    ]
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    date_created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=1, choices=ORDER_STATUS_CHOICES, default=ORDER_STATUS_UNPAID)

    objects = OrderManager()
    unpaid_orders = UnpaidOrderManager()

    def __str__(self):
        return f'{self.customer.first_name}-{self.customer.last_name}'


# ----------ORDER MODEL ----------

# ---------------------------------------------------------------------------------------------------------

# ----------ORDER_ITEM MODEL ----------

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveSmallIntegerField()
    price = models.DecimalField(max_digits=6, decimal_places=2)

    class Meta:
        unique_together = [['order', 'product']]


class Cart(models.Model):
    date_created = models.DateTimeField(auto_now_add=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = [['cart', 'product']]


# ----------ORDER_ITEM MODEL ----------

# ---------------------------------------------------------------------------------------------------------

# ---------- COMMENT MODEL ----------
# ===== settings status comments =====
class StatusComment(models.Manager):
    def approved(self):
        return self.get_queryset().filter(status=Comment.APPROVED)

    def waiting(self):
        return self.get_queryset().filter(status=Comment.WAITING)

    def not_approved(self):
        return self.get_queryset().filter(status=Comment.NOT_APPROVED)


# ===== settings status comments =====


class Comment(models.Model):
    WAITING = 'در حال بررسی'
    APPROVED = 'منتشر شده'
    NOT_APPROVED = 'تایید نشده'

    COMMENT_TYPE_CHOICES = [
        (WAITING, 'Waiting'),
        (APPROVED, 'Approved'),
        (NOT_APPROVED, 'Not Approved'),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='comments', null=True, blank=True)
    author = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name='comments')
    body = models.TextField(max_length=1000)
    post = models.ForeignKey('BlogPost', on_delete=models.PROTECT, related_name='comments', null=True, blank=True)
    datetime_created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=13, choices=COMMENT_TYPE_CHOICES, default=WAITING)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')  # پاسخ‌ها
    likes = models.ManyToManyField(CustomUser, related_name='liked_comments', blank=True)  # لایک‌ها
    dislikes = models.ManyToManyField(CustomUser, related_name='disliked_comments', blank=True)  # دیس‌لایک‌ها

    objects = models.Manager()
    settingComments = StatusComment()

    def __str__(self):
        if self.post:
            return f"Comment by {self.author.username} on {self.post.title}"
        elif self.product:
            return f"Comment by {self.author.username} on {self.product.title}"
        else:
            return f"Comment by {self.author.username} (No Post or Product)"

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def dislike_count(self):
        return self.dislikes.count()

    @property
    def is_reply(self):
        return self.parent is not None

    def approved_replies(self):
        return self.replies.filter(status=Comment.APPROVED)  # فقط ریپلای‌های تایید شده




# ---------- COMMENT MODEL ----------

# ---------------------------------------------------------------------------------------------------------

# ---------- ADDRESS MODEL ----------

class Address(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, primary_key=True)
    province = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    street = models.CharField(max_length=255)


# ---------- ADDRESS MODEL ----------


# ---------- BLOG POST MODEL ----------
from django.db import models
from django.core.exceptions import ValidationError
from ckeditor.fields import RichTextField
import re
from django.utils import timezone
from django.urls import reverse

def validate_unique_title(value, instance):
    if BlogPost.objects.exclude(pk=instance.pk).filter(title=value).exists():
        raise ValidationError('عنوان این پست از قبل وجود دارد.')

class BlogPost(models.Model):
    PUBLISHED = "P"
    NOT_PUBLISHED = "N"
    DRAFT = "D"
    PENDING_REVIEW = "R"

    CONTENT_TYPE_CHOICES = [
        (PUBLISHED, 'Published'),
        (NOT_PUBLISHED, 'Not Published'),
        (DRAFT, 'Draft'),
        (PENDING_REVIEW, 'Pending Review'),
    ]
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    body = RichTextField()
    slug = models.SlugField(unique=True, blank=True)
    category = models.ManyToManyField(Category, related_name='blog_posts', blank=True)
    short_body = RichTextField(blank=True)
    author = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name='blog_posts')
    status = models.CharField(max_length=1, choices=CONTENT_TYPE_CHOICES, default=NOT_PUBLISHED)
    image = models.ImageField(upload_to='blog/blogpost_cover', default='default.jpg')
    datetime_created = models.DateTimeField(default=timezone.now)
    datetime_modified = models.DateTimeField(auto_now=True)
    def save(self, *args, **kwargs):
        validate_unique_title(self.title, self)
        if not self.slug or self.slug == "":
            base_slug = re.sub(r'[^-\w\s]', '', self.title)  # حذف تمامی کاراکترهای غیرمجاز
            base_slug = base_slug.replace(" ", "-")  # جایگزینی فاصله‌ها با خط تیره
            base_slug = re.sub(r'--+', '-', base_slug)  # حذف خط تیره‌های متوالی
            unique_slug = base_slug
            num = 1
            while BlogPost.objects.filter(slug=unique_slug).exists():
                unique_slug = f'{base_slug}-{num}'
                num += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('blog_detail', kwargs={'slug': self.slug})

    def __str__(self):
        return self.title




# ---------- BLOG POST MODEL ----------





class Slide(models.Model):
    title = models.CharField(max_length=200, verbose_name="عنوان")
    description = models.TextField(verbose_name="توضیحات")
    image = models.ImageField(upload_to='slides/', verbose_name="تصویر")
    link = models.URLField(blank=True, verbose_name="لینک")
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    class Meta:
        verbose_name = "اسلاید"
        verbose_name_plural = "اسلایدها"

    def __str__(self):
        return self.title

from django.db import models

class Course(models.Model):
    name = models.CharField(max_length=200, verbose_name="نام دوره")
    description = models.TextField(verbose_name="توضیحات دوره")
    image = models.ImageField(upload_to='courses/', verbose_name="تصویر دوره")
    duration = models.CharField(max_length=50, verbose_name="مدت زمان دوره")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="قیمت دوره")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    def __str__(self):
        return self.name

class CourseRegistration(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام کامل")
    email = models.EmailField(verbose_name="ایمیل")
    phone = models.CharField(max_length=15, verbose_name="شماره تماس")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name="دوره")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت نام")

    def __str__(self):
        return f"{self.name} - {self.course.name}"