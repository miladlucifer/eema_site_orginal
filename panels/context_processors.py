from django.contrib.auth.models import Group

def is_admin_user(request):
    if request.user.is_authenticated:
        is_admin = request.user.groups.filter(name='Admin').exists()
        return {'is_admin_user': is_admin}
    return {'is_admin_user': False}
