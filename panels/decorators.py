# panels/decorators.py
from django.contrib.auth.decorators import user_passes_test

def is_not_admin(user):
    return not user.groups.filter(name='Admin').exists()

not_admin_required = user_passes_test(is_not_admin)
