# Generated by Django 5.1.5 on 2025-03-05 18:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_customuser_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='media/blog/image_avatar'),
        ),
    ]
