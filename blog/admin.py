
from ckeditor.widgets import CKEditorWidget
from django.db import models
from eema.models import BlogPost ,Category
from django.contrib import admin



class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'datetime_created')
    prepopulated_fields = {'slug': ['title',]}
    formfield_overrides = {
        models.TextField: {'widget': CKEditorWidget(config_name='default')},
    }

admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(Category)

