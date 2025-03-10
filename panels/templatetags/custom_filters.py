from django import template

register = template.Library()

@register.filter
def is_open(status):
    return status == 'open'