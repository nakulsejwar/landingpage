from django.urls import path, include

urlpatterns = [

    path("api/", include("landing_ai.urls")),

]