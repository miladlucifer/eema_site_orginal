from django import forms
from eema.models import BlogPost

class BlogPostForm(forms.ModelForm):
    class Meta:
        model = BlogPost
        fields = ['title', 'body', 'short_body', 'author', 'category', 'image', 'status']

    def clean_title(self):
        title = self.cleaned_data.get('title')
        if BlogPost.objects.exclude(pk=self.instance.pk).filter(title=title).exists():
            raise forms.ValidationError('این عنوان از قبل وجود دارد.')
        return title
