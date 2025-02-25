# panels/serializers.py
from rest_framework import serializers
from core.models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name','last_name','date_joined','phone_number']
