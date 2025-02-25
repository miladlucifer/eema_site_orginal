# Generated by Django 5.1.5 on 2025-01-22 09:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eema', '0019_remove_blogpost_category_blogpost_category'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='blogpost',
            name='category',
        ),
        migrations.AddField(
            model_name='blogpost',
            name='category',
            field=models.ManyToManyField(related_name='blog_posts', to='eema.category'),
        ),
    ]
