from django.contrib import admin
from django.db.models import Count

from . import models
from .models import OrderItem

from django.contrib import admin
from .models import BlogPost


@admin.register(models.Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone_number')
    list_per_page = 10
    ordering = ('user__last_name', 'user__first_name',)
    search_fields = ('user__first_name__istartswith', 'user__last_name__istartswith')

    def first_name(self, customer):
        return customer.user.first_name

    def last_name(self, customer):
        return customer.user.last_name

    def email(self, customer):
        return customer.user.email


admin.site.register(models.Address)


class inventoryFilter(admin.SimpleListFilter):
    LESS_THAN_3 = '<3'
    BETWEEN_3_AND_10 = '3<=10'
    MORE_THAN_10 = '>10'

    title = 'inventory status'
    parameter_name = 'inventory'

    def lookups(self, request, model_admin):
        return (
            (self.LESS_THAN_3, 'Low'),
            (self.BETWEEN_3_AND_10, 'Medium'),
            (self.MORE_THAN_10, 'High'),
        )

    def queryset(self, request, queryset):
        if self.value() == self.LESS_THAN_3:
            return queryset.filter(inventory__lt=3)
        if self.value() == self.BETWEEN_3_AND_10:
            return queryset.filter(inventory__range=(3, 10))
        if self.value() == self.MORE_THAN_10:
            return queryset.filter(inventory__gt=10)


@admin.register(models.Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'unit_price', 'comments', 'inventory_status', 'category__title', 'inventory')
    list_per_page = 10
    list_select_related = ['category']
    list_filter = [inventoryFilter]
    search_fields = ['name']
    prepopulated_fields = {'slug': ['name', ]}

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('comments').annotate(
            comments_items=Count('comments')
        )

    @admin.display(ordering='comments')
    def comments(self, product):
        return product.comments.count()

    def inventory_status(self, product):
        if product.inventory < 3:
            return 'Low'
        if product.inventory > 50:
            return 'High'
        return 'Medium'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    fields = ('product', 'quantity', 'price')


@admin.register(models.Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'date_created', 'num_of_items')
    list_editable = ['status']
    list_per_page = 10
    ordering = ['-date_created']
    inlines = [OrderItemInline]

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items').annotate(
            items_count=Count('items')
        )

    @admin.display(ordering='items_count')
    def num_of_items(self, order):
        return order.items.count()


@admin.register(models.OrderItem)
class OrderItem(admin.ModelAdmin):
    list_display = ['order', 'product__name', 'quantity', 'price']


@admin.register(models.Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'body', 'status', 'product__name']
    list_editable = ['status']
    list_per_page = 10
    list_select_related = ['product']
