# Generated by Django 5.1.5 on 2025-02-28 11:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eema', '0004_alter_order_customer'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('P', 'پرداخت شده'), ('U', 'پرداخت نشده'), ('C', 'لغو شده')], default='U', max_length=1),
        ),
    ]
