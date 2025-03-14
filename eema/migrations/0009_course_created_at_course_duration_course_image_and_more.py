# Generated by Django 5.1.5 on 2025-03-02 15:33

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eema', '0008_courseregistration'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now, verbose_name='تاریخ ایجاد'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='course',
            name='duration',
            field=models.CharField(default=1, max_length=50, verbose_name='مدت زمان دوره'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='course',
            name='image',
            field=models.ImageField(default=1, upload_to='courses/', verbose_name='تصویر دوره'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='course',
            name='price',
            field=models.DecimalField(decimal_places=2, default=2, max_digits=10, verbose_name='قیمت دوره'),
            preserve_default=False,
        ),
    ]
