# users/templatetags/jdatetime_tags.py
import jdatetime
from django import template

register = template.Library()

@register.filter
def to_jalali(value):
    # تبدیل تاریخ میلادی به شمسی
    if value:
        return jdatetime.datetime.fromgregorian(datetime=value).strftime('%Y/%m/%d')
    return value