from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView
from eema.models import BlogPost , Comment, Category
from django.http import JsonResponse
from .forms import BlogPostForm
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

def blog_page(request):
    return render(request, 'blog.html')



class BlogPostDetailView(DetailView):
    model = BlogPost
    template_name = 'detail_blog.html'
    context_object_name = 'post'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['comments'] = Comment.objects.filter(post=self.object)  # فقط کامنت‌های مربوط به پست فعلی
        return context


def CategoryPosts(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    posts = BlogPost.objects.filter(category=category).order_by('-datetime_created')
    return render(request, 'category_posts.html', {'category': category, 'posts': posts})



def create_blog_post(request):
    if request.method == 'POST':
        form = BlogPostForm(request.POST, request.FILES)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            if BlogPost.objects.filter(title=title).exists():
                return JsonResponse({'error': 'عنوان این پست از قبل وجود دارد.'}, status=400)
            form.save()
            return JsonResponse({'message': 'پست با موفقیت ایجاد شد.'})
        return JsonResponse({'error': 'فرم نامعتبر است.'}, status=400)
    else:
        form = BlogPostForm()
    return render(request, 'create_blog_post.html', {'form': form})

def update_blog_post(request, slug):
    blog_post = get_object_or_404(BlogPost, slug=slug)
    if request.method == 'POST':
        form = BlogPostForm(request.POST, request.FILES, instance=blog_post)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            if BlogPost.objects.filter(title=title).exclude(slug=slug).exists():
                return JsonResponse({'error': 'عنوان این پست از قبل وجود دارد.'}, status=400)
            form.save()
            return JsonResponse({'message': 'پست با موفقیت ویرایش شد.'})
        return JsonResponse({'error': 'فرم نامعتبر است.'}, status=400)
    else:
        form = BlogPostForm(instance=blog_post)
    return render(request, 'update_blog_post.html', {'form': form, 'blog_post': blog_post})

