
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    is_admin = models.BooleanField(default=False)
    is_user = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)

    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    def __str__(self):
        return self.email