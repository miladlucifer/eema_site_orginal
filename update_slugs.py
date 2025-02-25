from eema.models import BlogPost
from django.utils.text import slugify

def update_slugs():
    posts = BlogPost.objects.all()
    for post in posts:
        if not post.slug:  # فقط اگر slug موجود نیست
            base_slug = slugify(post.title)
            unique_slug = base_slug
            num = 1
            while BlogPost.objects.filter(slug=unique_slug).exclude(pk=post.pk).exists():
                unique_slug = f'{base_slug}-{num}'
                num += 1
            post.slug = unique_slug
            post.save()

update_slugs()
