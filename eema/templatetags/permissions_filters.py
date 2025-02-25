from django import template

register = template.Library()

@register.filter(name='has_permissions')
def has_permissions(user, perms):
    if user.is_authenticated:
        return user.has_perms(perms.split(','))
    return False
