import jdatetime
from django import template

register = template.Library()

@register.filter
def to_jalali(value):
    if value:
        jalali_date = jdatetime.datetime.fromgregorian(datetime=value)
        return jalali_date.strftime('%Y/%m/%d')
    return ''
