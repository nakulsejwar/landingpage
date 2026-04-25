from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('landing_ai', '0002_landingpage_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContactFormConfig',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(default='Get In Touch', max_length=200)),
                ('subtitle', models.TextField(blank=True, default='Fill the form and we will get back to you shortly.')),
                ('submit_label', models.CharField(default='Send Message', max_length=100)),
                ('success_message', models.TextField(default="Thank you! We'll be in touch soon.")),
                ('admin_email', models.EmailField(blank=True, max_length=254)),
                ('fields_config', models.JSONField(default=list)),
                ('button_color', models.CharField(default='#22d3ee', max_length=20)),
                ('background_color', models.CharField(default='transparent', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('page', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='contact_form',
                    to='landing_ai.landingpage',
                )),
            ],
            options={
                'verbose_name': 'Contact Form Config',
                'verbose_name_plural': 'Contact Form Configs',
            },
        ),
        migrations.CreateModel(
            name='ContactFormEntry',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('data', models.JSONField(default=dict)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('form', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='entries',
                    to='landing_ai.contactformconfig',
                )),
            ],
            options={
                'verbose_name': 'Contact Form Entry',
                'verbose_name_plural': 'Contact Form Entries',
                'ordering': ['-submitted_at'],
            },
        ),
    ]
