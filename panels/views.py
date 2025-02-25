from django.contrib.auth import update_session_auth_hash
from django.http import JsonResponse
from django.contrib.auth.decorators import user_passes_test, login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, DjangoModelPermissions, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from core.models import CustomUser
from eema.models import BlogPost, Customer, Order, OrderItem
from eema.forms import BlogPostForm
from eema.serializers import BlogPostSerializer
from panels.decorators import not_admin_required
from panels.pagination import DefaultPagination
from panels.serializers import CustomUserSerializer
from accounts.forms import CustomUserChangeForm, CustomPasswordChangeForm
import jdatetime


def is_admin(user):
    return user.groups.filter(name='Admin').exists()


@login_required
@user_passes_test(is_admin)
def admin_panel(request):
    return render(request, 'admin/admin_panel.html')


@login_required
@not_admin_required
def user_panel(request):
    return render(request, 'users/user_panel.html')



class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    pagination_class = DefaultPagination

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, DjangoModelPermissions])
    def delete_user(self, request, pk=None):
        try:
            user = get_object_or_404(CustomUser, pk=pk)
            # حذف ارجاعات مرتبط در مدل Customer و Order
            customers = Customer.objects.filter(user=user)
            for customer in customers:
                Order.objects.filter(customer=customer).delete()
                customer.delete()
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @login_required
# @user_passes_test(is_admin)
# def posts_list_api(request):
#     try:
#         posts = BlogPost.objects.select_related('author').all()
#         paginator = Paginator(posts, 10)  # نمایش 10 پست در هر صفحه
#         page_number = request.GET.get('page')
#         page_obj = paginator.get_page(page_number)
#         posts_data = [
#             {
#                 'title': post.title,
#                 'author': f'{post.author.first_name} {post.author.last_name}',
#                 'datetime_created': post.datetime_created.isoformat(),
#             }
#             for post in page_obj.object_list
#         ]
#         return JsonResponse({
#             'posts': posts_data,
#             'page': page_obj.number,
#             'total_pages': paginator.num_pages,
#             'has_next': page_obj.has_next(),
#             'has_previous': page_obj.has_previous(),
#         })
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)


class PostViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post','put','patch']
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer


class AuthorListView(APIView):
    def get(self, request):
        authors = CustomUser.objects.all()
        admin_author = [author for author in authors if is_admin(author)]
        author_list = [{'id': author.id, 'full_name': author.get_full_name()} for author in admin_author]
        return Response(author_list)


@login_required
def get_admin_info(request):
    user = request.user
    date_joined_shamsi_farsi = jdatetime.datetime.fromgregorian(datetime=user.date_joined).strftime('%Y/%m/%d').replace(
        "0", "۰").replace("1", "۱").replace("2", "۲").replace("3", "۳").replace("4", "۴").replace("5", "۵").replace("6",
                                                                                                                    "۶").replace(
        "7", "۷").replace("8", "۸").replace("9", "۹")
    user_info = {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone_number': user.phone_number,
        'email': user.email,
        'date_joined': date_joined_shamsi_farsi,
    }
    return JsonResponse(user_info)


@login_required
def edit_admin_profile_ajax(request):
    if request.method == 'POST':
        form = CustomUserChangeForm(request.POST, instance=request.user)
        if form.is_valid():
            user = form.save(commit=False)
            current_password = request.POST.get('current_password')
            new_password = request.POST.get('new_password')
            if current_password and new_password:
                if check_password(current_password, user.password):
                    user.password = make_password(new_password)
                else:
                    return JsonResponse(
                        {'success': False, 'errors': {'current_password': ['پسورد فعلی صحیح نمی‌باشد.']}})
            user.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})
