from django import template

register = template.Library()

@register.filter
def total_price(order):
    return sum(item.price * item.quantity for item in order.items.all())
