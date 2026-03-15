from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path("register/", RegisterUser.as_view()),

    path("login/", TokenObtainPairView.as_view()),

    path("generate/", GenerateLanding.as_view()),

    path("page/<uuid:page_id>/",
         GetLanding.as_view()),

    path("page/<uuid:page_id>/edit/",
         EditLanding.as_view()),

    path("page/<uuid:page_id>/update/",
         UpdateLanding.as_view()),

    path("page/<uuid:page_id>/delete/",
         DeletePage.as_view()),

    path("page/<uuid:page_id>/section/<str:section>/regenerate/",
         RegenerateSection.as_view()),

    path("page/<uuid:page_id>/section/delete/",
         DeleteSection.as_view()),

    path("preview-regenerate/",
         PreviewRegenerate.as_view()),

    path("my-pages/",
         UserPages.as_view()),
]