# eema/apps.py
from django.apps import AppConfig

class EemaConfig(AppConfig):
    name = 'eema'

    def ready(self):
        import eema.signals
