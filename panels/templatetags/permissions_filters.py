from django import template

register = template.Library()

@register.filter(name='has_permissions')
def has_permissions(user, perms):
    if user.is_authenticated:
        perms_list = perms.split(',')
        return all(user.has_perm(perm) for perm in perms_list)
    return False
