from django.db import models
from django.conf import settings


class Department(models.Model):
    name = models.CharField(max_length=100, verbose_name='نام دپارتمان')
    description = models.TextField(verbose_name='توضیحات', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'دپارتمان'
        verbose_name_plural = 'دپارتمان‌ها'

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'باز'),
        ('in_progress', 'در حال بررسی'),
        ('closed', 'بسته'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='tickets', verbose_name='دپارتمان')
    subject = models.CharField(max_length=200, verbose_name='موضوع')
    message = models.TextField(verbose_name='پیام')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', verbose_name='وضعیت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ به‌روزرسانی')

    def __str__(self):
        return f"تیکت #{self.id} - {self.subject}"


class TicketResponse(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='کاربر')
    message = models.TextField(verbose_name='پیام')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')

    def __str__(self):
        return f"Response to Ticket #{self.ticket.id}"

    class Meta:
        verbose_name = 'پاسخ تیکت'
        verbose_name_plural = 'پاسخ‌های تیکت'


class Message(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages')
    subject = models.CharField(max_length=200, verbose_name='موضوع')
    body = models.TextField(verbose_name='متن پیام')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    is_read = models.BooleanField(default=False, verbose_name='خوانده شده')

    def __str__(self):
        return f"پیام از {self.user.username} - {self.subject}"

    class Meta:
        verbose_name = 'پیام'
        verbose_name_plural = 'پیام‌ها'



