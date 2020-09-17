from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    image = models.CharField(max_length=500,default="https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png")
    # pass


class Email(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="emails")
    sender = models.ForeignKey("User", on_delete=models.PROTECT, related_name="emails_sent")
    recipients = models.ManyToManyField("User", related_name="emails_received")
    subject = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.email,
            "sendername" : self.sender.first_name + ' ' + self.sender.last_name,
            "recipients": [user.email for user in self.recipients.all()],
            "senderpicture" : self.sender.image,
            "subject": self.subject,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%m/%d/%Y, %H:%M"),
            "read": self.read,
            "archived": self.archived
        }
