from django.contrib import admin
from .models import User,Email
# Register your models here.

class UserDisplay(admin.ModelAdmin):
    list_display = ("id","first_name","last_name","username","email")
class EmailDisplay(admin.ModelAdmin):
    list_display = ("id","sender","timestamp","read")
admin.site.register(User,UserDisplay)
admin.site.register(Email,EmailDisplay)