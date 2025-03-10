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
from eema.models import BlogPost, Customer, Order, Comment
from .forms import UserProfileForm
from eema.serializers import BlogPostSerializer
from panels.decorators import not_admin_required
from panels.pagination import DefaultPagination
from panels.serializers import CustomUserSerializer
from accounts.forms import CustomUserChangeForm, CustomPasswordChangeForm
import jdatetime
from django.core.cache import cache
from core.models import CustomUser
from django.contrib.auth.decorators import login_required
from .forms import TicketForm
from .models import Ticket, Message, Department
from .forms import TicketResponseForm



def is_admin(user):
    cache_key = f'is_admin_{user.id}'
    result = cache.get(cache_key)

    if result is None:
        result = user.groups.filter(name='Admin').exists()
        cache.set(cache_key, result, timeout=60 * 5)  # کش برای ۵ دقیقه

    return result


@login_required
@user_passes_test(is_admin)
def admin_panel(request):
    return render(request, 'panels/admin/admin_panel.html')


@login_required
@not_admin_required
def user_panel(request):
    user = request.user
    total_orders = Order.objects.filter(customer=user).count()
    total_comments = Comment.objects.filter(author=user).count()
    total_messages = Message.objects.filter(user=user).count()
    open_tickets = Ticket.objects.filter(user=user, status='open').count()
    tickets = Ticket.objects.filter(user=user).order_by('-created_at')[:5]  # نمایش ۵ تیکت آخر

    context = {
        'total_orders': total_orders,
        'total_comments': total_comments,
        'total_messages': total_messages,
        'open_tickets': open_tickets,
        'tickets': tickets,
    }
    return render(request, 'users/user_panel.html', context)


@login_required
def user_profile(request):
    return render(request, 'users/user_profile.html')


@login_required
def edit_user_profile(request):
    user = request.user
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return redirect('user_profile')
    else:
        form = UserProfileForm(instance=user)
    return render(request, 'users/edit_user_profile.html', {'form': form})


@login_required
def user_orders(request):
    orders = request.user.orders.all().order_by('-date_created')
    return render(request, 'users/user_orders.html', {'orders': orders})


@login_required
def user_comments(request):
    comments = request.user.comments.all()  # فرض بر اینکه کاربر مربوط به کامنت‌ها است
    return render(request, 'users/user_comments.html', {'comments': comments})



def delete_post(request, slug):
    post = get_object_or_404(BlogPost, slug=slug)
    post.delete()
    return redirect('admin_panel')  # یا هر صفحه‌ای که می‌خواهید بعد از حذف به آن هدایت شود

def delete_post_confirmation(request, slug):
    post = get_object_or_404(BlogPost, slug=slug)
    comments = post.comments.all()
    categories = post.category.all()

    return render(request, 'panels/delete-post.html', {
        'post': post,
        'comments': comments,
        'categories': categories,
    })



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


class PostViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'patch']
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




@login_required
def create_ticket(request):
    if request.method == 'POST':
        form = TicketForm(request.POST)
        if form.is_valid():
            ticket = form.save(commit=False)
            ticket.user = request.user
            # تنظیم دپارتمان پیش‌فرض
            if not ticket.department:
                default_department = Department.objects.get(name='پشتیبانی')
                ticket.department = default_department
            ticket.save()
            return redirect('ticket_detail', ticket.id)
    else:
        form = TicketForm()
    return render(request, 'users/tickets/create_ticket.html', {'form': form})



@login_required
def ticket_detail(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id, user=request.user)
    responses = ticket.responses.all()

    if ticket.status == 'closed':
        # اگر تیکت بسته شده باشد، کاربر نمی‌تواند پیام جدید ارسال کند
        return render(request, 'users/tickets/ticket_detail.html', {
            'ticket': ticket,
            'responses': responses,
            'is_closed': True,
        })

    if request.method == 'POST':
        form = TicketResponseForm(request.POST)
        if form.is_valid():
            response = form.save(commit=False)
            response.ticket = ticket
            response.user = request.user
            response.save()
            return redirect('ticket_detail', ticket.id)
    else:
        form = TicketResponseForm()

    return render(request, 'users/tickets/ticket_detail.html', {
        'ticket': ticket,
        'responses': responses,
        'form': form,
        'is_closed': False,
    })


@login_required
def ticket_list(request):
    tickets = Ticket.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'users/tickets/ticket_list.html', {'tickets': tickets})

@login_required
def order_data(request):
    orders = request.user.orders.all()
    data = {
        'labels': [order.date_created.strftime('%Y-%m') for order in orders],
        'data': [sum(item.quantity for item in order.items.all()) for order in orders]
    }
    return JsonResponse(data)


from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from eema.models import Comment  # فرض کنید مدل کامنت‌ها را دارید


@login_required  # اطمینان حاصل کنید که کاربر لاگین کرده است
def comment_data(request):
    try:
        # گرفتن کامنت‌های کاربر فعلی
        user = request.user
        comments = Comment.objects.filter(author=user)  # استفاده از author به جای user

        # دسته‌بندی کامنت‌ها بر اساس وضعیت
        approved_count = comments.filter(status=Comment.APPROVED).count()
        waiting_count = comments.filter(status=Comment.WAITING).count()
        not_approved_count = comments.filter(status=Comment.NOT_APPROVED).count()

        # آماده‌سازی داده‌ها برای نمودار
        labels = ['منتشر شده', 'در حال بررسی', 'تایید نشده']
        data = [approved_count, waiting_count, not_approved_count]

        response_data = {
            'labels': labels,
            'data': data,
        }
        return JsonResponse(response_data)
    except Exception as e:
        # لاگ کردن خطا برای دیباگ
        print(f"Error: {e}")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)


