# Generated by Django 5.1.6 on 2025-02-28 03:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_consejonutricional_url_imagen'),
    ]

    operations = [
        migrations.AlterField(
            model_name='consejonutricional',
            name='url_imagen',
            field=models.ImageField(upload_to='imagenes/'),
        ),
    ]
