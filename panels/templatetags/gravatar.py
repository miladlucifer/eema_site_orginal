# users/templatetags/gravatar.py
import hashlib
from django import template

register = template.Library()

@register.filter
def hash(email):
    # تبدیل ایمیل به هش MD5
    return hashlib.md5(email.lower().encode('utf-8')).hexdigest()