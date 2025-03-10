from django import forms
from .models import BlogPost , Category, Course ,CourseRegistration

class BlogPostForm(forms.ModelForm):
    class Meta:
        model = BlogPost
        fields = ['title', 'body','short_body','category', 'author', 'image', 'status']

    image = forms.ImageField(required=False)
    category = forms.ModelMultipleChoiceField(
        queryset=Category.objects.all(),
        widget=forms.CheckboxSelectMultiple
    )



from django import forms
from .models import CourseRegistration  # مدل ثبت نام

class CourseRegistrationForm(forms.ModelForm):
    class Meta:
        model = CourseRegistration
        fields = ['name', 'email', 'phone', 'course']