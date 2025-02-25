from django import forms
from .models import BlogPost , Category

class BlogPostForm(forms.ModelForm):
    class Meta:
        model = BlogPost
        fields = ['title', 'body','short_body','category', 'author', 'image', 'status']

    image = forms.ImageField(required=False)
    category = forms.ModelMultipleChoiceField(
        queryset=Category.objects.all(),
        widget=forms.CheckboxSelectMultiple
    )